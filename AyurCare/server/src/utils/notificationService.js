import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ─── Email Transporter (lazy-init, no-ops if unconfigured) ──────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // SMTP not configured — skip email silently
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

// ─── Core: send email (fire-and-forget) ─────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = getTransporter();
    if (!t) {
      console.warn('Email skipped (SMTP not configured):', subject, '→', to);
      return false;
    }
    await t.sendMail({
      from: process.env.SMTP_FROM || `"AyurCare" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', subject, '→', to);
    return true;
  } catch (err) {
    console.error(`Email send FAILED to ${to}:`, err.message);
    console.error('Full error:', err.code, err.response || '');
    return false;
  }
};

// ─── Core: create in-app notification + optional email ──────────────────
const createNotification = async ({ recipientId, type, title, message, link, metadata }) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      metadata,
    });

    // Attempt email
    const user = await User.findById(recipientId).select('email firstName');
    if (user?.email) {
      const emailed = await sendEmail({
        to: user.email,
        subject: `AyurCare — ${title}`,
        html: buildEmailHtml({ title, message, link, userName: user.firstName }),
      });
      if (emailed) {
        notification.isEmailed = true;
        await notification.save();
      }
    }

    return notification;
  } catch (err) {
    console.error('Create notification error:', err.message);
    return null;
  }
};

// ─── Email HTML template ────────────────────────────────────────────────
const buildEmailHtml = ({ title, message, link, userName }) => {
  const btnHtml = link
    ? `<a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${link}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#059669;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">View Details</a>`
    : '';
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fafaf9;border:1px solid #e7e5e4;border-radius:24px;overflow:hidden;">
      <div style="background:#0c0a09;padding:32px 28px 20px;">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">🌿 AyurCare</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 6px;color:#78716c;font-size:13px;">Hello ${userName || 'there'},</p>
        <h2 style="margin:0 0 12px;color:#1c1917;font-size:18px;font-weight:800;">${title}</h2>
        <p style="margin:0;color:#44403c;font-size:14px;line-height:1.6;">${message}</p>
        ${btnHtml}
      </div>
      <div style="padding:16px 28px;background:#f5f5f4;border-top:1px solid #e7e5e4;text-align:center;">
        <p style="margin:0;color:#a8a29e;font-size:11px;">This is an automated notification from AyurCare.</p>
      </div>
    </div>
  `;
};

// ─── Convenience helpers ────────────────────────────────────────────────

export const notifyAppointmentBooked = async ({ patientId, doctorId, appointment }) => {
  const doctor = await User.findById(doctorId).select('firstName lastName');
  const patient = await User.findById(patientId).select('firstName lastName');
  const dateStr = new Date(appointment.date).toLocaleDateString('en-IN', { dateStyle: 'medium' });

  // Notify patient
  await createNotification({
    recipientId: patientId,
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: `Your appointment with Dr. ${doctor?.firstName} ${doctor?.lastName} on ${dateStr} has been booked successfully.`,
    link: '/patient/appointments',
    metadata: { appointmentId: appointment._id },
  });

  // Notify doctor
  await createNotification({
    recipientId: doctorId,
    type: 'appointment',
    title: 'New Appointment',
    message: `${patient?.firstName} ${patient?.lastName} has booked an appointment on ${dateStr}.`,
    link: '/doctor/appointments',
    metadata: { appointmentId: appointment._id },
  });
};

export const notifyAppointmentCancelled = async ({ patientId, doctorId, appointment, cancelledByRole }) => {
  const doctor = await User.findById(doctorId).select('firstName lastName');
  const patient = await User.findById(patientId).select('firstName lastName');
  const dateStr = new Date(appointment.date).toLocaleDateString('en-IN', { dateStyle: 'medium' });

  if (cancelledByRole === 'patient') {
    await createNotification({
      recipientId: doctorId,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: `${patient?.firstName} ${patient?.lastName} cancelled their appointment on ${dateStr}.`,
      link: '/doctor/appointments',
      metadata: { appointmentId: appointment._id },
    });
  } else {
    await createNotification({
      recipientId: patientId,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: `Your appointment with Dr. ${doctor?.firstName} ${doctor?.lastName} on ${dateStr} has been cancelled.`,
      link: '/patient/appointments',
      metadata: { appointmentId: appointment._id },
    });
  }
};

export const notifyAppointmentRescheduled = async ({ patientId, doctorId, appointment }) => {
  const doctor = await User.findById(doctorId).select('firstName lastName');
  const patient = await User.findById(patientId).select('firstName lastName');
  const dateStr = new Date(appointment.date).toLocaleDateString('en-IN', { dateStyle: 'medium' });

  await createNotification({
    recipientId: patientId,
    type: 'appointment',
    title: 'Appointment Rescheduled',
    message: `Your appointment with Dr. ${doctor?.firstName} ${doctor?.lastName} has been rescheduled to ${dateStr}.`,
    link: '/patient/appointments',
    metadata: { appointmentId: appointment._id },
  });

  await createNotification({
    recipientId: doctorId,
    type: 'appointment',
    title: 'Appointment Rescheduled',
    message: `Appointment with ${patient?.firstName} ${patient?.lastName} has been rescheduled to ${dateStr}.`,
    link: '/doctor/appointments',
    metadata: { appointmentId: appointment._id },
  });
};

export const notifyAppointmentStatusChange = async ({ patientId, doctorId, appointment, newStatus }) => {
  const doctor = await User.findById(doctorId).select('firstName lastName');
  const statusMessages = {
    'in-consultation': 'Your consultation has started.',
    'completed': 'Your appointment has been completed.',
    'no-show': 'You were marked as a no-show for your appointment.',
  };
  const msg = statusMessages[newStatus];
  if (!msg) return;

  await createNotification({
    recipientId: patientId,
    type: 'appointment',
    title: `Appointment ${newStatus === 'completed' ? 'Completed' : 'Update'}`,
    message: `${msg} Doctor: Dr. ${doctor?.firstName} ${doctor?.lastName}.`,
    link: '/patient/appointments',
    metadata: { appointmentId: appointment._id },
  });
};

export const notifyTreatmentPlanCreated = async ({ patientId, plan }) => {
  await createNotification({
    recipientId: patientId,
    type: 'treatment',
    title: 'New Treatment Plan',
    message: `A new treatment plan has been created for you. Please review the details and upcoming sessions.`,
    link: '/patient/treatment-plan',
    metadata: { planId: plan._id },
  });
};

export const notifyTreatmentPlanUpdated = async ({ patientId, plan }) => {
  await createNotification({
    recipientId: patientId,
    type: 'treatment',
    title: 'Treatment Plan Updated',
    message: `Your treatment plan has been updated. Please review the latest changes.`,
    link: '/patient/treatment-plan',
    metadata: { planId: plan._id },
  });
};

export const notifySessionScheduled = async ({ patientId, session }) => {
  const dateStr = new Date(session.scheduledDate).toLocaleDateString('en-IN', { dateStyle: 'medium' });
  await createNotification({
    recipientId: patientId,
    type: 'session',
    title: 'Therapy Session Scheduled',
    message: `A therapy session has been scheduled for ${dateStr}. Please arrive on time.`,
    link: '/patient/therapy-progress',
    metadata: { sessionId: session._id },
  });
};

export const notifySessionCompleted = async ({ patientId, session }) => {
  await createNotification({
    recipientId: patientId,
    type: 'session',
    title: 'Therapy Session Completed',
    message: `Your therapy session has been marked as complete. Review your progress.`,
    link: '/patient/therapy-progress',
    metadata: { sessionId: session._id },
  });
};

export const notifyNewDoctorRegistered = async ({ doctor }) => {
  // Notify all admins
  const admins = await User.find({ role: 'admin' }).select('_id');
  for (const admin of admins) {
    await createNotification({
      recipientId: admin._id,
      type: 'system',
      title: 'New Doctor Registration',
      message: `Dr. ${doctor.firstName} ${doctor.lastName} has registered and is awaiting approval.`,
      link: '/admin/doctors',
      metadata: { doctorId: doctor._id },
    });
  }
};

export const notifyLowStock = async ({ medicine }) => {
  const admins = await User.find({ role: 'admin' }).select('_id');
  for (const admin of admins) {
    await createNotification({
      recipientId: admin._id,
      type: 'alert',
      title: 'Low Stock Alert',
      message: `${medicine.name} stock is critically low (${medicine.stockQuantity} ${medicine.unit} remaining).`,
      link: '/admin/inventory',
      metadata: { medicineId: medicine._id },
    });
  }
};

export const sendResetPasswordEmail = async ({ to, userName, resetUrl }) => {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fafaf9;border:1px solid #e7e5e4;border-radius:24px;overflow:hidden;">
      <div style="background:#0c0a09;padding:32px 28px 20px;">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">🌿 AyurCare</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 6px;color:#78716c;font-size:13px;">Hello ${userName || 'there'},</p>
        <h2 style="margin:0 0 12px;color:#1c1917;font-size:18px;font-weight:800;">Reset Your Password</h2>
        <p style="margin:0 0 20px;color:#44403c;font-size:14px;line-height:1.6;">
          We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#059669;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
          Reset Password
        </a>
        <p style="margin:20px 0 0;color:#78716c;font-size:12px;line-height:1.5;">
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0;" />
        <p style="margin:0;color:#a8a29e;font-size:11px;word-break:break-all;">
          If the button doesn't work, copy and paste this link:<br />${resetUrl}
        </p>
      </div>
      <div style="padding:16px 28px;background:#f5f5f4;border-top:1px solid #e7e5e4;text-align:center;">
        <p style="margin:0;color:#a8a29e;font-size:11px;">This is an automated email from AyurCare. Do not reply.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: 'AyurCare — Reset Your Password', html });
};

export const sendOtpEmail = async ({ to, otp, userName = "there" }) => {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fafaf9;border:1px solid #e7e5e4;border-radius:24px;overflow:hidden;">
      <div style="background:#0c0a09;padding:32px 28px 20px;">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">🌿 AyurCare</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 6px;color:#78716c;font-size:13px;">Hello ${userName},</p>
        <h2 style="margin:0 0 12px;color:#1c1917;font-size:18px;font-weight:800;">Verify Your Email</h2>
        <p style="margin:0 0 20px;color:#44403c;font-size:14px;line-height:1.6;">
          Thank you for signing up for AyurCare. Please use the following 6-digit OTP code to verify your email address. This code will expire in 10 minutes.
        </p>
        <div style="display:inline-block;padding:14px 32px;background:#fef3c7;color:#b45309;border:1px solid #fcd34d;border-radius:12px;font-weight:900;font-size:24px;letter-spacing:6px;text-align:center;">
          ${otp}
        </div>
        <p style="margin:20px 0 0;color:#78716c;font-size:12px;line-height:1.5;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      <div style="padding:16px 28px;background:#f5f5f4;border-top:1px solid #e7e5e4;text-align:center;">
        <p style="margin:0;color:#a8a29e;font-size:11px;">This is an automated email from AyurCare. Do not reply.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: 'AyurCare — Your Verification Code', html });
};

export default createNotification;
