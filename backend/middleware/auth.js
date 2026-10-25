import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'farmers_granary_fallback_secret';
    const decoded = jwt.verify(token, secret);

    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, buyer_type, status, preferred_language FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    const user = rows[0];
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account has been suspended. Please contact admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid or forged authentication token.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'farmers_granary_fallback_secret';
    const decoded = jwt.verify(token, secret);
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, buyer_type, status, preferred_language FROM users WHERE id = ?',
      [decoded.id]
    );
    req.user = rows.length > 0 && rows[0].status !== 'suspended' ? rows[0] : null;
  } catch {
    req.user = null;
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Role '${req.user.role}' is not authorized. Allowed: ${roles.join(', ')}` 
      });
    }
    next();
  };
};
