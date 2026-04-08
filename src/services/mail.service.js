const nodemailer = require("nodemailer");

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP config missing: SMTP_HOST, SMTP_USER, SMTP_PASS are required");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendResetPasswordEmail = async ({ to, name, resetUrl, expiresMinutes }) => {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || "Book Store";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const subject = `[${appName}] Password Reset Request`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Password reset request</h2>
      <p>Hello ${name || "there"},</p>
      <p>You requested to reset your password. Click the link below to continue:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link/token will expire in ${expiresMinutes} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
  const text = [
    `Hello ${name || "there"},`,
    "You requested to reset your password.",
    `Open this link: ${resetUrl}`,
    `This link/token will expire in ${expiresMinutes} minutes.`,
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendResetPasswordEmail };
