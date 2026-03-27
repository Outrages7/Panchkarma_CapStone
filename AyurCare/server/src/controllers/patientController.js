import Appointment from "../models/Appointment.js";
import Waitlist from "../models/Waitlist.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { notifyAppointmentBooked, notifyAppointmentCancelled, notifyAppointmentRescheduled } from "../utils/notificationService.js";
import { getSpecializationLabel } from "../utils/specializations.js";

/**
 * Get list of departments (based on active, approved doctors)
 */
export const getDepartments = async (req, res, next) => {
  try {
    // Get unique specializations from approved and available doctors
    const departments = await User.aggregate([
      {
        $match: {
          role: "doctor",
          isApproved: true,
          specialization: { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$specialization",
          doctorCount: { $sum: 1 },
          availableDoctors: {
            $sum: { $cond: ["$isAvailable", 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          doctorCount: 1,
          availableDoctors: 1,
        },
      },
      {
        $sort: { doctorCount: -1 },
      },
    ]);

    // Add displayName to each department
    const departmentsWithLabels = departments.map(dept => ({
      ...dept,
      displayName: getSpecializationLabel(dept.name),
    }));

    res.status(200).json({
      success: true,
      data: departmentsWithLabels,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctors by specialization
 */
export const getDoctors = async (req, res, next) => {
  try {
    const { specialization } = req.query;

    const query = {
      role: "doctor",
      isApproved: true,
    };

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await User.find(query)
      .select(
        "firstName lastName specialization experience consultationFee isAvailable qualifications"
      )
      .sort({ isAvailable: -1, experience: -1 });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available slots for a doctor on a specific date
 */
export const getDoctorSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DATE",
          message: "Date parameter is required",
        },
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DOCTOR_NOT_FOUND",
          message: "Doctor not found",
        },
      });
    }

    // Parse the date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleLowerCase("en-US", {
      weekday: "long",
    });

    // Find doctor's availability for that day
    const daySchedule = doctor.availableSlots?.find(
      (slot) => slot.day === dayOfWeek
    );

    if (!daySchedule) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Doctor is not available on this day",
      });
    }

    // Generate time slots between start and end time (30-minute intervals)
    const slots = [];
    const startTime = daySchedule.startTime; // e.g., "09:00"
    const endTime = daySchedule.endTime; // e.g., "17:00"

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")}`;

      // Check if this slot is already booked
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(currentHour, currentMin, 0, 0);

      const isBooked = await Appointment.exists({
        doctor: doctorId,
        date: slotDateTime,
        status: { $in: ["booked", "in-consultation"] },
      });

      if (!isBooked && slotDateTime > new Date()) {
        slots.push({
          time: timeStr,
          available: true,
        });
      }

      // Increment by 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Book a new appointment
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, date, type, reason, symptoms, department } = req.body;

    // Validation
    if (!doctorId || !date || !type || !reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Doctor, date, type, and reason are required",
        },
      });
    }

    // Validate doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DOCTOR_NOT_FOUND",
          message: "Doctor not found",
        },
      });
    }

    const appointmentDate = new Date(date);

    // Validate date is in the future
    if (appointmentDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DATE",
          message: "Appointment date must be in the future",
        },
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
      status: { $in: ["booked", "in-consultation"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SLOT_UNAVAILABLE",
          message: "This time slot is no longer available",
        },
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: appointmentDate,
      type,
      reason,
      symptoms: symptoms || [],
      department: department || doctor.specialization,
      status: "booked",
    });

    await appointment.populate(
      "doctor",
      "firstName lastName specialization consultationFee"
    );

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment booked successfully",
    });

    // Fire-and-forget notification
    notifyAppointmentBooked({ patientId, doctorId, appointment }).catch(() => {});
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient's upcoming appointments
 */
export const getUpcomingAppointments = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({
      patient: patientId,
      date: { $gte: new Date() },
      status: { $in: ["booked", "in-consultation"] },
    })
      .populate("doctor", "firstName lastName specialization")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient's appointment history
 */
