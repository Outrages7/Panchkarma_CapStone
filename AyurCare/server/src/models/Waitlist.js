import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Can be null if waiting for any doctor in department
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    triageLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['waiting', 'assigned', 'expired', 'cancelled'],
      default: 'waiting',
    },
    estimatedWaitTime: {
      type: Number, // minutes
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiReasoning: {
      type: String,
      maxlength: [1000, 'AI reasoning cannot exceed 1000 characters'],
    },
    assignedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    assignedAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
waitlistSchema.index({ patient: 1, status: 1 });
waitlistSchema.index({ doctor: 1, status: 1 });
waitlistSchema.index({ department: 1, status: 1, priority: -1 });
waitlistSchema.index({ status: 1, createdAt: 1 });
waitlistSchema.index({ expiresAt: 1 });

// Virtual for position in queue (calculated at query time)
waitlistSchema.virtual('position').get(function () {
  return this._position;
});

// Auto-expire old waitlist entries
waitlistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
