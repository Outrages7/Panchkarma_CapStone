import mongoose from 'mongoose';

const planStageSchema = new mongoose.Schema({
  stageName: { type: String, enum: ['purvakarma', 'pradhanakarma', 'paschatkarma'] },
  startDate: Date,
  endDate: Date,
  instructions: [String],
  dietInstructions: [String],
  medicinesAssigned: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'AyurvedicMedicine' },
    dosage: String,
    frequency: String,
    timing: String,
  }],
  isCompleted: { type: Boolean, default: false },
  completedDate: Date,
  notes: String,
}, { _id: false });

const treatmentPlanSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  practitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapyType: { type: mongoose.Schema.Types.ObjectId, ref: 'TherapyType', required: true },
  title: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  totalSessions: { type: Number, default: 0 },
  completedSessions: { type: Number, default: 0 },
  stages: [planStageSchema],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  healthScoreBefore: { type: Number, min: 0, max: 100 },
  healthScoreAfter: { type: Number, min: 0, max: 100 },
  dietPlan: String,
  lifestyleAdvice: String,
  chiefComplaints: [String],
  goals: [String],
  contraindications: [String],
  practitionerNotes: String,
}, { timestamps: true });

treatmentPlanSchema.index({ patient: 1, status: 1 });
treatmentPlanSchema.index({ practitioner: 1, status: 1 });
treatmentPlanSchema.index({ startDate: -1 });

const TreatmentPlan = mongoose.model('TreatmentPlan', treatmentPlanSchema);
export default TreatmentPlan;
