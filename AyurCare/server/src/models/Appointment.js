import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required'],
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
    status: {
      type: String,
      enum: ['booked', 'in-consultation', 'completed', 'no-show', 'cancelled'],
      default: 'booked',
    },
    type: {
      type: String,
      enum: ['new', 'follow-up'],
      default: 'new',
    },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    hospital: {
      type: String,
      default: 'Central Medical Center',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    diagnosis: {
      type: String,
      maxlength: [1000, 'Diagnosis cannot exceed 1000 characters'],
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,
    cancellationReason: String,

    // Ayurvedic therapy extensions
    therapyType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TherapyType',
    },
    therapyStage: {
      type: String,
      enum: ['purvakarma', 'pradhanakarma', 'paschatkarma'],
    },
    treatmentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentPlan',
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TherapyRoom',
    },
    sessionNumber: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1, date: -1 });
appointmentSchema.index({ date: 1 });

// Prevent double booking
appointmentSchema.index(
  { doctor: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['booked', 'in-consultation'] },
    },
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
