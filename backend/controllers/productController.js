import { pool } from '../db.js';
import { validateProduct } from '../validators/index.js';

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      district,
      search,
      minPrice,
      maxPrice,
      qualityGrade,
      farmingMethod,
      sort = 'newest',
      page = 1,
      limit = 24
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const params = [];
    let whereConditions = ["p.status = 'active'"];

    if (category) {
      if (isNaN(category)) {
        whereConditions.push('c.slug = ?');
      } else {
        whereConditions.push('p.category_id = ?');
      }
      params.push(category);
    }

    if (district) {
      whereConditions.push('p.location_district = ?');
      params.push(district);
    }

    if (search) {
      whereConditions.push('(p.title_en LIKE ? OR p.title_kn LIKE ? OR p.description LIKE ? OR p.location_taluk LIKE ? OR p.location_village LIKE ? OR fp.farm_name LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term, term);
    }

    if (minPrice && !isNaN(minPrice)) {
      whereConditions.push('p.price_per_unit >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice && !isNaN(maxPrice)) {
      whereConditions.push('p.price_per_unit <= ?');
      params.push(Number(maxPrice));
    }

    if (qualityGrade) {
      whereConditions.push('p.quality_grade = ?');
      params.push(qualityGrade);
    }

    if (farmingMethod) {
      whereConditions.push('p.farming_method = ?');
      params.push(farmingMethod);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price_per_unit ASC';
    else if (sort === 'price_desc') orderBy = 'p.price_per_unit DESC';
    else if (sort === 'harvest_date') orderBy = 'p.harvest_date DESC';
    else if (sort === 'rating') orderBy = 'farmer_rating DESC';

    // Count total
    const countSql = `
      SELECT COUNT(*) as total
      FROM product_listings p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.farmer_id = u.id
      JOIN farmer_profiles fp ON u.id = fp.user_id
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    // Fetch listings
    const querySql = `
      SELECT p.id, p.farmer_id, p.category_id, p.title_en, p.title_kn, p.description,
             p.unit, p.price_per_unit, p.available_quantity, p.min_order_quantity,
             p.quality_grade, p.farming_method, p.harvest_date,
             p.location_district, p.location_taluk, p.location_village, p.image_url, p.status, p.created_at,
             c.name_en AS category_name_en, c.name_kn AS category_name_kn, c.slug AS category_slug,
             u.full_name AS farmer_name,
             fp.farm_name, fp.verification_status,
             COALESCE(AVG(r.rating), 0) AS average_rating,
             COUNT(r.id) AS review_count
      FROM product_listings p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.farmer_id = u.id
      JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [products] = await pool.query(querySql, [...params, parseInt(limit, 10), offset]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      products
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT location_district AS district, COUNT(*) AS count
       FROM product_listings
       WHERE status = 'active'
       GROUP BY location_district
       ORDER BY count DESC, location_district ASC`
    );
    return res.status(200).json({ success: true, districts: rows });
  } catch (error) {
    console.error('getDistricts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve districts.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT p.id, p.farmer_id, p.category_id, p.title_en, p.title_kn, p.description,
              p.unit, p.price_per_unit, p.available_quantity, p.min_order_quantity,
              p.quality_grade, p.farming_method, p.harvest_date,
              p.location_district, p.location_taluk, p.location_village, p.image_url, p.status, p.created_at,
              c.name_en AS category_name_en, c.name_kn AS category_name_kn, c.slug AS category_slug,
              u.full_name AS farmer_name, u.phone AS farmer_phone,
              fp.farm_name, fp.experience_years, fp.verification_status, fp.bio AS farmer_bio,
              fp.district AS farmer_district, fp.taluk AS farmer_taluk, fp.village AS farmer_village,
              COALESCE(AVG(r.rating), 0) AS average_rating,
              COUNT(r.id) AS review_count
       FROM product_listings p
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.farmer_id = u.id
       JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product listing not found.' });
    }

    const product = rows[0];

    // Fetch price history
    const [priceHistory] = await pool.query(
      `SELECT old_price, new_price, change_reason, changed_at
       FROM price_history
       WHERE product_id = ?
       ORDER BY changed_at DESC`,
      [id]
    );

    // Fetch recent reviews
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS buyer_name
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.product_id = ? AND r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    return res.status(200).json({
      success: true,
      product: {
        ...product,
        price_history: priceHistory,
        reviews
      }
    });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
};

export const createProduct = async (req, res) => {
  const farmerId = req.user.id;
  const validation = validateProduct(req.body);

  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
  }

  const {
    category_id,
    title_en,
    title_kn,
    description,
    unit = 'kg',
    price_per_unit,
    available_quantity,
    min_order_quantity = 1.00,
    quality_grade = 'Grade A (Premium)',
    farming_method = 'Traditional Conventional',
    harvest_date,
    location_district,
    location_taluk,
    location_village,
    image_url
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO product_listings 
       (farmer_id, category_id, title_en, title_kn, description, unit, price_per_unit, available_quantity, min_order_quantity, quality_grade, farming_method, harvest_date, location_district, location_taluk, location_village, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        farmerId,
        category_id,
        title_en.trim(),
        title_kn.trim(),
        description.trim(),
        unit,
        Number(price_per_unit),
        Number(available_quantity),
        Number(min_order_quantity),
        quality_grade,
        farming_method,
        harvest_date,
        location_district.trim(),
        location_taluk.trim(),
        location_village.trim(),
        image_url || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully.',
      productId: result.insertId
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product listing.' });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const farmerId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    // Check ownership
    const [existing] = await pool.query('SELECT * FROM product_listings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product listing not found.' });
    }

    const currentProduct = existing[0];
    if (!isAdmin && currentProduct.farmer_id !== farmerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only edit your own listings.' });
    }

    const {
      category_id = currentProduct.category_id,
      title_en = currentProduct.title_en,
      title_kn = currentProduct.title_kn,
      description = currentProduct.description,
      unit = currentProduct.unit,
      price_per_unit = currentProduct.price_per_unit,
      available_quantity = currentProduct.available_quantity,
      min_order_quantity = currentProduct.min_order_quantity,
      quality_grade = currentProduct.quality_grade,
      farming_method = currentProduct.farming_method,
      harvest_date = currentProduct.harvest_date,
      location_district = currentProduct.location_district,
      location_taluk = currentProduct.location_taluk,
      location_village = currentProduct.location_village,
      image_url = currentProduct.image_url,
      status = currentProduct.status,
      price_change_reason
    } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if price changed
      const oldPrice = Number(currentProduct.price_per_unit);
      const newPrice = Number(price_per_unit);
      if (Math.abs(oldPrice - newPrice) > 0.01) {
        await connection.query(
          `INSERT INTO price_history (product_id, old_price, new_price, change_reason)
           VALUES (?, ?, ?, ?)`,
          [id, oldPrice, newPrice, price_change_reason || 'Updated by farmer']
        );
      }

      await connection.query(
        `UPDATE product_listings
         SET category_id = ?, title_en = ?, title_kn = ?, description = ?, unit = ?,
             price_per_unit = ?, available_quantity = ?, min_order_quantity = ?,
             quality_grade = ?, farming_method = ?, harvest_date = ?,
             location_district = ?, location_taluk = ?, location_village = ?,
             image_url = ?, status = ?
         WHERE id = ?`,
        [
          category_id,
          title_en.trim(),
          title_kn.trim(),
          description.trim(),
          unit,
          newPrice,
          Number(available_quantity),
          Number(min_order_quantity),
          quality_grade,
          farming_method,
          harvest_date,
          location_district.trim(),
          location_taluk.trim(),
          location_village.trim(),
          image_url,
          status,
          id
        ]
      );

      await connection.commit();
      return res.status(200).json({ success: true, message: 'Product listing updated successfully.' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

export const updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const farmerId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!['active', 'sold_out', 'inactive', 'unlisted'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    const [existing] = await pool.query('SELECT farmer_id FROM product_listings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product listing not found.' });
    }

    if (!isAdmin && existing[0].farmer_id !== farmerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only modify your own listings.' });
    }

    await pool.query('UPDATE product_listings SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({ success: true, message: `Product status updated to ${status}.` });
  } catch (error) {
    console.error('updateProductStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};
