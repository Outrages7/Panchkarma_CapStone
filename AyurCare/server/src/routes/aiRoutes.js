import express from 'express';
import { protect } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();
router.use(protect);

router.post('/recommend', aiController.recommendTherapy);
router.post('/schedule', aiController.smartSchedule);
router.get('/predict/:treatmentPlanId', aiController.predictSuccess);
router.get('/risk-check/:patientId', aiController.riskCheck);

export default router;
