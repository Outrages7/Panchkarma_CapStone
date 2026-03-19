import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
      index: true,
    },
    medicationName: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
      maxlength: [200, 'Medication name cannot exceed 200 characters'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
      maxlength: [100, 'Dosage cannot exceed 100 characters'],
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
      maxlength: [100, 'Frequency cannot exceed 100 characters'],
    },
    prescribingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Prescribing doctor is required'],
    },
    prescribedDate: {
      type: Date,
      required: [true, 'Prescribed date is required'],
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'discontinued', 'completed'],
        message: 'Status must be active, discontinued, or completed',
      },
      default: 'active',
      index: true,
    },
    discontinuedDate: Date,
    discontinuedReason: {
      type: String,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    instructions: {
      type: String,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters'],
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
medicationSchema.index({ patient: 1, status: 1 });
medicationSchema.index({ patient: 1, createdAt: -1 });
medicationSchema.index({ prescribingDoctor: 1 });

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;
