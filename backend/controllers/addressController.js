import { pool } from '../db.js';

export const getAddresses = async (req, res) => {
  const userId = req.user.id;
  try {
    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error('getAddresses error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve addresses.' });
  }
};

export const addAddress = async (req, res) => {
  const userId = req.user.id;
  const {
    title = 'Home',
    recipient_name,
    recipient_phone,
    address_line1,
    address_line2,
    village_or_town,
    taluk,
    district,
    state = 'Karnataka',
    pincode,
    is_default = false
  } = req.body;

  if (!recipient_name || !recipient_phone || !address_line1 || !village_or_town || !district || !pincode) {
    return res.status(400).json({ success: false, message: 'All essential address fields are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (is_default) {
      await connection.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await connection.query(
      `INSERT INTO addresses 
       (user_id, title, recipient_name, recipient_phone, address_line1, address_line2, village_or_town, taluk, district, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title.trim(),
        recipient_name.trim(),
        recipient_phone.trim(),
        address_line1.trim(),
        address_line2 ? address_line2.trim() : null,
        village_or_town.trim(),
        taluk ? taluk.trim() : '',
        district.trim(),
        state.trim(),
        pincode.trim(),
        is_default ? 1 : 0
      ]
    );

    await connection.commit();
    return res.status(201).json({ success: true, message: 'Address saved successfully.', addressId: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('addAddress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save address.' });
  } finally {
    connection.release();
  }
};

export const deleteAddress = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
    }
    return res.status(200).json({ success: true, message: 'Address deleted.' });
  } catch (error) {
    console.error('deleteAddress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
};
