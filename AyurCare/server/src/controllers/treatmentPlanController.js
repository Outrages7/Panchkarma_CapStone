import TreatmentPlan from '../models/TreatmentPlan.js';

export const getMyPlans = async (req, res) => {
  try {
    const plans = await TreatmentPlan.find({ patient: req.user._id })
      .populate('therapyType', 'name displayName description primaryDosha')
      .populate('practitioner', 'firstName lastName specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPlanDetails = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOne({ _id: req.params.id, patient: req.user._id })
      .populate('therapyType')
      .populate('practitioner', 'firstName lastName specialization phone email')
      .populate('stages.medicinesAssigned.medicine', 'name type description');
    if (!plan) return res.status(404).json({ success: false, error: 'Treatment plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPractitionerPlans = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { practitioner: req.user._id };
    if (status) query.status = status;
    const plans = await TreatmentPlan.find(query)
      .populate('patient', 'firstName lastName email phone dateOfBirth')
      .populate('therapyType', 'name displayName primaryDosha')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await TreatmentPlan.countDocuments(query);
    res.json({ success: true, data: plans, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.create({
      ...req.body,
      practitioner: req.user._id,
    });
    await plan.populate('therapyType', 'name displayName');
    await plan.populate('patient', 'firstName lastName email');
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOneAndUpdate(
      { _id: req.params.id, practitioner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('therapyType', 'name displayName').populate('patient', 'firstName lastName');
    if (!plan) return res.status(404).json({ success: false, error: 'Treatment plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updatePlanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const plan = await TreatmentPlan.findOneAndUpdate(
      { _id: req.params.id, practitioner: req.user._id },
      { status },
      { new: true }
    );
    if (!plan) return res.status(404).json({ success: false, error: 'Treatment plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const plans = await TreatmentPlan.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('practitioner', 'firstName lastName specialization')
      .populate('therapyType', 'name displayName primaryDosha')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await TreatmentPlan.countDocuments(query);
    res.json({ success: true, data: plans, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
