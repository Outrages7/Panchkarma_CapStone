import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as doctorController from '../controllers/doctorController.js';
import * as doctorMedicalRecordsController from '../controllers/doctorMedicalRecordsController.js';
import * as doctorMessageController from '../controllers/doctorMessageController.js';

const router = express.Router();

// Protect all doctor routes
router.use(protect);
router.use(authorize('doctor'));

// Dashboard overview
router.get('/overview', doctorController.getOverview);

// Appointments
router.get('/appointments/today', doctorController.getTodayAppointments);
router.get('/appointments/month', doctorController.getAppointmentsByMonth);
router.patch('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Patients
router.get('/patients', doctorController.getPatients);

// Waitlist
router.get('/waitlist', doctorController.getWaitlist);

// Availability
router.patch('/availability', doctorController.updateAvailability);
router.post('/break', doctorController.setBreak);

// Profile Management
router.patch('/profile/personal', doctorController.updatePersonalInfo);
router.patch('/profile/professional', doctorController.updateProfessionalInfo);
router.patch('/profile/availability', doctorController.updateAvailabilitySchedule);
router.post('/profile/change-password', doctorController.changePassword);

// Patient Medical Records Management
router.post('/patients/:patientId/allergies', doctorMedicalRecordsController.addPatientAllergy);
router.patch(
  '/patients/:patientId/allergies/:allergyId',
  doctorMedicalRecordsController.updatePatientAllergy
);
router.delete(
  '/patients/:patientId/allergies/:allergyId',
  doctorMedicalRecordsController.deletePatientAllergy
);

router.post('/patients/:patientId/medications', doctorMedicalRecordsController.prescribeMedication);
router.patch(
  '/patients/:patientId/medications/:medicationId',
  doctorMedicalRecordsController.updateMedication
);
router.post(
  '/patients/:patientId/medications/:medicationId/discontinue',
  doctorMedicalRecordsController.discontinueMedication
);

router.post('/patients/:patientId/lab-results', doctorMedicalRecordsController.createLabOrder);
router.patch(
  '/patients/:patientId/lab-results/:labResultId',
  doctorMedicalRecordsController.updateLabResults
);
router.post(
  '/patients/:patientId/lab-results/:labResultId/tests',
  doctorMedicalRecordsController.addTestResults
);

router.post('/patients/:patientId/vital-signs', doctorMedicalRecordsController.recordVitalSigns);

router.post(
  '/patients/:patientId/medical-history',
  doctorMedicalRecordsController.addMedicalHistory
);
router.patch(
  '/patients/:patientId/medical-history/:historyId',
  doctorMedicalRecordsController.updateMedicalHistory
);

router.get('/patients/:patientId/chart', doctorMedicalRecordsController.getPatientChart);

// Prescriptions/Medications Management
router.get('/medications', doctorMedicalRecordsController.getAllPrescribedMedications);
router.get('/medications/stats', doctorMedicalRecordsController.getMedicationStats);

// Messaging
router.get('/messages/conversations', doctorMessageController.getConversations);
router.get('/messages/conversations/:conversationId', doctorMessageController.getMessages);
router.post('/messages/send', doctorMessageController.sendMessage);
router.get('/messages/unread-count', doctorMessageController.getUnreadCount);

export default router;
