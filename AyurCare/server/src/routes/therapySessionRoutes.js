import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as sessionController from '../controllers/therapySessionController.js';

const router = express.Router();
router.use(protect);

// Patient
router.get('/my-sessions', authorize('patient'), sessionController.getPatientSessions);
router.post('/:id/feedback', authorize('patient'), sessionController.submitFeedback);
router.post('/:id/report-symptoms', authorize('patient'), sessionController.reportSymptoms);

// Doctor
router.get('/today', authorize('doctor'), sessionController.getTodaySessions);
router.get('/practitioner-sessions', authorize('doctor'), sessionController.getPractitionerSessions);
router.post('/', authorize('doctor'), sessionController.createSession);
router.patch('/:id/start', authorize('doctor'), sessionController.startSession);
router.patch('/:id/end', authorize('doctor'), sessionController.endSession);
router.patch('/:id/notes', authorize('doctor'), sessionController.addSessionNotes);
router.patch('/:id/cancel', authorize('doctor', 'admin'), sessionController.cancelSession);

// Admin
router.get('/', authorize('admin'), sessionController.getAllSessions);

export default router;
