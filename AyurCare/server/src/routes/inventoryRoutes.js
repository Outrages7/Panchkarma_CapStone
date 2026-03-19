import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as inventoryController from '../controllers/inventoryController.js';

const router = express.Router();
router.use(protect);

router.get('/', inventoryController.getMedicines);
router.get('/low-stock/alerts', authorize('admin'), inventoryController.getLowStockAlerts);
router.get('/:id', inventoryController.getMedicineById);
router.post('/', authorize('admin'), inventoryController.addMedicine);
router.put('/:id', authorize('admin'), inventoryController.updateMedicine);
router.patch('/:id/stock', authorize('admin', 'doctor'), inventoryController.updateStock);

export default router;
