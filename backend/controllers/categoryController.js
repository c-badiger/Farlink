import { pool } from '../db.js';

export const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.id, c.name_en, c.name_kn, c.slug, c.description, c.icon_name,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN product_listings p ON c.id = p.category_id AND p.status = 'active'
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.id ASC`
    );

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};
