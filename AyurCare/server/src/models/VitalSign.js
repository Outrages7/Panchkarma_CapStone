import mongoose from 'mongoose';

const vitalSignSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
      index: true,
    },
    recordedDate: {
      type: Date,
      required: [true, 'Recorded date is required'],
      default: Date.now,
      index: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by is required'],
    },
    recordedByRole: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'nurse', 'system'],
        message: 'Recorded by role must be patient, doctor, nurse, or system',
      },
      required: [true, 'Recorded by role is required'],
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: [40, 'Systolic must be at least 40'],
        max: [300, 'Systolic cannot exceed 300'],
      },
      diastolic: {
        type: Number,
        min: [20, 'Diastolic must be at least 20'],
        max: [200, 'Diastolic cannot exceed 200'],
      },
    },
    heartRate: {
      type: Number,
      min: [20, 'Heart rate must be at least 20'],
      max: [300, 'Heart rate cannot exceed 300'],
    },
    temperature: {
      value: {
        type: Number,
        min: [90, 'Temperature must be at least 90'],
        max: [115, 'Temperature cannot exceed 115'],
      },
      unit: {
        type: String,
        enum: {
          values: ['F', 'C'],
          message: 'Temperature unit must be F or C',
        },
        default: 'F',
      },
    },
    weight: {
      value: {
        type: Number,
        min: [0, 'Weight must be positive'],
        max: [1000, 'Weight cannot exceed 1000'],
      },
      unit: {
        type: String,
        enum: {
          values: ['kg', 'lbs'],
          message: 'Weight unit must be kg or lbs',
        },
        default: 'kg',
      },
    },
    height: {
      value: {
        type: Number,
        min: [0, 'Height must be positive'],
        max: [300, 'Height cannot exceed 300 cm'],
      },
      unit: {
        type: String,
        enum: {
          values: ['cm', 'in'],
          message: 'Height unit must be cm or in',
        },
        default: 'cm',
      },
    },
    bmi: {
      type: Number,
    },
    oxygenSaturation: {
      type: Number,
      min: [0, 'O2 saturation must be at least 0%'],
      max: [100, 'O2 saturation cannot exceed 100%'],
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for time-series queries
vitalSignSchema.index({ patient: 1, recordedDate: -1 });
vitalSignSchema.index({ recordedBy: 1, recordedDate: -1 });

// Pre-save hook to calculate BMI
vitalSignSchema.pre('save', function (next) {
  if (this.weight?.value && this.height?.value) {
    let weightKg = this.weight.unit === 'lbs' ? this.weight.value * 0.453592 : this.weight.value;
    let heightM = this.height.unit === 'in' ? this.height.value * 0.0254 : this.height.value / 100;

    this.bmi = Number((weightKg / (heightM * heightM)).toFixed(2));
  }
  next();
});

const VitalSign = mongoose.model('VitalSign', vitalSignSchema);

export default VitalSign;
