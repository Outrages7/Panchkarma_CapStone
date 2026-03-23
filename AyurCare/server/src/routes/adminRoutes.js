import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize("admin"));

// Dashboard overview
router.get("/overview", adminController.getOverview);

// Departments management
router.get("/departments", adminController.getDepartments);

// Doctors management
router.get("/doctors", adminController.getDoctors);
router.patch("/doctors/:id/approval", adminController.updateDoctorApproval);

// Patients management
router.get("/patients", adminController.getPatients);

// Appointments management
router.get("/appointments", adminController.getAppointments);
router.patch("/appointments/:id/cancel", adminController.cancelAppointment);

// Waitlist management
router.get("/waitlist", adminController.getWaitlist);
router.patch("/waitlist/:id/assign", adminController.assignWaitlist);
router.patch("/waitlist/:id/priority", adminController.updateWaitlistPriority);

// AI logs
router.get("/ai-logs", adminController.getAILogs);

// Analytics
router.get("/analytics/appointments", adminController.getAppointmentsAnalytics);
router.get("/analytics/waiting-time", adminController.getWaitingTimeAnalytics);
router.get("/analytics/utilization", adminController.getUtilizationAnalytics);

export default router;
