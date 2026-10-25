import { pool } from '../db.js';

export const createComplaint = async (req, res) => {
  const userId = req.user.id;
  const { order_id, subject, description, category = 'quality_issue' } = req.body;

  if (!subject || !description) {
    return res.status(400).json({ success: false, message: 'Subject and detailed description are required.' });
  }

  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const ticketNumber = `CMP-${dateStr}-${randomSuffix}`;

    const [result] = await pool.query(
      `INSERT INTO complaints (ticket_number, user_id, order_id, subject, description, category, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [ticketNumber, userId, order_id || null, subject.trim(), description.trim(), category]
    );

    return res.status(201).json({
      success: true,
      message: 'Complaint ticket submitted. Support will investigate.',
      ticketNumber,
      complaintId: result.insertId
    });
  } catch (error) {
    console.error('createComplaint error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit complaint.' });
  }
};

export const getMyComplaints = async (req, res) => {
  const userId = req.user.id;

  try {
    const [complaints] = await pool.query(
      `SELECT c.*, o.order_code
       FROM complaints c
       LEFT JOIN orders o ON c.order_id = o.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return res.status(200).json({ success: true, complaints });
  } catch (error) {
    console.error('getMyComplaints error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaints.' });
  }
};
