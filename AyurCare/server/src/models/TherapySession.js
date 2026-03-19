import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
  bloodPressure: String,
  pulse: Number,
  temperature: Number,
  weight: Number,
  generalCondition: { type: String, enum: ['good', 'fair', 'poor'] },
}, { _id: false });

const therapySessionSchema = new mongoose.Schema({
  treatmentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentPlan', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  practitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapyRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'TherapyRoom' },
  therapyType: { type: mongoose.Schema.Types.ObjectId, ref: 'TherapyType', required: true },
  scheduledDate: { type: Date, required: true },
  actualStartTime: Date,
  actualEndTime: Date,
  durationMinutes: Number,
  stage: {
    type: String,
    enum: ['purvakarma', 'pradhanakarma', 'paschatkarma'],
    required: true,
  },
  sessionNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  sessionNotes: String,
  patientCondition: String,
  proceduresPerformed: [String],
  medicinesUsed: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'AyurvedicMedicine' },
    quantity: Number,
    unit: String,
  }],
  vitalsBefore: vitalsSchema,
  vitalsAfter: vitalsSchema,
  patientFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    painLevel: { type: Number, min: 0, max: 10 },
    submittedAt: Date,
  },
  sideEffectsReported: [String],
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: String,
}, { timestamps: true });

therapySessionSchema.index({ patient: 1, scheduledDate: -1 });
therapySessionSchema.index({ practitioner: 1, scheduledDate: -1 });
therapySessionSchema.index({ treatmentPlan: 1, sessionNumber: 1 });
therapySessionSchema.index({ status: 1, scheduledDate: -1 });

const TherapySession = mongoose.model('TherapySession', therapySessionSchema);
export default TherapySession;