export const getAppointmentHistory = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find({
        patient: patientId,
        $or: [
          { date: { $lt: new Date() } },
          { status: { $in: ["completed", "no-show", "cancelled"] } },
        ],
      })
        .populate("doctor", "firstName lastName specialization")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments({
        patient: patientId,
        $or: [
          { date: { $lt: new Date() } },
          { status: { $in: ["completed", "no-show", "cancelled"] } },
        ],
      }),
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
 * Cancel appointment
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    const appointment = await Appointment.findOne({
      _id: id,
      patient: patientId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPOINTMENT_NOT_FOUND",
          message: "Appointment not found",
        },
      });
    }

    // Check if appointment is in the future and can be cancelled
    if (appointment.date < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "PAST_APPOINTMENT",
          message: "Cannot cancel past appointments",
        },
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: {
          code: "ALREADY_CANCELLED",
          message: "Appointment already cancelled",
        },
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = patientId;
    appointment.cancelledAt = new Date();
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });

    // Fire-and-forget notification
    notifyAppointmentCancelled({ patientId, doctorId: appointment.doctor, appointment, cancelledByRole: 'patient' }).catch(() => {});
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule appointment
 */
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;
    const patientId = req.user._id;

    if (!newDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DATE",
          message: "New date is required",
        },
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      patient: patientId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPOINTMENT_NOT_FOUND",
          message: "Appointment not found",
        },
      });
    }

    // Check if appointment can be rescheduled
    if (
      appointment.status === "completed" ||
      appointment.status === "no-show"
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "CANNOT_RESCHEDULE",
          message: "Cannot reschedule completed or no-show appointments",
        },
      });
    }

    const newDateTime = new Date(newDate);

    // Validate new date is in the future
    if (newDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DATE",
          message: "New date must be in the future",
        },
      });
    }

    // Check if doctor is available at new time
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      date: newDateTime,
      status: { $in: ["booked", "in-consultation"] },
      _id: { $ne: appointment._id },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SLOT_UNAVAILABLE",
          message: "Doctor is not available at the requested time",
        },
      });
    }

    appointment.date = newDateTime;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });

    // Fire-and-forget notification
    notifyAppointmentRescheduled({ patientId, doctorId: appointment.doctor, appointment }).catch(() => {});
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient's waitlist status
 */
export const getWaitlist = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const waitlistEntries = await Waitlist.find({
      patient: patientId,
      status: { $in: ["waiting", "assigned"] },
    })
      .populate("doctor", "firstName lastName specialization")
      .sort({ createdAt: -1 });

    // Calculate position for each entry
    const entriesWithPosition = await Promise.all(
      waitlistEntries.map(async (entry) => {
        if (entry.status === "waiting") {
          const position = await Waitlist.countDocuments({
            department: entry.department,
            status: "waiting",
            $or: [
              { priority: { $gt: entry.priority } },
              {
                priority: entry.priority,
                createdAt: { $lt: entry.createdAt },
              },
            ],
          });

          return {
            ...entry.toObject(),
            position: position + 1,
          };
        }
        return entry.toObject();
      })
    );

    res.status(200).json({
      success: true,
      data: entriesWithPosition,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient's personal information
 */
export const updatePersonalInfo = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { firstName, lastName, email, phone, dateOfBirth, gender } = req.body;

    // Check if email is being changed and is already in use
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: patientId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: "EMAIL_IN_USE",
            message: "Email address is already in use",
          },
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient's address
 */
export const updateAddress = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ADDRESS",
          message: "Address data is required",
        },
      });
    }

    const patient = await User.findByIdAndUpdate(
      patientId,
      { $set: { address } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change patient's password
 */
export const changePassword = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Current password and new password are required",
        },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WEAK_PASSWORD",
          message: "Password must be at least 8 characters long",
        },
      });
    }

    // Get patient with password
    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PATIENT_NOT_FOUND",
          message: "Patient not found",
        },
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, patient.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INCORRECT_PASSWORD",
          message: "Current password is incorrect",
        },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    patient.password = await bcrypt.hash(newPassword, salt);
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
