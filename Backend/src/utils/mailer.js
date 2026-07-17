import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.mail.apiKey ? new Resend(env.mail.apiKey) : null;
export const mailConfigured = Boolean(resend);

if (!mailConfigured) {
  console.warn('✉️  Email not configured (RESEND_API_KEY missing in .env) — emails will be skipped.');
}

/**
 * Send an email via Resend. Never throws — logs and resolves false on failure
 * so it can't break the request that triggered it.
 */
export const sendMail = async ({ to, subject, html, text }) => {
  if (!mailConfigured || !to) return false;
  try {
    const { data, error } = await resend.emails.send({
      from: env.mail.from,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`✉️  Email to ${to} failed:`, error.message || error);
      return false;
    }
    console.log(`✉️  Email sent to ${to}: ${subject} (id: ${data?.id})`);
    return true;
  } catch (err) {
    console.error(`✉️  Email to ${to} failed:`, err.message);
    return false;
  }
};

// ----------------------------------------------------------------------------
//  Formatting helpers
// ----------------------------------------------------------------------------
const fmtDate = (d) => {
  if (!d) return '';
  const [y, mo, day] = String(d).slice(0, 10).split('-').map(Number);
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
};
const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = String(t).split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
};
const whenLabel = (date, time) => `${fmtDate(date)}${time ? ` at ${fmtTime(time)}` : ''}`;

// ----------------------------------------------------------------------------
//  Shared branded email shell. All templates are built from this.
// ----------------------------------------------------------------------------
function buildEmail({ emoji = '✨', heading, greeting, intro, rows = [], footerNote }) {
  const salon = env.mail.salonName;
  const cleanRows = rows.filter((r) => r && r.value);

  const rowsHtml = cleanRows.map((r, i) => {
    const border = i ? 'border-top:1px solid #2b241e;' : '';
    return `<tr>
      <td style="padding:8px 0;color:#9e9082;${border}">${r.label}</td>
      <td style="padding:8px 0;text-align:right;color:#f6efe4;${border}">${r.value}</td>
    </tr>`;
  }).join('');

  const html = `
  <div style="margin:0;padding:0;background:#0b0908;font-family:Segoe UI,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="text-align:center;padding:8px 0 20px;">
        <div style="font-family:Georgia,serif;font-size:26px;font-weight:700;letter-spacing:2px;color:#CBA35C;">${salon}</div>
        <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#9e9082;">Beauty Salon</div>
      </div>
      <div style="background:#161211;border:1px solid #2b241e;border-radius:16px;padding:28px;">
        <div style="text-align:center;font-size:38px;">${emoji}</div>
        <h1 style="font-family:Georgia,serif;color:#f6efe4;font-size:24px;text-align:center;margin:8px 0 4px;">${heading}</h1>
        ${greeting ? `<p style="color:#9e9082;text-align:center;margin:0 0 22px;">${greeting}</p>` : ''}
        ${intro ? `<p style="color:#c8bdae;text-align:center;margin:0 0 22px;">${intro}</p>` : ''}
        ${rowsHtml ? `<table style="width:100%;border-collapse:collapse;font-size:15px;">${rowsHtml}</table>` : ''}
        ${footerNote ? `<p style="color:#9e9082;font-size:13px;margin:22px 0 0;text-align:center;">${footerNote}</p>` : ''}
      </div>
      <p style="color:#6b5e52;font-size:12px;text-align:center;margin-top:18px;">© ${salon}. This is an automated message.</p>
    </div>
  </div>`;

  const text =
    `${greeting ? greeting + '\n\n' : ''}${intro ? intro + '\n\n' : ''}` +
    cleanRows.map((r) => `${r.label}: ${r.value}`).join('\n') +
    `${footerNote ? `\n\n${footerNote}` : ''}`;

  return { html, text };
}

const firstNameOf = (name) => (name || 'there').split(' ')[0];

// ----------------------------------------------------------------------------
//  Customer-facing templates
// ----------------------------------------------------------------------------

/** Booking request received — sent to the customer right after they book (pending). */
export const sendBookingReceived = ({ to, name, serviceName, date, time }) => {
  const { html, text } = buildEmail({
    emoji: '🕐',
    heading: 'We received your booking request',
    greeting: `Hi ${firstNameOf(name)}, thanks for booking with ${env.mail.salonName}!`,
    intro: 'Your request is pending confirmation. We\'ll email you again as soon as the salon approves it.',
    rows: [
      { label: 'Service', value: serviceName || 'Custom look' },
      { label: 'Requested for', value: whenLabel(date, time) },
      { label: 'Status', value: 'Pending confirmation' },
    ],
    footerNote: 'If you need to change anything, just reply to this email or contact the salon.',
  });
  return sendMail({ to, subject: `We received your ${env.mail.salonName} booking request`, html, text });
};

