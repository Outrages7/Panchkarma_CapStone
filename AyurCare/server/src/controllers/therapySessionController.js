import TherapySession from '../models/TherapySession.js';
import TreatmentPlan from '../models/TreatmentPlan.js';

export const getPatientSessions = async (req, res) => {
  try {
    const sessions = await TherapySession.find({ patient: req.user._id })
      .populate('therapyType', 'name displayName')
      .populate('practitioner', 'firstName lastName specialization')
      .populate('therapyRoom', 'name roomNumber')
      .sort({ scheduledDate: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getTodaySessions = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await TherapySession.find({
      practitioner: req.user._id,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('patient', 'firstName lastName phone')
      .populate('therapyType', 'name displayName')
      .populate('therapyRoom', 'name roomNumber')
      .sort({ scheduledDate: 1 });

    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const session = await TherapySession.create({
      ...req.body,
      practitioner: req.user._id,
    });
    // Increment totalSessions on treatment plan
    await TreatmentPlan.findByIdAndUpdate(req.body.treatmentPlan, {
      $inc: { totalSessions: 1 },
    });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const startSession = async (req, res) => {
  try {
    const session = await TherapySession.findOneAndUpdate(
      { _id: req.params.id, practitioner: req.user._id, status: 'scheduled' },
      { status: 'in-progress', actualStartTime: new Date(), ...req.body },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, error: 'Session not found or cannot be started' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const now = new Date();
    const session = await TherapySession.findOneAndUpdate(
      { _id: req.params.id, practitioner: req.user._id, status: 'in-progress' },
      { status: 'completed', actualEndTime: now, ...req.body },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, error: 'Session not found or not in progress' });

    // Update treatment plan progress
    const plan = await TreatmentPlan.findById(session.treatmentPlan);
    if (plan) {
      const completedSessions = plan.completedSessions + 1;
      const progress = plan.totalSessions > 0
        ? Math.round((completedSessions / plan.totalSessions) * 100)
        : 0;
      await TreatmentPlan.findByIdAndUpdate(session.treatmentPlan, {
        completedSessions,
        progress,
        ...(progress >= 100 ? { status: 'completed' } : {}),
      });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const addSessionNotes = async (req, res) => {
  try {
    const { sessionNotes, patientCondition, proceduresPerformed, medicinesUsed, vitalsBefore, vitalsAfter } = req.body;
    const session = await TherapySession.findOneAndUpdate(
      { _id: req.params.id, practitioner: req.user._id },
      { sessionNotes, patientCondition, proceduresPerformed, medicinesUsed, vitalsBefore, vitalsAfter },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { rating, comments, painLevel } = req.body;
    const session = await TherapySession.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id, status: 'completed' },
      {
        patientFeedback: { rating, comments, painLevel, submittedAt: new Date() },
      },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, error: 'Session not found or not completed' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const reportSymptoms = async (req, res) => {
  try {
    const { sideEffectsReported, symptoms } = req.body;
    const session = await TherapySession.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { sideEffectsReported: sideEffectsReported || symptoms },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, data: session, message: 'Symptoms reported. Your practitioner has been notified.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getPractitionerSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const query = { practitioner: req.user._id };
    if (status) query.status = status;
    const sessions = await TherapySession.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('therapyType', 'name displayName')
      .populate('therapyRoom', 'name roomNumber')
      .sort({ scheduledDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await TherapySession.countDocuments(query);
    res.json({ success: true, data: sessions, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const session = await TherapySession.findOneAndUpdate(
      { _id: req.params.id },
      { status: 'cancelled', cancelledBy: req.user._id, cancellationReason },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: d, $lte: end };
    }
    const sessions = await TherapySession.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('practitioner', 'firstName lastName specialization')
      .populate('therapyType', 'name displayName')
      .sort({ scheduledDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await TherapySession.countDocuments(query);
    res.json({ success: true, data: sessions, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
