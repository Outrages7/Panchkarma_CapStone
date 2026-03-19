import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required'],
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    waitlistEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Waitlist',
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    slotTime: {
      type: Date,
      required: [true, 'Slot time is required'],
    },
    decision: {
      type: String,
      enum: ['assigned', 'rejected', 'deferred', 'reassigned'],
      required: [true, 'Decision is required'],
    },
    reasoning: {
      type: String,
      required: [true, 'Reasoning is required'],
      maxlength: [2000, 'Reasoning cannot exceed 2000 characters'],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: [true, 'Confidence score is required'],
    },
    factors: [
      {
        factor: String,
        weight: Number,
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    alternativeOptions: [
      {
        doctor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        slotTime: Date,
        score: Number,
        reason: String,
      },
    ],
    modelVersion: {
      type: String,
      default: 'v1.0',
    },
    executionTime: {
      type: Number, // milliseconds
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
aiLogSchema.index({ doctor: 1, createdAt: -1 });
aiLogSchema.index({ patient: 1, createdAt: -1 });
aiLogSchema.index({ decision: 1, createdAt: -1 });
aiLogSchema.index({ createdAt: -1 });

const AILog = mongoose.model('AILog', aiLogSchema);

export default AILog;
