import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as therapyTypeController from '../controllers/therapyTypeController.js';

const router = express.Router();

// Public - anyone can browse therapy types
router.get('/', therapyTypeController.getAll);
router.get('/:id', therapyTypeController.getOne);

// Admin only - manage types
router.use(protect);
router.use(authorize('admin'));
router.post('/', therapyTypeController.create);
router.put('/:id', therapyTypeController.update);
router.delete('/:id', therapyTypeController.deactivate);

export default router;
