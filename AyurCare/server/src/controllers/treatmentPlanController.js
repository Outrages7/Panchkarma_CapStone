import TreatmentPlan from '../models/TreatmentPlan.js';
import TherapySession from '../models/TherapySession.js';
import { notifyTreatmentPlanCreated, notifyTreatmentPlanUpdated } from '../utils/notificationService.js';

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

    // Fire-and-forget notification
    notifyTreatmentPlanCreated({ patientId: plan.patient._id || plan.patient, plan }).catch(() => {});
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

    // Fire-and-forget notification
    notifyTreatmentPlanUpdated({ patientId: plan.patient._id || plan.patient, plan }).catch(() => {});
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

/**
 * Get all therapy sessions linked to a specific treatment plan.
 * Available to patient (own plan), doctor (own plan), and admin.
 */
export const getPlanSessions = async (req, res) => {
  try {
    const { upcoming } = req.query;
    const query = { treatmentPlan: req.params.id };

    // If patient, ensure they own this plan
    if (req.user.role === 'patient') {
      const plan = await TreatmentPlan.findOne({ _id: req.params.id, patient: req.user._id });
      if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'in-progress'] };
    }

    const sessions = await TherapySession.find(query)
      .populate('therapyType', 'name displayName')
      .populate('practitioner', 'firstName lastName specialization')
      .populate('therapyRoom', 'name roomNumber')
      .sort({ scheduledDate: 1 });

    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Auto-generate TherapySession documents from the plan's sessionSchedule.
 * Idempotent — skips dates that already have a session scheduled.
 * Only accessible to doctors who own the plan.
 */
export const generateScheduledSessions = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOne({ _id: req.params.id, practitioner: req.user._id })
      .populate('therapyType', 'name displayName');

    if (!plan) return res.status(404).json({ success: false, error: 'Treatment plan not found' });
    if (!plan.sessionSchedule || plan.sessionSchedule.length === 0) {
      return res.status(400).json({ success: false, error: 'No session schedule defined on this plan' });
    }
    if (!plan.endDate) {
      return res.status(400).json({ success: false, error: 'Plan must have an end date to generate sessions' });
    }

    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const now = new Date();

    // Start from today if the plan already started, otherwise from startDate
    const cursor = start < now ? new Date(now) : new Date(start);
    cursor.setHours(0, 0, 0, 0);

    // Fetch existing session dates to avoid duplicates
    const existingSessions = await TherapySession.find({ treatmentPlan: plan._id }).select('scheduledDate');
    const existingTimestamps = new Set(existingSessions.map(s => new Date(s.scheduledDate).getTime()));

    const sessionsToCreate = [];
    let sessionCounter = existingSessions.length + 1;
    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const stage = plan.stages?.find(s => !s.isCompleted)?.stageName
      || plan.stages?.[0]?.stageName
      || 'pradhanakarma';

    while (cursor <= end) {
      const dayName = DAYS[cursor.getDay()];
      const scheduleSlot = plan.sessionSchedule.find(s => s.dayOfWeek === dayName);

      if (scheduleSlot) {
        const [hour, minute] = scheduleSlot.time.split(':').map(Number);
        const sessionDate = new Date(cursor);
        sessionDate.setHours(hour, minute, 0, 0);

        if (sessionDate > now && !existingTimestamps.has(sessionDate.getTime())) {
          sessionsToCreate.push({
            treatmentPlan: plan._id,
            patient: plan.patient,
            practitioner: plan.practitioner,
            therapyType: plan.therapyType._id,
            ...(plan.therapyRoom && { therapyRoom: plan.therapyRoom }),
            scheduledDate: sessionDate,
            durationMinutes: scheduleSlot.durationMinutes || 60,
            stage,
            sessionNumber: sessionCounter++,
            status: 'scheduled',
          });
          existingTimestamps.add(sessionDate.getTime());
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (sessionsToCreate.length === 0) {
      return res.json({
        success: true,
        created: 0,
        message: 'No new sessions to generate — all slots already exist or the plan period has passed',
      });
    }

    await TherapySession.insertMany(sessionsToCreate);

    const totalNow = existingSessions.length + sessionsToCreate.length;
    await TreatmentPlan.findByIdAndUpdate(plan._id, { totalSessions: totalNow });

    res.json({
      success: true,
      created: sessionsToCreate.length,
      total: totalNow,
      message: `Generated ${sessionsToCreate.length} sessions successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
