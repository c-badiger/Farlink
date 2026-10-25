import express from 'express';
import {
  createOrder,
  getMyBuyerOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createOrder);
router.get('/my-orders', authenticateToken, getMyBuyerOrders);
router.get('/:id', authenticateToken, getOrderById);
router.patch('/:id/status', authenticateToken, updateOrderStatus);

export default router;
