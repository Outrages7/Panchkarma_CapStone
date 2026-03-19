import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as healthScoreController from '../controllers/healthScoreController.js';

const router = express.Router();
router.use(protect);

router.get('/my-scores', authorize('patient'), healthScoreController.getMyScores);
router.post('/', authorize('patient', 'doctor'), healthScoreController.recordScore);
router.get('/patient/:patientId', authorize('doctor', 'admin'), healthScoreController.getPatientScores);
router.get('/trend/:patientId', authorize('doctor', 'admin'), healthScoreController.getScoreTrend);

export default router;
