import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Waitlist from "../models/Waitlist.js";
import AILog from "../models/AILog.js";
import DoctorStatus from "../models/DoctorStatus.js";
import bcrypt from "bcryptjs";
import { getSpecializationLabel } from "../utils/specializations.js";

/**
 * Get all departments with stats
 */
export const getDepartments = async (req, res, next) => {
  try {
    // Get all unique specializations from doctors
    const doctors = await User.find({
      role: "doctor",
      isApproved: true,
    }).select("specialization firstName lastName");

    // Group doctors by specialization and calculate stats
    const departmentMap = {};

    for (const doctor of doctors) {
      const dept = doctor.specialization;
      if (!dept) continue;

      if (!departmentMap[dept]) {
        departmentMap[dept] = {
          name: dept,
          displayName: getSpecializationLabel(dept),
          totalDoctors: 0,
          doctors: [],
        };
      }

      departmentMap[dept].totalDoctors += 1;
      departmentMap[dept].doctors.push({
        id: doctor._id,
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      });
    }

    // Get appointment stats per department
    for (const deptName of Object.keys(departmentMap)) {
      const doctorIds = departmentMap[deptName].doctors.map((d) => d.id);

      const [totalAppointments, totalPatients] = await Promise.all([
        Appointment.countDocuments({ doctor: { $in: doctorIds } }),
        Appointment.distinct("patient", { doctor: { $in: doctorIds } }).then(
          (arr) => arr.length
        ),
      ]);

      departmentMap[deptName].totalAppointments = totalAppointments;
      departmentMap[deptName].totalPatients = totalPatients;
    }

    const departments = Object.values(departmentMap).sort(
      (a, b) => b.totalDoctors - a.totalDoctors
    );

    res.status(200).json({
      success: true,
      data: departments,
      total: departments.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin dashboard overview with KPIs
 */
export const getOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get appointments today
    const appointmentsToday = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ["booked", "in-consultation", "completed"] },
    });

    // Get active doctors
    const activeDoctors = await DoctorStatus.countDocuments({
      status: { $in: ["available", "in-consultation"] },
    });

    // Calculate average waiting time today
    const completedToday = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
      status: "completed",
    }).select("date createdAt");

    let avgWaitingTime = 0;
    if (completedToday.length > 0) {
      const totalWaitTime = completedToday.reduce((sum, apt) => {
        return sum + (new Date(apt.date) - new Date(apt.createdAt));
      }, 0);
      avgWaitingTime = Math.round(
        totalWaitTime / completedToday.length / 60000
      ); // Convert to minutes
    }

    // Calculate no-show rate for this week
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const totalAppointmentsWeek = await Appointment.countDocuments({
      date: { $gte: weekAgo, $lt: tomorrow },
    });

    const noShowsWeek = await Appointment.countDocuments({
      date: { $gte: weekAgo, $lt: tomorrow },
      status: "no-show",
    });

    const noShowRate =
      totalAppointmentsWeek > 0
        ? Number(((noShowsWeek / totalAppointmentsWeek) * 100).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        appointmentsToday,
        activeDoctors,
        avgWaitingTime,
        noShowRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all doctors with their current status
 */
export const getDoctors = async (req, res, next) => {
  try {
    const { department, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { role: "doctor" };
    if (department) {
      filter.specialization = department;
    }

    const [doctors, total] = await Promise.all([
      User.find(filter)
        .select(
          "firstName lastName specialization email phone experience consultationFee licenseNumber isApproved isAvailable createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    // Get stats for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const [totalPatients, totalAppointments] = await Promise.all([
          Appointment.distinct("patient", { doctor: doctor._id }),
          Appointment.countDocuments({ doctor: doctor._id }),
        ]);

        return {
          id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization,
          licenseNumber: doctor.licenseNumber,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          isApproved: doctor.isApproved,
          isAvailable: doctor.isAvailable,
          totalPatients: totalPatients.length,
          totalAppointments,
          joinedDate: doctor.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        doctors: doctorsWithStats,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointments with filters and pagination
 */
export const getAppointments = async (req, res, next) => {
  try {
    const {
      date,
      status,
      doctor,
      patient,
      department,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (date) {
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: queryDate, $lt: nextDay };
    }

    if (status) {
      filter.status = status;
    }

    if (doctor) {
      filter.doctor = doctor;
    }

    if (patient) {
      filter.patient = patient;
    }

    if (department) {
      filter.department = department;
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patient", "firstName lastName email phone")
        .populate("doctor", "firstName lastName specialization")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get waitlist entries
 */
export const getWaitlist = async (req, res, next) => {
  try {
    const { doctor, department } = req.query;

    const filter = { status: "waiting" };

    if (doctor) {
      filter.doctor = doctor;
    }

    if (department) {
      filter.department = department;
    }

    const waitlistEntries = await Waitlist.find(filter)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization")
      .sort({ priority: -1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: waitlistEntries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually assign waitlist entry to appointment slot
 */
export const assignWaitlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { doctorId, slotTime } = req.body;

    const waitlistEntry = await Waitlist.findById(id).populate("patient");

    if (!waitlistEntry) {
      return res.status(404).json({
        success: false,
        error: {
          code: "WAITLIST_NOT_FOUND",
          message: "Waitlist entry not found",
        },
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: waitlistEntry.patient._id,
      doctor: doctorId,
      date: new Date(slotTime),
      reason: waitlistEntry.reason,
      symptoms: waitlistEntry.symptoms,
      department: waitlistEntry.department,
      type: "new",
    });

    // Update waitlist entry
    waitlistEntry.status = "assigned";
    waitlistEntry.assignedAppointment = appointment._id;
    waitlistEntry.assignedAt = new Date();
    await waitlistEntry.save();

    // Log AI decision (manual assignment)
    await AILog.create({
      doctor: doctorId,
      patient: waitlistEntry.patient._id,
      waitlistEntry: waitlistEntry._id,
      appointment: appointment._id,
      slotTime: new Date(slotTime),
      decision: "assigned",
      reasoning: "Manually assigned by admin",
      confidence: 1.0,
      modelVersion: "manual",
    });

    res.status(200).json({
      success: true,
      data: {
        appointmentId: appointment._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update waitlist priority
 */
export const updateWaitlistPriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const waitlistEntry = await Waitlist.findByIdAndUpdate(
      id,
      { priority },
      { new: true, runValidators: true }
    );

    if (!waitlistEntry) {
      return res.status(404).json({
        success: false,
        error: {
          code: "WAITLIST_NOT_FOUND",
          message: "Waitlist entry not found",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: waitlistEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI allocation logs
 */
export const getAILogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AILog.find()
        .populate("doctor", "firstName lastName specialization")
        .populate("patient", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AILog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointments analytics
 */
export const getAppointmentsAnalytics = async (req, res, next) => {
  try {
    const { period = "7days" } = req.query;

    const days = period === "7days" ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get waiting time analytics
 */
export const getWaitingTimeAnalytics = async (req, res, next) => {
  try {
    const { period = "30days" } = req.query;

    const days = parseInt(period) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          avgWaitTime: {
            $avg: {
              $divide: [
                { $subtract: ["$date", "$createdAt"] },
                60000, // Convert to minutes
              ],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          avgWaitTime: { $round: ["$avgWaitTime", 0] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor utilization by department
 */
export const getUtilizationAnalytics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all doctors grouped by department
    const doctors = await User.find({ role: "doctor" }).select(
      "specialization"
    );

    const departmentStats = {};

    for (const doctor of doctors) {
      const dept = doctor.specialization;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { total: 0, appointments: 0 };
      }
      departmentStats[dept].total += 1;

      // Count today's appointments
      const appointmentCount = await Appointment.countDocuments({
        doctor: doctor._id,
        date: { $gte: today },
        status: { $in: ["booked", "in-consultation", "completed"] },
      });

      departmentStats[dept].appointments += appointmentCount;
    }

    const utilization = Object.entries(departmentStats).map(
      ([department, stats]) => ({
        department,
        utilization:
          stats.total > 0
            ? Math.round((stats.appointments / (stats.total * 12)) * 100) // Assuming 12 slots per day
            : 0,
      })
    );

    res.status(200).json({
      success: true,
      data: utilization,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all patients with statistics
 */
export const getPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      User.find({ role: "patient" })
        .select(
          "firstName lastName email phone dateOfBirth gender address medicalHistory createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({ role: "patient" }),
    ]);

    // Get appointment statistics for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const [totalAppointments, upcomingAppointments, lastAppointment] =
          await Promise.all([
            Appointment.countDocuments({ patient: patient._id }),
            Appointment.countDocuments({
              patient: patient._id,
              date: { $gte: new Date() },
              status: "booked",
            }),
            Appointment.findOne({
              patient: patient._id,
              date: { $lt: new Date() },
              status: "completed",
            })
              .sort({ date: -1 })
              .select("date"),
          ]);

        return {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          address: patient.address,
          medicalHistory: patient.medicalHistory,
          registeredDate: patient.createdAt,
          lastVisit: lastAppointment?.date || null,
          totalAppointments,
          upcomingAppointments,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        patients: patientsWithStats,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject doctor
 */
export const updateDoctorApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const doctor = await User.findOneAndUpdate(
      { _id: id, role: "doctor" },
      { isApproved },
      { new: true, runValidators: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DOCTOR_NOT_FOUND",
          message: "Doctor not found",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment by admin
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPOINTMENT_NOT_FOUND",
          message: "Appointment not found",
        },
      });
    }

    if (
      appointment.status === "cancelled" ||
      appointment.status === "completed"
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Cannot cancel appointment with status: ${appointment.status}`,
        },
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason || "Cancelled by admin";
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all admin users
 */
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new admin user
 */
export const createAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, department } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: "admin",
      department: department || "Administration",
      isEmailVerified: true,
    });

    // Return without password
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      data: adminData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an admin user
 */
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot delete your own admin account",
      });
    }

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({
        success: false,
        error: "This user is not an admin",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