/** Booking confirmed — sent to the customer when an admin approves. */
export const sendBookingApproved = ({ to, name, serviceName, date, time, note }) => {
  const { html, text } = buildEmail({
    emoji: '✅',
    heading: 'Your appointment is confirmed!',
    greeting: `Hi ${firstNameOf(name)}, great news — the salon has approved your booking.`,
    rows: [
      { label: 'Service', value: serviceName || 'Custom look' },
      { label: 'Date & Time', value: whenLabel(date, time) },
      { label: 'Note', value: note },
    ],
    footerNote: 'We look forward to seeing you. If you need to make a change, just reply to this email or contact the salon.',
  });
  return sendMail({ to, subject: `Your ${env.mail.salonName} appointment is confirmed ✅`, html, text });
};

/** Booking cancelled — sent to the customer when an admin cancels their appointment. */
export const sendBookingCancelled = ({ to, name, serviceName, date, time }) => {
  const { html, text } = buildEmail({
    emoji: '⚠️',
    heading: 'Your appointment was cancelled',
    greeting: `Hi ${firstNameOf(name)}, your appointment at ${env.mail.salonName} has been cancelled.`,
    rows: [
      { label: 'Service', value: serviceName || 'Custom look' },
      { label: 'Was scheduled for', value: whenLabel(date, time) },
    ],
    footerNote: 'If this is unexpected or you\'d like to rebook, please contact the salon or book a new appointment.',
  });
  return sendMail({ to, subject: `Your ${env.mail.salonName} appointment was cancelled`, html, text });
};

/** Reschedule rejected — sent to the customer; original slot is kept. */
export const sendRescheduleRejected = ({ to, name, serviceName, date, time }) => {
  const { html, text } = buildEmail({
    emoji: '🔁',
    heading: 'Your reschedule request was declined',
    greeting: `Hi ${firstNameOf(name)}, we couldn't accommodate your requested new time.`,
    intro: 'Your original appointment remains as booked:',
    rows: [
      { label: 'Service', value: serviceName || 'Custom look' },
      { label: 'Original time', value: whenLabel(date, time) },
    ],
    footerNote: 'Feel free to request a different time or contact the salon to find a slot that works.',
  });
  return sendMail({ to, subject: `Update on your ${env.mail.salonName} reschedule request`, html, text });
};

// ----------------------------------------------------------------------------
//  Admin-facing templates
// ----------------------------------------------------------------------------

/** New booking — sent to the admin when a customer books. */
export const sendAdminNewBooking = ({ to, customerName, customerPhone, serviceName, date, time }) => {
  const { html, text } = buildEmail({
    emoji: '📅',
    heading: 'New booking request',
    intro: 'A customer just requested an appointment. Review and confirm it in the admin panel.',
    rows: [
      { label: 'Customer', value: customerName },
      { label: 'Phone', value: customerPhone },
      { label: 'Service', value: serviceName || 'Custom look' },
      { label: 'Requested for', value: whenLabel(date, time) },
    ],
  });
  return sendMail({ to, subject: `New booking: ${customerName || 'a customer'} — ${whenLabel(date, time)}`, html, text });
};

/** Customer cancelled — sent to the admin. */
export const sendAdminCancelled = ({ to, customerName, serviceName, date, time }) => {
  const { html, text } = buildEmail({
    emoji: '🚫',
    heading: 'A customer cancelled',
    intro: 'The following appointment was cancelled by the customer.',
    rows: [
      { label: 'Customer', value: customerName },
      { label: 'Service', value: serviceName || 'Custom look' },
      { label: 'Was scheduled for', value: whenLabel(date, time) },
    ],
  });
  return sendMail({ to, subject: `Cancelled: ${customerName || 'a customer'} — ${whenLabel(date, time)}`, html, text });
};

/** Reschedule requested — sent to the admin for approval. */
export const sendAdminRescheduleRequest = ({ to, customerName, serviceName, oldDate, oldTime, newDate, newTime }) => {
  const { html, text } = buildEmail({
    emoji: '🔁',
    heading: 'Reschedule request',
    intro: 'A customer asked to move their appointment. Approve or reject it in the admin panel.',
    rows: [
      { label: 'Customer', value: customerName },
      { label: 'Service', value: serviceName || 'Custom look' },
      { label: 'Current time', value: whenLabel(oldDate, oldTime) },
      { label: 'Requested time', value: whenLabel(newDate, newTime) },
    ],
  });
  return sendMail({ to, subject: `Reschedule request: ${customerName || 'a customer'}`, html, text });
};
