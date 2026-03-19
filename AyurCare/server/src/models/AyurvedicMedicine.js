import mongoose from 'mongoose';

const ayurvedicMedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sanskritName: String,
  type: {
    type: String,
    enum: ['herb', 'oil', 'powder', 'decoction', 'ghee', 'tablet', 'capsule'],
    required: true,
  },
  description: String,
  indications: [String],
  contraindications: [String],
  doshaBalance: {
    vata: { type: String, enum: ['increases', 'decreases', 'neutral'], default: 'neutral' },
    pitta: { type: String, enum: ['increases', 'decreases', 'neutral'], default: 'neutral' },
    kapha: { type: String, enum: ['increases', 'decreases', 'neutral'], default: 'neutral' },
  },
  stockQuantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  reorderLevel: { type: Number, default: 10 },
  supplier: String,
  costPerUnit: Number,
  expiryDate: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ayurvedicMedicineSchema.index({ name: 1 });
ayurvedicMedicineSchema.index({ type: 1 });
ayurvedicMedicineSchema.index({ stockQuantity: 1 });

const AyurvedicMedicine = mongoose.model('AyurvedicMedicine', ayurvedicMedicineSchema);
export default AyurvedicMedicine;
