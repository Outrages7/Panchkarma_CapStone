import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  name: { type: String, enum: ['purvakarma', 'pradhanakarma', 'paschatkarma'], required: true },
  displayName: String,
  durationDays: Number,
  description: String,
  instructions: [String],
  medicines: [String],
}, { _id: false });

const therapyTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana'],
    required: true,
    unique: true,
  },
  displayName: { type: String, required: true },
  description: { type: String, required: true },
  sanskrit: String,
  primaryDosha: { type: String, enum: ['vata', 'pitta', 'kapha'] },
  totalDurationDays: { type: Number, required: true },
  preparationDays: { type: Number, default: 3 },
  recoveryDays: { type: Number, default: 7 },
  stages: [stageSchema],
  indications: [String],
  contraindications: [String],
  medicinesUsed: [String],
  dietaryRequirements: {
    before: [String],
    during: [String],
    after: [String],
  },
  estimatedCost: Number,
  successRate: { type: Number, min: 0, max: 100 },
  allowedSpecializations: [{
    type: String,
    enum: ['kayachikitsa', 'panchakarma', 'shalya_tantra', 'shalakya_tantra', 'kaumarabhritya', 'agada_tantra', 'rasayana', 'vajikarana', 'dravyaguna', 'manas_roga'],
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TherapyType = mongoose.model('TherapyType', therapyTypeSchema);
export default TherapyType;
