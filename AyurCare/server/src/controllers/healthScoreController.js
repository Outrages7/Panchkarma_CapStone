import HealthScore from '../models/HealthScore.js';

export const getMyScores = async (req, res) => {
  try {
    const scores = await HealthScore.find({ patient: req.user._id })
      .sort({ scoreDate: -1 })
      .limit(20);
    res.json({ success: true, data: scores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const recordScore = async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user._id : req.body.patient;
    const score = await HealthScore.create({
      ...req.body,
      patient: patientId,
      recordedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: score });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getPatientScores = async (req, res) => {
  try {
    const scores = await HealthScore.find({ patient: req.params.patientId })
      .sort({ scoreDate: -1 })
      .limit(30);
    res.json({ success: true, data: scores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getScoreTrend = async (req, res) => {
  try {
    const scores = await HealthScore.find({ patient: req.params.patientId })
      .select('overallScore scoreDate categories')
      .sort({ scoreDate: 1 })
      .limit(30);

    const trend = scores.map(s => ({
      date: s.scoreDate,
      overall: s.overallScore,
      physical: s.categories?.physicalHealth,
      mental: s.categories?.mentalWellbeing,
      digestive: s.categories?.digestiveHealth,
      energy: s.categories?.energyLevel,
    }));

    res.json({ success: true, data: trend });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
