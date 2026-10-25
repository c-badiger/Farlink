import express from 'express';
import { submitReview, getProductReviews } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticateToken, submitReview);

export default router;
