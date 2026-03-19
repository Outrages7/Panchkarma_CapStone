import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as patientController from '../controllers/patientController.js';
import * as medicalRecordsController from '../controllers/medicalRecordsController.js';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

// Protect all patient routes
router.use(protect);
router.use(authorize('patient'));

// Booking
router.get('/departments', patientController.getDepartments);
router.get('/doctors', patientController.getDoctors);
router.get('/doctors/:doctorId/slots', patientController.getDoctorSlots);
router.post('/appointments', patientController.bookAppointment);

// Appointments
router.get('/appointments/upcoming', patientController.getUpcomingAppointments);
router.get('/appointments/history', patientController.getAppointmentHistory);
router.patch('/appointments/:id/cancel', patientController.cancelAppointment);
router.post('/appointments/:id/reschedule', patientController.rescheduleAppointment);

// Waitlist
router.get('/waitlist', patientController.getWaitlist);

// Profile Management
router.patch('/profile/personal', patientController.updatePersonalInfo);
router.patch('/profile/address', patientController.updateAddress);
router.post('/profile/change-password', patientController.changePassword);

// Medical Records - Allergies
router.get('/medical-records/allergies', medicalRecordsController.getAllergies);
router.post('/medical-records/allergies', medicalRecordsController.addAllergy);
router.delete('/medical-records/allergies/:id', medicalRecordsController.deleteAllergy);

// Medical Records - Medications
router.get('/medical-records/medications', medicalRecordsController.getMedications);
router.patch(
  '/medical-records/medications/:id/request-discontinue',
  medicalRecordsController.requestDiscontinueMedication
);

// Medical Records - Lab Results
router.get('/medical-records/lab-results', medicalRecordsController.getLabResults);
router.get('/medical-records/lab-results/:id', medicalRecordsController.getLabResultDetails);

// Medical Records - Vital Signs
router.get('/medical-records/vital-signs', medicalRecordsController.getVitalSigns);
router.post('/medical-records/vital-signs', medicalRecordsController.addVitalSign);

// Medical Records - Medical History
router.get('/medical-records/medical-history', medicalRecordsController.getMedicalHistory);

// Medical Records - Summary
router.get('/medical-records/summary', medicalRecordsController.getMedicalRecordsSummary);

// Prescriptions (alias for medications for UI consistency)
router.get('/prescriptions', medicalRecordsController.getMedications);

// Messaging
router.get('/messages/conversations', messageController.getConversations);
router.get('/messages/conversations/:conversationId', messageController.getMessages);
router.post('/messages/send', messageController.sendMessage);
router.get('/messages/unread-count', messageController.getUnreadCount);

export default router;
