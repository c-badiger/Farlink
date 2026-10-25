import express from 'express';
import {
  getProducts,
  getDistricts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus
} from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/districts', getDistricts);
router.get('/:id', getProductById);

// Farmer protected routes
router.post('/', authenticateToken, requireRole('farmer'), createProduct);
router.put('/:id', authenticateToken, requireRole('farmer', 'admin'), updateProduct);
router.patch('/:id/status', authenticateToken, requireRole('farmer', 'admin'), updateProductStatus);

export default router;
