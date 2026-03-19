import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
    lastMessage: {
      text: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },
    unreadCount: {
      patient: { type: Number, default: 0 },
      doctor: { type: Number, default: 0 },
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique patient-doctor conversations
conversationSchema.index({ 'participants.patient': 1, 'participants.doctor': 1 }, { unique: true });

// Index for faster lookups
conversationSchema.index({ 'participants.patient': 1 });
conversationSchema.index({ 'participants.doctor': 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
