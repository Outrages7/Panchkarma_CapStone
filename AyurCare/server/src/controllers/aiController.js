import { computeRecommendation, assessRiskLevel } from '../utils/ayurvedicRules.js';
import TherapyType from '../models/TherapyType.js';
import TreatmentPlan from '../models/TreatmentPlan.js';
import TherapySession from '../models/TherapySession.js';
import HealthScore from '../models/HealthScore.js';
import User from '../models/User.js';

export const recommendTherapy = async (req, res) => {
  try {
    const { symptoms, dominantDosha } = req.body;
    const patient = await User.findById(req.user._id);
    const medicalHistory = patient.medicalHistory || [];

    const recs = computeRecommendation(
      symptoms || [],
      dominantDosha || patient.ayurvedicProfile?.dominantDosha,
      medicalHistory
    );

    // Enrich with TherapyType details
    const enriched = await Promise.all(
      recs.map(async (rec) => {
        const type = await TherapyType.findOne({ name: rec.therapy });
        return {
          ...rec,
          displayName: type?.displayName || rec.therapy,
          description: type?.description,
          primaryDosha: type?.primaryDosha,
          totalDurationDays: type?.totalDurationDays,
          estimatedCost: type?.estimatedCost,
        };
      })
    );

    res.json({ success: true, data: { recommendations: enriched, basedOn: { symptoms, dosha: dominantDosha } } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const predictSuccess = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findById(req.params.treatmentPlanId)
      .populate('therapyType', 'name successRate')
      .populate('patient', 'ayurvedicProfile');

    if (!plan) return res.status(404).json({ success: false, error: 'Treatment plan not found' });

    let score = 50; // base
    const factors = [];

    // Factor 1: Session adherence
    if (plan.totalSessions > 0) {
      const adherence = (plan.completedSessions / plan.totalSessions) * 100;
      if (adherence >= 80) { score += 20; factors.push('Excellent session adherence (80%+)'); }
      else if (adherence >= 50) { score += 10; factors.push('Good session adherence (50%+)'); }
      else { score -= 10; factors.push('Low session adherence (below 50%)'); }
    }

    // Factor 2: Initial health score
    if (plan.healthScoreBefore) {
      if (plan.healthScoreBefore > 60) { score += 10; factors.push('Good initial health baseline'); }
      else if (plan.healthScoreBefore < 30) { score -= 5; factors.push('Low initial health score'); }
    }

    // Factor 3: Prakriti assessment done
    if (plan.patient?.ayurvedicProfile?.prakriti) {
      score += 10;
      factors.push('Ayurvedic constitution (Prakriti) assessed');
    }

    // Factor 4: Therapy historical success rate
    if (plan.therapyType?.successRate) {
      score = Math.round((score + plan.therapyType.successRate) / 2);
      factors.push(`Therapy type historical success rate: ${plan.therapyType.successRate}%`);
    }

    score = Math.max(10, Math.min(95, score));

    res.json({ success: true, data: { probability: score, factors } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const riskCheck = async (req, res) => {
  try {
    const recentScores = await HealthScore.find({ patient: req.params.patientId })
      .sort({ scoreDate: -1 })
      .limit(5);

    const allSymptoms = recentScores.flatMap(s => s.symptoms || []);
    const scoreTrend = recentScores.map(s => s.overallScore).reverse();

    const { riskLevel, riskScore, alerts } = assessRiskLevel(allSymptoms, scoreTrend);

    res.json({ success: true, data: { riskLevel, riskScore, alerts, assessedAt: new Date() } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const smartSchedule = async (req, res) => {
  try {
    const { practitionerId, therapyTypeId, preferredDateStart, preferredDateEnd, durationMinutes = 60 } = req.body;

    const start = new Date(preferredDateStart);
    const end = new Date(preferredDateEnd);

    // Get existing sessions for this practitioner in the date range
    const existingSessions = await TherapySession.find({
      practitioner: practitionerId,
      scheduledDate: { $gte: start, $lte: end },
      status: { $in: ['scheduled', 'in-progress'] },
    }).select('scheduledDate durationMinutes');

    // Generate available slots (9am-5pm, every hour)
    const slots = [];
    const current = new Date(start);
    current.setHours(9, 0, 0, 0);

    while (current <= end) {
      if (current.getDay() !== 0) { // Skip Sundays
        for (let hour = 9; hour <= 16; hour++) {
          const slotTime = new Date(current);
          slotTime.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotTime.getTime() + durationMinutes * 60000);

          const isBooked = existingSessions.some(s => {
            const sessionStart = new Date(s.scheduledDate);
            const sessionEnd = new Date(sessionStart.getTime() + (s.durationMinutes || 60) * 60000);
            return slotTime < sessionEnd && slotEnd > sessionStart;
          });

          if (!isBooked) {
            slots.push({
              dateTime: new Date(slotTime),
              available: true,
            });
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }

    res.json({ success: true, data: { availableSlots: slots.slice(0, 20) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
