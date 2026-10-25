import { pool } from '../db.js';

export const getFarmerPublicProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const [farmerRows] = await pool.query(
      `SELECT u.id, u.full_name, u.created_at AS member_since,
              fp.farm_name, fp.experience_years, fp.state, fp.district, fp.taluk, fp.village,
              fp.farm_size_acres, fp.primary_crops, fp.verification_status, fp.bio, fp.profile_image_url
       FROM users u
       JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE u.id = ? AND u.role = 'farmer'`,
      [id]
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    const farmer = farmerRows[0];

    // Fetch active products
    const [products] = await pool.query(
      `SELECT p.id, p.title_en, p.title_kn, p.price_per_unit, p.unit, p.available_quantity,
              p.quality_grade, p.farming_method, p.harvest_date, p.image_url,
              c.name_en AS category_name_en, c.name_kn AS category_name_kn
       FROM product_listings p
       JOIN categories c ON p.category_id = c.id
       WHERE p.farmer_id = ? AND p.status = 'active'
       ORDER BY p.created_at DESC`,
      [id]
    );

    // Fetch farmer overall ratings
    const [ratingRows] = await pool.query(
      `SELECT COUNT(r.id) AS total_reviews, COALESCE(AVG(r.rating), 0) AS average_rating
       FROM reviews r
       WHERE r.farmer_id = ? AND r.is_approved = TRUE`,
      [id]
    );

    return res.status(200).json({
      success: true,
      farmer: {
        ...farmer,
        rating: ratingRows[0],
        products
      }
    });
  } catch (error) {
    console.error('getFarmerPublicProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve farmer profile.' });
  }
};

export const getMyListings = async (req, res) => {
  const farmerId = req.user.id;

  try {
    const [listings] = await pool.query(
      `SELECT p.id, p.category_id, p.title_en, p.title_kn, p.description, p.unit,
              p.price_per_unit, p.available_quantity, p.min_order_quantity,
              p.quality_grade, p.farming_method, p.harvest_date,
              p.location_district, p.location_taluk, p.location_village,
              p.image_url, p.status, p.created_at, p.updated_at,
              c.name_en AS category_name_en, c.name_kn AS category_name_kn
       FROM product_listings p
       JOIN categories c ON p.category_id = c.id
       WHERE p.farmer_id = ?
       ORDER BY p.created_at DESC`,
      [farmerId]
    );

    return res.status(200).json({ success: true, listings });
  } catch (error) {
    console.error('getMyListings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your listings.' });
  }
};

export const getMyFarmerOrders = async (req, res) => {
  const farmerId = req.user.id;

  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.order_code, o.buyer_id, o.total_amount, o.payment_method, o.payment_status,
              o.order_status, o.delivery_address_snapshot, o.buyer_notes, o.created_at,
              u.full_name AS buyer_name, u.phone AS buyer_phone, u.buyer_type
       FROM orders o
       JOIN users u ON o.buyer_id = u.id
       WHERE o.farmer_id = ?
       ORDER BY o.created_at DESC`,
      [farmerId]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.product_id, oi.product_title_snapshot, oi.unit_price, oi.quantity, oi.subtotal,
                p.unit
         FROM order_items oi
         LEFT JOIN product_listings p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('getMyFarmerOrders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

export const getFarmerStats = async (req, res) => {
  const farmerId = req.user.id;

  try {
    const [listingStats] = await pool.query(
      `SELECT 
         COUNT(*) AS total_products,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_products,
         SUM(CASE WHEN available_quantity <= 5 AND status = 'active' THEN 1 ELSE 0 END) AS low_stock_products
       FROM product_listings
       WHERE farmer_id = ?`,
      [farmerId]
    );

    const [orderStats] = await pool.query(
      `SELECT 
         COUNT(*) AS total_orders,
         SUM(CASE WHEN order_status = 'placed' THEN 1 ELSE 0 END) AS pending_orders,
         SUM(CASE WHEN order_status = 'delivered' THEN total_amount ELSE 0 END) AS total_revenue
       FROM orders
       WHERE farmer_id = ?`,
      [farmerId]
    );

    const [verif] = await pool.query(
      'SELECT verification_status FROM farmer_profiles WHERE user_id = ?',
      [farmerId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        products: listingStats[0],
        orders: orderStats[0],
        verification_status: verif[0]?.verification_status || 'unverified'
      }
    });
  } catch (error) {
    console.error('getFarmerStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
};

export const submitVerification = async (req, res) => {
  const farmerId = req.user.id;
  const { document_type, document_number, submitted_notes } = req.body;

  if (!document_type || !document_number) {
    return res.status(400).json({ success: false, message: 'Document type and document number are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO verification_records (farmer_id, document_type, document_number, submitted_notes, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [farmerId, document_type.trim(), document_number.trim(), submitted_notes || null]
    );

    await connection.query(
      `UPDATE farmer_profiles 
       SET verification_status = 'pending',
           id_proof_type = ?,
           id_proof_number = ?
       WHERE user_id = ?`,
      [document_type.trim(), document_number.trim(), farmerId]
    );

    // Notify farmer
    await connection.query(
      `INSERT INTO notifications (user_id, title_en, title_kn, message_en, message_kn, type)
       VALUES (?, ?, ?, ?, ?, 'verification')`,
      [
        farmerId,
        'Verification Documents Submitted',
        'ಪರಿಶೀಲನಾ ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ',
        'Your verification documents have been received and sent for administrative review.',
        'ನಿಮ್ಮ ಪರಿಶೀಲನಾ ದಾಖಲೆಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಆಡಳಿತಾತ್ಮಕ ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.'
      ]
    );

    await connection.commit();
    return res.status(201).json({ success: true, message: 'Verification documents submitted for admin approval.' });
  } catch (error) {
    await connection.rollback();
    console.error('submitVerification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit verification.' });
  } finally {
    connection.release();
  }
};
