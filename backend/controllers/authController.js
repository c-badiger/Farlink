import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { validateRegistration } from '../validators/index.js';

export const register = async (req, res) => {
  const validation = validateRegistration(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: validation.errors[0], errors: validation.errors });
  }

  const {
    full_name,
    email,
    phone,
    password,
    role,
    buyer_type,
    preferred_language = 'en',
    // Farmer specific
    farm_name,
    experience_years = 0,
    district,
    taluk,
    village,
    pincode,
    farm_size_acres = 0,
    primary_crops,
    bio,
    // Buyer specific
    business_name,
    gst_number,
    trade_license
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if email or phone already exists
    const [existing] = await connection.query(
      'SELECT id, email, phone FROM users WHERE email = ? OR phone = ?',
      [email.toLowerCase().trim(), phone.trim()]
    );

    if (existing.length > 0) {
      const match = existing[0];
      const field = match.email === email.toLowerCase().trim() ? 'Email' : 'Phone number';
      await connection.rollback();
      return res.status(409).json({ success: false, message: `${field} is already registered.` });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user (force role to farmer or buyer, never allow self-registered admin)
    const assignedRole = role === 'farmer' ? 'farmer' : 'buyer';
    const assignedBuyerType = assignedRole === 'buyer' ? (buyer_type || 'individual') : null;

    const [userResult] = await connection.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, buyer_type, preferred_language, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [full_name.trim(), email.toLowerCase().trim(), phone.trim(), password_hash, assignedRole, assignedBuyerType, preferred_language]
    );

    const userId = userResult.insertId;

    if (assignedRole === 'farmer') {
      await connection.query(
        `INSERT INTO farmer_profiles (user_id, farm_name, experience_years, state, district, taluk, village, pincode, farm_size_acres, primary_crops, bio, verification_status)
         VALUES (?, ?, ?, 'Karnataka', ?, ?, ?, ?, ?, ?, ?, 'unverified')`,
        [userId, farm_name.trim(), Number(experience_years) || 0, district.trim(), taluk.trim(), village.trim(), pincode || '', Number(farm_size_acres) || 0, primary_crops || null, bio || null]
      );
    } else {
      await connection.query(
        `INSERT INTO buyer_profiles (user_id, business_name, gst_number, trade_license)
         VALUES (?, ?, ?, ?)`,
        [userId, business_name || null, gst_number || null, trade_license || null]
      );
    }

    // Insert welcome notification
    await connection.query(
      `INSERT INTO notifications (user_id, title_en, title_kn, message_en, message_kn, type)
       VALUES (?, ?, ?, ?, ?, 'system')`,
      [
        userId,
        'Welcome to Farmer\'s Online Granary',
        'ರೈತರ ಆನ್‌ಲೈನ್ ಗ್ರಾನರಿಗೆ ಸ್ವಾಗತ',
        'Your account has been successfully created. Explore direct farm trade across Karnataka.',
        'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ. ಕರ್ನಾಟಕದಾದ್ಯಂತ ನೇರ ಕೃಷಿ ವ್ಯಾಪಾರವನ್ನು ಅನ್ವೇಷಿಸಿ.'
      ]
    );

    await connection.commit();

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'farmers_granary_fallback_secret';
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role: assignedRole },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        role: assignedRole,
        buyer_type: assignedBuyerType,
        preferred_language
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  } finally {
    connection.release();
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Email/Phone and password are required.' });
  }

  try {
    const cleanIdentifier = identifier.trim();
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role, u.buyer_type, u.status, u.preferred_language,
              fp.farm_name, fp.district, fp.taluk, fp.village, fp.verification_status,
              bp.business_name
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
       WHERE u.email = ? OR u.phone = ?`,
      [cleanIdentifier.toLowerCase(), cleanIdentifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const user = rows[0];

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const secret = process.env.JWT_SECRET || 'farmers_granary_fallback_secret';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        buyer_type: user.buyer_type,
        status: user.status,
        preferred_language: user.preferred_language,
        farm_name: user.farm_name,
        district: user.district,
        taluk: user.taluk,
        village: user.village,
        verification_status: user.verification_status,
        business_name: user.business_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.buyer_type, u.status, u.preferred_language, u.created_at,
              fp.farm_name, fp.experience_years, fp.district, fp.taluk, fp.village, fp.pincode, fp.farm_size_acres, fp.primary_crops, fp.verification_status, fp.bio, fp.profile_image_url,
              bp.business_name, bp.gst_number, bp.trade_license, bp.default_delivery_notes
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    full_name,
    preferred_language,
    // Farmer
    farm_name,
    experience_years,
    district,
    taluk,
    village,
    pincode,
    farm_size_acres,
    primary_crops,
    bio,
    // Buyer
    business_name,
    gst_number,
    trade_license,
    default_delivery_notes
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (full_name) {
      await connection.query('UPDATE users SET full_name = ? WHERE id = ?', [full_name.trim(), userId]);
    }
    if (preferred_language) {
      await connection.query('UPDATE users SET preferred_language = ? WHERE id = ?', [preferred_language, userId]);
    }

    if (req.user.role === 'farmer') {
      await connection.query(
        `UPDATE farmer_profiles 
         SET farm_name = COALESCE(?, farm_name),
             experience_years = COALESCE(?, experience_years),
             district = COALESCE(?, district),
             taluk = COALESCE(?, taluk),
             village = COALESCE(?, village),
             pincode = COALESCE(?, pincode),
             farm_size_acres = COALESCE(?, farm_size_acres),
             primary_crops = COALESCE(?, primary_crops),
             bio = COALESCE(?, bio)
         WHERE user_id = ?`,
        [farm_name, experience_years, district, taluk, village, pincode, farm_size_acres, primary_crops, bio, userId]
      );
    } else if (req.user.role === 'buyer') {
      await connection.query(
        `UPDATE buyer_profiles 
         SET business_name = COALESCE(?, business_name),
             gst_number = COALESCE(?, gst_number),
             trade_license = COALESCE(?, trade_license),
             default_delivery_notes = COALESCE(?, default_delivery_notes)
         WHERE user_id = ?`,
        [business_name, gst_number, trade_license, default_delivery_notes, userId]
      );
    }

    await connection.commit();
    return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  } finally {
    connection.release();
  }
};
