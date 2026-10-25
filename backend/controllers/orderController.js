import { pool } from '../db.js';

export const createOrder = async (req, res) => {
  const buyerId = req.user.id;
  const {
    items, // Array of { productId, quantity }
    delivery_address_id,
    custom_address,
    payment_method = 'cash_on_delivery',
    buyer_notes
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Resolve Delivery Address Snapshot
    let addressSnapshot = '';
    let addressId = delivery_address_id || null;

    if (addressId) {
      const [addrRows] = await connection.query(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, buyerId]
      );
      if (addrRows.length > 0) {
        const a = addrRows[0];
        addressSnapshot = `${a.recipient_name}, ${a.address_line1}${a.address_line2 ? ', ' + a.address_line2 : ''}, ${a.village_or_town}, ${a.taluk}, ${a.district}, Karnataka - ${a.pincode}. Phone: ${a.recipient_phone}`;
      }
    }

    if (!addressSnapshot && custom_address) {
      addressSnapshot = `${custom_address.recipient_name}, ${custom_address.address_line1}, ${custom_address.village_or_town || ''}, ${custom_address.taluk || ''}, ${custom_address.district || ''}, Karnataka - ${custom_address.pincode || ''}. Phone: ${custom_address.recipient_phone || req.user.phone}`;
      
      // Optionally save to addresses table if requested
      if (custom_address.save_address) {
        const [savedAddr] = await connection.query(
          `INSERT INTO addresses (user_id, title, recipient_name, recipient_phone, address_line1, address_line2, village_or_town, taluk, district, pincode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            buyerId,
            custom_address.title || 'Delivery Address',
            custom_address.recipient_name,
            custom_address.recipient_phone || req.user.phone,
            custom_address.address_line1,
            custom_address.address_line2 || null,
            custom_address.village_or_town || 'Unknown',
            custom_address.taluk || 'Unknown',
            custom_address.district || 'Karnataka',
            custom_address.pincode || '560001'
          ]
        );
        addressId = savedAddr.insertId;
      }
    }

    if (!addressSnapshot) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Valid delivery address is required.' });
    }

    // 2. Fetch all products with FOR UPDATE lock to verify server-side price and available quantity
    const productIds = items.map(i => parseInt(i.productId, 10)).filter(id => !isNaN(id));
    if (productIds.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid product IDs in order request.' });
    }

    const [dbProducts] = await connection.query(
      `SELECT id, farmer_id, title_en, title_kn, price_per_unit, available_quantity, min_order_quantity, status
       FROM product_listings
       WHERE id IN (?)
       FOR UPDATE`,
      [productIds]
    );

    const productMap = new Map();
    dbProducts.forEach(p => productMap.set(p.id, p));

    // Validate quantities, prices, minimum order quantities
    // Group items by farmer_id so each farmer gets an independent order!
    const ordersByFarmer = new Map();

    for (const item of items) {
      const pid = parseInt(item.productId, 10);
      const reqQty = Number(item.quantity);
      const dbProd = productMap.get(pid);

      if (!dbProd) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Product ID ${pid} not found.` });
      }

      if (dbProd.status !== 'active') {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Product "${dbProd.title_en}" is currently not active for sale.` });
      }

      if (isNaN(reqQty) || reqQty <= 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Invalid quantity for "${dbProd.title_en}".` });
      }

      if (reqQty < Number(dbProd.min_order_quantity)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for "${dbProd.title_en}" is ${dbProd.min_order_quantity}.`
        });
      }

      if (reqQty > Number(dbProd.available_quantity)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProd.title_en}". Available: ${dbProd.available_quantity}, Requested: ${reqQty}.`
        });
      }

      const farmerId = dbProd.farmer_id;
      if (!ordersByFarmer.has(farmerId)) {
        ordersByFarmer.set(farmerId, []);
      }

      const itemSubtotal = Number((reqQty * Number(dbProd.price_per_unit)).toFixed(2));
      ordersByFarmer.get(farmerId).push({
        productId: pid,
        product: dbProd,
        quantity: reqQty,
        unitPrice: Number(dbProd.price_per_unit),
        subtotal: itemSubtotal
      });
    }

    const createdOrders = [];
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    // 3. Create order for each farmer and decrement inventory
    for (const [farmerId, farmerItems] of ordersByFarmer.entries()) {
      const orderTotal = farmerItems.reduce((acc, it) => acc + it.subtotal, 0);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `FOG-${dateStr}-${randomSuffix}`;

      const [orderResult] = await connection.query(
        `INSERT INTO orders 
         (order_code, buyer_id, farmer_id, delivery_address_id, delivery_address_snapshot, total_amount, payment_method, payment_status, order_status, buyer_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'placed', ?)`,
        [orderCode, buyerId, farmerId, addressId, addressSnapshot, orderTotal, payment_method, buyer_notes || null]
      );

      const orderId = orderResult.insertId;

      for (const item of farmerItems) {
        // Insert order item
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, product_title_snapshot, unit_price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.product.title_en, item.unitPrice, item.quantity, item.subtotal]
        );

        // Decrement stock atomically
        const newAvailable = Number(item.product.available_quantity) - item.quantity;
        const newStatus = newAvailable <= 0 ? 'sold_out' : 'active';

        await connection.query(
          `UPDATE product_listings 
           SET available_quantity = ?, status = ?
           WHERE id = ?`,
          [newAvailable, newStatus, item.productId]
        );
      }

      // Send notification to Farmer
      await connection.query(
        `INSERT INTO notifications (user_id, title_en, title_kn, message_en, message_kn, type, link_url)
         VALUES (?, ?, ?, ?, ?, 'order_update', ?)`,
        [
          farmerId,
          `New Order Received (${orderCode})`,
          `ಹೊಸ ಆದೇಶ ಬಂದಿದೆ (${orderCode})`,
          `A new order of ₹${orderTotal} was placed by ${req.user.full_name}. Please prepare for harvest/packaging.`,
          `${req.user.full_name} ಅವರಿಂದ ₹${orderTotal} ಮೌಲ್ಯದ ಹೊಸ ಆದೇಶ ಬಂದಿದೆ. ದಯವಿಟ್ಟು ಸಿದ್ಧಪಡಿಸಿ.`,
          '/farmer/orders'
        ]
      );

      createdOrders.push({ orderId, orderCode, totalAmount: orderTotal });
    }

    // Send confirmation notification to Buyer
    await connection.query(
      `INSERT INTO notifications (user_id, title_en, title_kn, message_en, message_kn, type, link_url)
       VALUES (?, ?, ?, ?, ?, 'order_update', ?)`,
      [
        buyerId,
        'Order Placed Successfully',
        'ಆದೇಶವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಇರಿಸಲಾಗಿದೆ',
        `Your order(s) have been placed with farmers via Cash on Delivery. Total: ₹${createdOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}`,
        'ರೈತರೊಂದಿಗೆ ನಿಮ್ಮ ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿದೆ (ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ).',
        '/buyer/orders'
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      orders: createdOrders
    });
  } catch (error) {
    await connection.rollback();
    console.error('createOrder error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process order. ' + (error.message || '') });
  } finally {
    connection.release();
  }
};

