import mongoose from 'mongoose';

const therapyRoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, default: 1 },
  availableEquipment: [String],
  supportedTherapies: [{
    type: String,
    enum: ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana'],
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available',
  },
  currentSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TherapySession',
  },
  floor: Number,
  notes: String,
}, { timestamps: true });

therapyRoomSchema.index({ status: 1 });

const TherapyRoom = mongoose.model('TherapyRoom', therapyRoomSchema);
export default TherapyRoom;
