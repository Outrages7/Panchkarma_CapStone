import Appointment from '../models/Appointment.js';
import Waitlist from '../models/Waitlist.js';
import DoctorStatus from '../models/DoctorStatus.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Get doctor dashboard overview
 */
export const getOverview = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get appointments count by status
    const [todayTotal, completed, pending, noShows] = await Promise.all([
      Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: today, $lt: tomorrow },
      }),
      Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: today, $lt: tomorrow },
        status: 'completed',
      }),
      Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: today, $lt: tomorrow },
        status: { $in: ['booked', 'in-consultation'] },
      }),
      Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: today, $lt: tomorrow },
        status: 'no-show',
      }),
    ]);

    // Get next patient
    const nextAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: new Date() },
      status: 'booked',
    })
      .sort({ date: 1 })
      .populate('patient', 'firstName lastName');

    const nextPatient = nextAppointment
      ? {
          firstName: nextAppointment.patient.firstName,
          lastName: nextAppointment.patient.lastName,
          time: nextAppointment.date,
          type: nextAppointment.type,
        }
      : null;

    res.status(200).json({
      success: true,
      data: {
        todayTotal,
        completed,
        pending,
        noShows,
        nextPatient,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's appointments for doctor
 */
export const getTodayAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate('patient', 'firstName lastName phone email')
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
 * Update appointment status
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.user._id;

    // Validate status
    if (!['in-consultation', 'completed', 'no-show'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid appointment status',
        },
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: doctorId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    appointment.status = status;
    await appointment.save();

    // Update doctor status
    let doctorStatus = await DoctorStatus.findOne({ doctor: doctorId });
    if (!doctorStatus) {
      doctorStatus = await DoctorStatus.create({ doctor: doctorId });
    }

    if (status === 'in-consultation') {
      await doctorStatus.updateStatus('in-consultation', {
        patientId: appointment.patient,
        appointmentId: appointment._id,
      });
    } else if (status === 'completed' || status === 'no-show') {
      // Update stats
      if (status === 'completed') {
        doctorStatus.todayStats.completed += 1;
      } else if (status === 'no-show') {
        doctorStatus.todayStats.noShows += 1;
      }

      // Check if doctor has more appointments today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextAppointment = await Appointment.findOne({
        doctor: doctorId,
        date: { $gte: new Date(), $lt: tomorrow },
        status: 'booked',
      }).sort({ date: 1 });

      if (nextAppointment) {
        await doctorStatus.updateStatus('available');
      } else {
        await doctorStatus.updateStatus('available');
      }

      await doctorStatus.save();
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's waitlist
 */
export const getWaitlist = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const waitlistEntries = await Waitlist.find({
      doctor: doctorId,
      status: 'waiting',
    })
      .populate('patient', 'firstName lastName phone email')
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
 * Update doctor availability status
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { status } = req.body;

    // Validate status
    if (!['available', 'in-consultation', 'away'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid availability status',
        },
      });
    }

    let doctorStatus = await DoctorStatus.findOne({ doctor: doctorId });

    if (!doctorStatus) {
      doctorStatus = await DoctorStatus.create({
        doctor: doctorId,
        status,
      });
    } else {
      await doctorStatus.updateStatus(status);
    }

    res.status(200).json({
      success: true,
      data: {
        status: doctorStatus.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set doctor break
 */
export const setBreak = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { duration, reason } = req.body;

    if (!duration || duration < 1 || duration > 120) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DURATION',
          message: 'Break duration must be between 1 and 120 minutes',
        },
      });
    }

    let doctorStatus = await DoctorStatus.findOne({ doctor: doctorId });

    if (!doctorStatus) {
      doctorStatus = await DoctorStatus.create({ doctor: doctorId });
    }

    const breakStartTime = new Date();
    const breakEndTime = new Date(breakStartTime.getTime() + duration * 60000);

    await doctorStatus.updateStatus('on-break', {
      breakStartTime,
      breakEndTime,
      breakReason: reason || 'Short break',
    });

    res.status(200).json({
      success: true,
      data: {
        status: doctorStatus.status,
        breakEndTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor's personal information
 */
export const updatePersonalInfo = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { firstName, lastName, email, phone } = req.body;

    // Check if email is being changed and is already in use
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: doctorId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_IN_USE',
            message: 'Email address is already in use',
          },
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor's professional information
 */
export const updateProfessionalInfo = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { specialization, licenseNumber, experience, consultationFee } = req.body;

    const updateData = {};
    if (specialization) updateData.specialization = specialization;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (experience) updateData.experience = experience;
    if (consultationFee) updateData.consultationFee = consultationFee;

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor's availability schedule
 */
export const updateAvailabilitySchedule = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { availableSlots } = req.body;

    if (!availableSlots || !Array.isArray(availableSlots)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SLOTS',
          message: 'Available slots must be an array',
        },
      });
    }

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { $set: { availableSlots } },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change doctor's password
 */
export const changePassword = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Current password and new password are required',
        },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long',
        },
      });
    }

    // Get doctor with password
    const doctor = await User.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCTOR_NOT_FOUND',
          message: 'Doctor not found',
        },
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INCORRECT_PASSWORD',
          message: 'Current password is incorrect',
        },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(newPassword, salt);
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointments by month for calendar
 */
export const getAppointmentsByMonth = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('patient', 'firstName lastName phone email')
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
 * Get all patients for a doctor
 */
export const getPatients = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    // Get unique patients who have appointments with this doctor
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'firstName lastName email phone dateOfBirth gender')
      .select('patient createdAt');

    // Create a map to get unique patients with their stats
    const patientsMap = new Map();

    for (const appointment of appointments) {
      if (!appointment.patient) continue;

      const patientId = appointment.patient._id.toString();

      if (!patientsMap.has(patientId)) {
        // Get stats for this patient
        const [totalVisits, lastVisit, nextAppointment] = await Promise.all([
          Appointment.countDocuments({
            doctor: doctorId,
            patient: appointment.patient._id,
            status: 'completed',
          }),
          Appointment.findOne({
            doctor: doctorId,
            patient: appointment.patient._id,
            status: 'completed',
          })
            .sort({ date: -1 })
            .select('date'),
          Appointment.findOne({
            doctor: doctorId,
            patient: appointment.patient._id,
            date: { $gte: new Date() },
            status: 'booked',
          })
            .sort({ date: 1 })
            .select('date'),
        ]);

        patientsMap.set(patientId, {
          ...appointment.patient.toObject(),
          totalVisits,
          lastVisit: lastVisit?.date || null,
          nextAppointment: nextAppointment?.date || null,
          firstVisit: appointment.createdAt,
        });
      }
    }

    const patients = Array.from(patientsMap.values());

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};
