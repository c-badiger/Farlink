import express from 'express';
import {
  getFarmerPublicProfile,
  getMyListings,
  getMyFarmerOrders,
  getFarmerStats,
  submitVerification
} from '../controllers/farmerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public farmer profile
router.get('/public/:id', getFarmerPublicProfile);

// Farmer authenticated routes
router.get('/my-listings', authenticateToken, requireRole('farmer'), getMyListings);
router.get('/my-orders', authenticateToken, requireRole('farmer'), getMyFarmerOrders);
router.get('/stats', authenticateToken, requireRole('farmer'), getFarmerStats);
router.post('/verification', authenticateToken, requireRole('farmer'), submitVerification);

export default router;
