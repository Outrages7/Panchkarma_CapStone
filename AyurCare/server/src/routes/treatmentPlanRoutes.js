import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as treatmentPlanController from '../controllers/treatmentPlanController.js';

const router = express.Router();
router.use(protect);

// Patient: view own plans
router.get('/my-plans', authorize('patient'), treatmentPlanController.getMyPlans);
router.get('/my-plans/:id', authorize('patient'), treatmentPlanController.getPlanDetails);
router.get('/:id/sessions', authorize('patient', 'doctor', 'admin'), treatmentPlanController.getPlanSessions);

// Doctor: create and manage plans
router.get('/practitioner-plans', authorize('doctor'), treatmentPlanController.getPractitionerPlans);
router.post('/', authorize('doctor'), treatmentPlanController.createPlan);
router.put('/:id', authorize('doctor'), treatmentPlanController.updatePlan);
router.patch('/:id/status', authorize('doctor'), treatmentPlanController.updatePlanStatus);
router.post('/:id/generate-sessions', authorize('doctor'), treatmentPlanController.generateScheduledSessions);

// Admin: view all
router.get('/', authorize('admin'), treatmentPlanController.getAllPlans);

export default router;

