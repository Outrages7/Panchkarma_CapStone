import mongoose from 'mongoose';

const labResultSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
      index: true,
    },
    orderingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ordering doctor is required'],
    },
    labOrderName: {
      type: String,
      required: [true, 'Lab order name is required'],
      trim: true,
      maxlength: [200, 'Lab order name cannot exceed 200 characters'],
    },
    orderedDate: {
      type: Date,
      required: [true, 'Ordered date is required'],
      default: Date.now,
    },
    collectionDate: {
      type: Date,
    },
    resultDate: {
      type: Date,
    },
    tests: [
      {
        testName: {
          type: String,
          required: [true, 'Test name is required'],
          trim: true,
        },
        resultValue: {
          type: String,
          required: [true, 'Result value is required'],
        },
        unit: {
          type: String,
          required: [true, 'Unit is required'],
        },
        referenceRange: {
          type: String,
          required: [true, 'Reference range is required'],
        },
        status: {
          type: String,
          enum: {
            values: ['normal', 'abnormal', 'critical'],
            message: 'Status must be normal, abnormal, or critical',
          },
          required: [true, 'Test status is required'],
        },
        notes: String,
      },
    ],
    overallStatus: {
      type: String,
      enum: {
        values: ['pending', 'partial', 'completed', 'cancelled'],
        message: 'Overall status must be pending, partial, completed, or cancelled',
      },
      default: 'pending',
      index: true,
    },
    fileAttachmentUrl: {
      type: String,
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
labResultSchema.index({ patient: 1, resultDate: -1 });
labResultSchema.index({ patient: 1, overallStatus: 1 });
labResultSchema.index({ orderingDoctor: 1 });

const LabResult = mongoose.model('LabResult', labResultSchema);

export default LabResult;
