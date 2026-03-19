import AyurvedicMedicine from '../models/AyurvedicMedicine.js';

export const getMedicines = async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };
    const medicines = await AyurvedicMedicine.find(query).sort({ name: 1 });
    res.json({ success: true, data: medicines });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const medicine = await AyurvedicMedicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const addMedicine = async (req, res) => {
  try {
    const medicine = await AyurvedicMedicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await AyurvedicMedicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
    const medicine = await AyurvedicMedicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found' });
    if (operation === 'subtract') {
      if (medicine.stockQuantity < quantity) {
        return res.status(400).json({ success: false, error: 'Insufficient stock' });
      }
      medicine.stockQuantity -= quantity;
    } else {
      medicine.stockQuantity += quantity;
    }
    await medicine.save();
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getLowStockAlerts = async (req, res) => {
  try {
    const medicines = await AyurvedicMedicine.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
    }).sort({ stockQuantity: 1 });
    res.json({ success: true, data: medicines, count: medicines.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
