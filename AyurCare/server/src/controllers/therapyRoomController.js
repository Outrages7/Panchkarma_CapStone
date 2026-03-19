import TherapyRoom from '../models/TherapyRoom.js';

export const getAllRooms = async (req, res) => {
  try {
    const { isActive, therapy } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (therapy) query.suitableTherapies = therapy;
    const rooms = await TherapyRoom.find(query).sort({ name: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const room = await TherapyRoom.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await TherapyRoom.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await TherapyRoom.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