export const getMyBuyerOrders = async (req, res) => {
  const buyerId = req.user.id;

  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.order_code, o.farmer_id, o.total_amount, o.payment_method, o.payment_status,
              o.order_status, o.delivery_address_snapshot, o.buyer_notes, o.cancellation_reason, o.created_at,
              u.full_name AS farmer_name, u.phone AS farmer_phone,
              fp.farm_name, fp.district AS farm_district
       FROM orders o
       JOIN users u ON o.farmer_id = u.id
       JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC`,
      [buyerId]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.product_id, oi.product_title_snapshot, oi.unit_price, oi.quantity, oi.subtotal,
                p.unit, p.image_url,
                (SELECT id FROM reviews r WHERE r.order_id = oi.order_id AND r.product_id = oi.product_id) AS existing_review_id
         FROM order_items oi
         LEFT JOIN product_listings p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('getMyBuyerOrders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.order_code, o.buyer_id, o.farmer_id, o.total_amount, o.payment_method, o.payment_status,
              o.order_status, o.delivery_address_snapshot, o.buyer_notes, o.cancellation_reason, o.created_at, o.updated_at,
              b.full_name AS buyer_name, b.email AS buyer_email, b.phone AS buyer_phone,
              f.full_name AS farmer_name, f.phone AS farmer_phone,
              fp.farm_name, fp.district AS farm_district, fp.taluk AS farm_taluk, fp.village AS farm_village
       FROM orders o
       JOIN users b ON o.buyer_id = b.id
       JOIN users f ON o.farmer_id = f.id
       JOIN farmer_profiles fp ON f.id = fp.user_id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Authorization check: only buyer, farmer, or admin can access
    if (role !== 'admin' && order.buyer_id !== userId && order.farmer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied to this order.' });
    }

    const [items] = await pool.query(
      `SELECT oi.id, oi.product_id, oi.product_title_snapshot, oi.unit_price, oi.quantity, oi.subtotal,
              p.unit, p.image_url
       FROM order_items oi
       LEFT JOIN product_listings p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { order_status, cancellation_reason } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  const validStatuses = ['placed', 'confirmed', 'harvesting_packed', 'in_transit', 'delivered', 'cancelled'];
  if (!validStatuses.includes(order_status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Farmer or admin can change status; buyer can only cancel if status is 'placed'
    if (role === 'buyer') {
      if (order.buyer_id !== userId) {
        await connection.rollback();
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (order_status !== 'cancelled') {
        await connection.rollback();
        return res.status(403).json({ success: false, message: 'Buyers can only cancel placed orders.' });
      }
      if (order.order_status !== 'placed') {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Order cannot be cancelled after confirmation.' });
      }
    } else if (role === 'farmer') {
      if (order.farmer_id !== userId) {
        await connection.rollback();
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    // If status is transitioning to cancelled, restore stock!
    if (order_status === 'cancelled' && order.order_status !== 'cancelled') {
      const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        await connection.query(
          `UPDATE product_listings
           SET available_quantity = available_quantity + ?,
               status = CASE WHEN status = 'sold_out' THEN 'active' ELSE status END
           WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }
    }

    // If delivered, mark payment_status as paid if cash_on_delivery
    let paymentStatus = order.payment_status;
    if (order_status === 'delivered') {
      paymentStatus = 'paid';
    } else if (order_status === 'cancelled') {
      paymentStatus = 'cancelled';
    }

    await connection.query(
      `UPDATE orders 
       SET order_status = ?, payment_status = ?, cancellation_reason = COALESCE(?, cancellation_reason)
       WHERE id = ?`,
      [order_status, paymentStatus, cancellation_reason || null, id]
    );

    // Notify counterpart
    const notifyTarget = (role === 'farmer' || role === 'admin') ? order.buyer_id : order.farmer_id;
    await connection.query(
      `INSERT INTO notifications (user_id, title_en, title_kn, message_en, message_kn, type, link_url)
       VALUES (?, ?, ?, ?, ?, 'order_update', ?)`,
      [
        notifyTarget,
        `Order ${order.order_code} Status: ${order_status}`,
        `ಆದೇಶ ${order.order_code} ಸ್ಥಿತಿ: ${order_status}`,
        `Your order ${order.order_code} is now marked as ${order_status}.`,
        `ನಿಮ್ಮ ಆದೇಶ ${order.order_code} ಈಗ ${order_status} ಆಗಿದೆ.`,
        role === 'farmer' ? '/buyer/orders' : '/farmer/orders'
      ]
    );

    await connection.commit();
    return res.status(200).json({ success: true, message: `Order updated to ${order_status}.` });
  } catch (error) {
    await connection.rollback();
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  } finally {
    connection.release();
  }
};
