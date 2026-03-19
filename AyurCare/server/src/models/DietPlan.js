import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'herbal-drink'] },
  foods: [String],
  avoidFoods: [String],
  timing: String,
  notes: String,
}, { _id: false });

const dietPlanSchema = new mongoose.Schema({
  treatmentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentPlan', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  practitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapyStage: {
    type: String,
    enum: ['purvakarma', 'pradhanakarma', 'paschatkarma', 'all'],
    default: 'all',
  },
  meals: [mealSchema],
  generalGuidelines: [String],
  herbalTeas: [String],
  waterIntake: String,
  avoidanceList: [String],
  specialInstructions: String,
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

dietPlanSchema.index({ patient: 1, isActive: 1 });
dietPlanSchema.index({ treatmentPlan: 1 });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
