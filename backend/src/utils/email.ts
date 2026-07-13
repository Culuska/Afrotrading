import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Never let a slow/failing mail provider block or break the request that triggered it.
// Uses Resend's HTTPS API instead of SMTP, since most hosting platforms (Railway included)
// block outbound SMTP ports by default.
export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`RESEND_API_KEY not configured; would have sent email to ${to}: ${subject}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "AfroTrading <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (error) console.error(`Failed to send email to ${to} (${subject}):`, error);
  } catch (err) {
    console.error(`Failed to send email to ${to} (${subject}):`, err);
  }
}

export function verificationEmailTemplate(name: string, verifyUrl: string) {
  return `
    <div style="font-family: sans-serif; background:#0b0f19; color:#f4f4f5; padding:32px;">
      <h1 style="color:#D4AF37;">Welcome to AfroTrading, ${name}!</h1>
      <p>Please verify your email address to activate your account and start receiving gold signals.</p>
      <a href="${verifyUrl}" style="display:inline-block; background:#D4AF37; color:#0b0f19; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Verify Email</a>
      <p style="margin-top:24px; font-size:12px; color:#888;">If you did not create this account, you can ignore this email.</p>
    </div>
  `;
}

export function accountApprovedEmailTemplate(name: string, dashboardUrl: string) {
  return `
    <div style="font-family: sans-serif; background:#0b0f19; color:#f4f4f5; padding:32px;">
      <h1 style="color:#D4AF37;">You're verified, ${name}!</h1>
      <p>Your AfroTrading account has been reviewed and approved by our team. You now have full access to your dashboard, signals, and education content.</p>
      <a href="${dashboardUrl}" style="display:inline-block; background:#D4AF37; color:#0b0f19; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Go to Dashboard</a>
      <p style="margin-top:24px; font-size:12px; color:#888;">If you weren't expecting this, please contact our support team.</p>
    </div>
  `;
}

export function accountSuspendedEmailTemplate(name: string) {
  return `
    <div style="font-family: sans-serif; background:#0b0f19; color:#f4f4f5; padding:32px;">
      <h1 style="color:#D4AF37;">Account Suspended</h1>
      <p>Hi ${name}, your AfroTrading account has been suspended by our team and you no longer have access to your dashboard, signals, or education content.</p>
      <p style="margin-top:24px; font-size:12px; color:#888;">If you believe this is a mistake, please contact our support team.</p>
    </div>
  `;
}

const MEMBERSHIP_LABELS: Record<string, string> = {
  FREE: "Free",
  VIP_MONTHLY: "VIP Monthly",
  VIP_LIFETIME: "VIP Lifetime",
};

export function membershipChangedEmailTemplate(name: string, membership: string, dashboardUrl: string) {
  const label = MEMBERSHIP_LABELS[membership] || membership;
  return `
    <div style="font-family: sans-serif; background:#0b0f19; color:#f4f4f5; padding:32px;">
      <h1 style="color:#D4AF37;">Your Membership Has Changed</h1>
      <p>Hi ${name}, your AfroTrading membership has been updated to <b>${label}</b> by our team.</p>
      <a href="${dashboardUrl}" style="display:inline-block; background:#D4AF37; color:#0b0f19; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Go to Dashboard</a>
      <p style="margin-top:24px; font-size:12px; color:#888;">If you weren't expecting this, please contact our support team.</p>
    </div>
  `;
}

export function contactMessageEmailTemplate(fields: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}) {
  return `
    <div style="font-family: sans-serif; background:#0b0f19; color:#f4f4f5; padding:32px;">
      <h1 style="color:#D4AF37;">New Support Message</h1>
      <p><b>From:</b> ${fields.name} (${fields.email})</p>
      ${fields.phone ? `<p><b>Phone:</b> ${fields.phone}</p>` : ""}
      ${fields.subject ? `<p><b>Subject:</b> ${fields.subject}</p>` : ""}
      <p style="margin-top:16px; white-space:pre-line;">${fields.message}</p>
    </div>
  `;
}

export function passwordResetEmailTemplate(name: string, resetUrl: string) {
  return `
    <div style="font-family: sans-serif; background:#0b0f19; color:#f4f4f5; padding:32px;">
      <h1 style="color:#D4AF37;">Password Reset Request</h1>
      <p>Hi ${name}, click below to reset your AfroTrading password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block; background:#D4AF37; color:#0b0f19; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Reset Password</a>
    </div>
  `;
}
