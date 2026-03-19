import mongoose from 'mongoose';

const allergySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
      index: true,
    },
    allergen: {
      type: String,
      required: [true, 'Allergen name is required'],
      trim: true,
      maxlength: [200, 'Allergen name cannot exceed 200 characters'],
    },
    severity: {
      type: String,
      enum: {
        values: ['mild', 'moderate', 'severe'],
        message: 'Severity must be mild, moderate, or severe',
      },
      required: [true, 'Severity is required'],
      index: true,
    },
    reaction: {
      type: String,
      required: [true, 'Reaction description is required'],
      trim: true,
      maxlength: [500, 'Reaction cannot exceed 500 characters'],
    },
    diagnosedDate: {
      type: Date,
      required: [true, 'Diagnosed date is required'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedByRole: {
      type: String,
      enum: {
        values: ['patient', 'doctor'],
        message: 'Added by role must be patient or doctor',
      },
      required: true,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
allergySchema.index({ patient: 1, createdAt: -1 });
allergySchema.index({ patient: 1, severity: 1 });
allergySchema.index({ patient: 1, isActive: 1 });

const Allergy = mongoose.model('Allergy', allergySchema);

export default Allergy;
