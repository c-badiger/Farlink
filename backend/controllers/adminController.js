import { pool } from '../db.js';

export const getAdminStats = async (req, res) => {
  try {
    const [userCounts] = await pool.query(
      `SELECT 
         COUNT(*) AS total_users,
         SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) AS total_farmers,
         SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) AS total_buyers
       FROM users`
    );

    const [verifCounts] = await pool.query(
      `SELECT 
         SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) AS verified_farmers,
         SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) AS pending_verifications
       FROM farmer_profiles`
    );

    const [productCounts] = await pool.query(
      `SELECT 
         COUNT(*) AS total_listings,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_listings
       FROM product_listings`
    );

    const [orderCounts] = await pool.query(
      `SELECT 
         COUNT(*) AS total_orders,
         COALESCE(SUM(total_amount), 0) AS total_trade_volume,
         SUM(CASE WHEN order_status = 'delivered' THEN total_amount ELSE 0 END) AS settled_trade_volume,
         SUM(CASE WHEN order_status = 'placed' THEN 1 ELSE 0 END) AS open_orders
       FROM orders`
    );

    const [complaintCounts] = await pool.query(
      `SELECT 
         COUNT(*) AS total_complaints,
         SUM(CASE WHEN status IN ('open', 'investigating') THEN 1 ELSE 0 END) AS unresolved_complaints
       FROM complaints`
    );

    return res.status(200).json({
      success: true,
      stats: {
        users: userCounts[0],
        verifications: verifCounts[0],
        products: productCounts[0],
        orders: orderCounts[0],
        complaints: complaintCounts[0]
      }
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve administrative statistics.' });
  }
};

export const getUsers = async (req, res) => {
  const { role, status, search, page = 1, limit = 50 } = req.query;
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const conditions = [];
  const params = [];

  if (role) {
    conditions.push('u.role = ?');
    params.push(role);
  }
  if (status) {
    conditions.push('u.status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR fp.farm_name LIKE ?)');
    const t = `%${search.trim()}%`;
    params.push(t, t, t, t);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [users] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.buyer_type, u.status, u.created_at,
              fp.farm_name, fp.district, fp.taluk, fp.village, fp.verification_status,
              bp.business_name
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({ success: true, message: `User status changed to ${status}.` });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

export const getVerifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT vr.*, u.full_name AS farmer_name, u.phone AS farmer_phone, u.email AS farmer_email,
              fp.farm_name, fp.district, fp.taluk, fp.village, fp.farm_size_acres
       FROM verification_records vr
       JOIN users u ON vr.farmer_id = u.id
       JOIN farmer_profiles fp ON u.id = fp.user_id
       ORDER BY vr.created_at DESC`
    );

    return res.status(200).json({ success: true, verifications: rows });
  } catch (error) {
    console.error('getVerifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve verifications.' });
  }
};

export const reviewVerification = async (req, res) => {
  const { id } = req.params; // verification record id
  const adminId = req.user.id;
  const { status, admin_notes } = req.body; // status: 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rec] = await connection.query('SELECT farmer_id FROM verification_records WHERE id = ?', [id]);
    if (rec.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Verification record not found.' });
    }

    const farmerId = rec[0].farmer_id;
    const newProfileStatus = status === 'approved' ? 'verified' : 'rejected';

    await connection.query(
      `UPDATE verification_records 
       SET status = ?, reviewed_by = ?, admin_notes = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, adminId, admin_notes || null, id]
    );

    await connection.query(
      `UPDATE farmer_profiles 
       SET verification_status = ?
       WHERE user_id = ?`,
      [newProfileStatus, farmerId]
    );

    const titleEn = status === 'approved' ? 'Farmer Verification Approved!' : 'Farmer Verification Update';
    const titleKn = status === 'approved' ? 'ರೈತರ ಪರಿಶೀಲನೆ ಅನುಮೋದಿಸಲಾಗಿದೆ!' : 'ರೈತರ ಪರಿಶೀಲನಾ ನವೀಕರಣ';
    const msgEn = status === 'approved' 
      ? 'Congratulations! Your farm profile has been officially verified by Karnataka Granary Administrators.'
      : `Your verification submission was not approved. Note: ${admin_notes || 'Please resubmit valid government RTC / Pahani documents.'}`;
    const msgKn = status === 'approved'
      ? 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಕೃಷಿ ವಿವರವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.'
      : 'ನಿಮ್ಮ ಪರಿಶೀಲನೆ ಅನುಮೋದನೆಗೊಂಡಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೂಕ್ತ ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಿ.';

    await connection.query(
      `INSERT INTO notifications (user_id, title_en, title_kn, message_en, message_kn, type, link_url)
       VALUES (?, ?, ?, ?, ?, 'verification', '/farmer/profile')`,
      [farmerId, titleEn, titleKn, msgEn, msgKn]
    );

    await connection.commit();
    return res.status(200).json({ success: true, message: `Verification status set to ${status}.` });
  } catch (error) {
    await connection.rollback();
    console.error('reviewVerification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process verification.' });
  } finally {
    connection.release();
  }
};

export const getComplaints = async (req, res) => {
  try {
    const [complaints] = await pool.query(
      `SELECT c.*, u.full_name AS complainant_name, u.phone AS complainant_phone, u.role AS complainant_role,
              o.order_code
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN orders o ON c.order_id = o.id
       ORDER BY c.created_at DESC`
    );

    return res.status(200).json({ success: true, complaints });
  } catch (error) {
    console.error('getComplaints error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaints.' });
  }
};

export const resolveComplaint = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  const { status, resolution_notes } = req.body;

  if (!['open', 'investigating', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid complaint status.' });
  }

  try {
    await pool.query(
      `UPDATE complaints 
       SET status = ?, resolution_notes = ?, resolved_by = ?
       WHERE id = ?`,
      [status, resolution_notes || null, adminId, id]
    );

    return res.status(200).json({ success: true, message: 'Complaint ticket updated.' });
  } catch (error) {
    console.error('resolveComplaint error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update complaint.' });
  }
};

export const moderateProduct = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'unlisted', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status for product moderation.' });
  }

  try {
    await pool.query('UPDATE product_listings SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({ success: true, message: `Product listing status changed to ${status}.` });
  } catch (error) {
    console.error('moderateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Failed to moderate product.' });
  }
};
