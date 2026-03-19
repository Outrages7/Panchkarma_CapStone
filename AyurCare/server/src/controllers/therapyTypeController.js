import TherapyType from '../models/TherapyType.js';

export const getAll = async (req, res) => {
  try {
    const therapyTypes = await TherapyType.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: therapyTypes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const therapyType = await TherapyType.findById(req.params.id);
    if (!therapyType) return res.status(404).json({ success: false, error: 'Therapy type not found' });
    res.json({ success: true, data: therapyType });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const therapyType = await TherapyType.create(req.body);
    res.status(201).json({ success: true, data: therapyType });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const therapyType = await TherapyType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!therapyType) return res.status(404).json({ success: false, error: 'Therapy type not found' });
    res.json({ success: true, data: therapyType });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deactivate = async (req, res) => {
  try {
    const therapyType = await TherapyType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!therapyType) return res.status(404).json({ success: false, error: 'Therapy type not found' });
    res.json({ success: true, message: 'Therapy type deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
