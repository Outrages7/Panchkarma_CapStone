import mongoose from 'mongoose';

const doctorStatusSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required'],
      unique: true,
    },
    status: {
      type: String,
      enum: ['available', 'in-consultation', 'away', 'on-break'],
      default: 'available',
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    currentAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    breakStartTime: Date,
    breakEndTime: Date,
    breakReason: String,
    lastStatusChange: {
      type: Date,
      default: Date.now,
    },
    todayStats: {
      totalAppointments: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Number,
        default: 0,
      },
      noShows: {
        type: Number,
        default: 0,
      },
      avgConsultationTime: {
        type: Number, // minutes
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
doctorStatusSchema.index({ doctor: 1 });
doctorStatusSchema.index({ status: 1 });

// Method to update status
doctorStatusSchema.methods.updateStatus = function (newStatus, data = {}) {
  this.status = newStatus;
  this.lastStatusChange = new Date();

  if (newStatus === 'in-consultation') {
    this.currentPatient = data.patientId;
    this.currentAppointment = data.appointmentId;
  } else if (newStatus === 'on-break') {
    this.breakStartTime = data.breakStartTime || new Date();
    this.breakEndTime = data.breakEndTime;
    this.breakReason = data.breakReason;
    this.currentPatient = null;
    this.currentAppointment = null;
  } else {
    this.currentPatient = null;
    this.currentAppointment = null;
  }

  return this.save();
};

const DoctorStatus = mongoose.model('DoctorStatus', doctorStatusSchema);

export default DoctorStatus;
