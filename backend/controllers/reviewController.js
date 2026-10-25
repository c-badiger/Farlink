import { pool } from '../db.js';

export const submitReview = async (req, res) => {
  const buyerId = req.user.id;
  const { order_id, product_id, rating, comment } = req.body;

  if (!order_id || !product_id || !rating) {
    return res.status(400).json({ success: false, message: 'Order ID, product ID, and rating (1-5) are required.' });
  }

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    // Verify eligibility: check that the order belongs to this buyer, is delivered, and contains the product
    const [orders] = await pool.query(
      `SELECT o.id, o.farmer_id, o.order_status
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ? AND o.buyer_id = ? AND oi.product_id = ?`,
      [order_id, buyerId, product_id]
    );

    if (orders.length === 0) {
      return res.status(400).json({ success: false, message: 'You can only review products from your own purchases.' });
    }

    const order = orders[0];
    if (order.order_status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can submit a review only after the order is delivered.' });
    }

    // Check if review already submitted
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE order_id = ? AND product_id = ?',
      [order_id, product_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this purchase.' });
    }

    await pool.query(
      `INSERT INTO reviews (order_id, product_id, buyer_id, farmer_id, rating, comment, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [order_id, product_id, buyerId, order.farmer_id, numRating, comment || null]
    );

    return res.status(201).json({ success: true, message: 'Review submitted successfully.' });
  } catch (error) {
    console.error('submitReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS buyer_name
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.product_id = ? AND r.is_approved = TRUE
       ORDER BY r.created_at DESC`,
      [productId]
    );

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('getProductReviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
};
