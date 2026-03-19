import mongoose from 'mongoose';

const symptomEntrySchema = new mongoose.Schema({
  symptom: { type: String, required: true },
  severity: { type: Number, min: 0, max: 10 },
  date: { type: Date, default: Date.now },
  stage: { type: String, enum: ['purvakarma', 'pradhanakarma', 'paschatkarma', 'post-treatment'] },
}, { _id: false });

const healthScoreSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  treatmentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentPlan' },
  scoreDate: { type: Date, default: Date.now },
  overallScore: { type: Number, min: 0, max: 100, required: true },
  categories: {
    physicalHealth: { type: Number, min: 0, max: 100 },
    mentalWellbeing: { type: Number, min: 0, max: 100 },
    digestiveHealth: { type: Number, min: 0, max: 100 },
    energyLevel: { type: Number, min: 0, max: 100 },
    sleepQuality: { type: Number, min: 0, max: 100 },
  },
  symptoms: [symptomEntrySchema],
  notes: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

healthScoreSchema.index({ patient: 1, scoreDate: -1 });
healthScoreSchema.index({ treatmentPlan: 1, scoreDate: -1 });

const HealthScore = mongoose.model('HealthScore', healthScoreSchema);
export default HealthScore;
