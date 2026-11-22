import nodemailer, { type Transporter } from "nodemailer";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

// Lazy-initialized transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    // Missing credentials - return null to use graceful simulation fallback
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

/**
 * Send a transactional email using Nodemailer.
 * Falls back to simulation mode with structured console output if SMTP credentials are unset or delivery fails in dev.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const defaultFrom =
    process.env.EMAIL_FROM ||
    (process.env.SMTP_USER
      ? `Tripti Food Rescue <${process.env.SMTP_USER}>`
      : "Tripti Food Rescue <notifications@tripti.org>");

  const mailOptions = {
    from: from || defaultFrom,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>?/gm, ""), // strip tags for plain text fallback
  };

  const transport = getTransporter();

  if (!transport) {
    console.info(
      `[Tripti Email Service - Simulation Mode]\nTo: ${mailOptions.to}\nSubject: ${subject}\n(Set SMTP_USER/SMTP_PASSWORD in .env for live dispatch)`
    );
    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }

  try {
    const info = await transport.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (error: any) {
    console.error("[Tripti Email Service] Delivery error:", error?.message || error);
    // Return gracefully so notification flow is non-blocking
    return {
      success: false,
      error: error?.message || "Failed to send email",
    };
  }
}
