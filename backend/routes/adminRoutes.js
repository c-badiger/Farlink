import express from 'express';
import {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getVerifications,
  reviewVerification,
  getComplaints,
  resolveComplaint,
  moderateProduct
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes here strictly require admin role
router.use(authenticateToken, requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/verifications', getVerifications);
router.patch('/verifications/:id/review', reviewVerification);
router.get('/complaints', getComplaints);
router.patch('/complaints/:id/resolve', resolveComplaint);
router.patch('/products/:id/moderate', moderateProduct);

export default router;
