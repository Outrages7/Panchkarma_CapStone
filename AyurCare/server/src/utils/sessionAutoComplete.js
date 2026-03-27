import TherapySession from '../models/TherapySession.js';
import TreatmentPlan from '../models/TreatmentPlan.js';
import { notifySessionCompleted } from './notificationService.js';

/**
 * Auto-complete sessions that have been 'in-progress' for too long
 * (i.e. the doctor forgot to press "End"). Buffer: 2 hours after expected end.
 * Runs on an interval set in server.js.
 *
 * No-show is intentionally NOT automated — only the doctor can mark a patient
 * as no-show.
 */
const AUTO_COMPLETE_BUFFER_MINUTES = 120; // 2-hour grace period

export const autoCompleteStaleSessions = async () => {
  try {
    const now = new Date();

    // Find sessions that are still in-progress and have been started
    const staleSessions = await TherapySession.find({
      status: 'in-progress',
      actualStartTime: { $exists: true },
    });

    let autoCompleted = 0;

    for (const session of staleSessions) {
      const duration = session.durationMinutes || 60;
      const expectedEnd = new Date(session.actualStartTime.getTime() + (duration + AUTO_COMPLETE_BUFFER_MINUTES) * 60000);

      if (now > expectedEnd) {
        session.status = 'completed';
        session.actualEndTime = new Date(session.actualStartTime.getTime() + duration * 60000);
        session.sessionNotes = (session.sessionNotes || '') + '\n[Auto-completed by system]';
        await session.save();

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

        // Notify patient
        notifySessionCompleted({ patientId: session.patient, session }).catch(() => {});
        autoCompleted++;
      }
    }

    if (autoCompleted > 0) {
      console.log(`[SessionAutoComplete] Auto-completed ${autoCompleted} stale session(s)`);
    }
  } catch (err) {
    console.error('[SessionAutoComplete] Error:', err.message);
  }
};

export default autoCompleteStaleSessions;
