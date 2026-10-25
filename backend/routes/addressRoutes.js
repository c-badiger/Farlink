import express from 'express';
import { getAddresses, addAddress, deleteAddress } from '../controllers/addressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAddresses);
router.post('/', authenticateToken, addAddress);
router.delete('/:id', authenticateToken, deleteAddress);

export default router;
