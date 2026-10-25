import express from 'express';
import { createComplaint, getMyComplaints } from '../controllers/complaintController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createComplaint);
router.get('/my', authenticateToken, getMyComplaints);

export default router;
