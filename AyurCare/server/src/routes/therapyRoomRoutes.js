import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as roomController from '../controllers/therapyRoomController.js';

const router = express.Router();
router.use(protect);

// Public (authenticated) — practitioners and patients can view rooms
router.get('/', roomController.getAllRooms);

// Admin only
router.post('/', authorize('admin'), roomController.createRoom);
router.put('/:id', authorize('admin'), roomController.updateRoom);
router.delete('/:id', authorize('admin'), roomController.deleteRoom);

export default router;
