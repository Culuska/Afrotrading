import nodemailer from "nodemailer";

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    })
  : null;

// Never let a slow/failing mail provider block or break the request that triggered it.
export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.warn(`SMTP not configured; would have sent email to ${to}: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "AfroTrading <no-reply@afrotrading.com>",
      to,
      subject,
      html,
    });
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

export function passwordResetEmailTemplate(name: string, resetUrl: string) {
  return `
    <div style="font-family: sans-serif; background:#0b0f19; color:#f4f4f5; padding:32px;">
      <h1 style="color:#D4AF37;">Password Reset Request</h1>
      <p>Hi ${name}, click below to reset your AfroTrading password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block; background:#D4AF37; color:#0b0f19; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Reset Password</a>
    </div>
  `;
}
