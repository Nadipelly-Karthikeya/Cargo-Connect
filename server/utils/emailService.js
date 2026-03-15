const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Send verification email
exports.sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Cargo Connect" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Email Verification - Cargo Connect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #1e40af; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Cargo Connect</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Thank you for registering with Cargo Connect. Please verify your email address to access your dashboard.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your verification code is:
          </p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px;">${token}</span>
          </div>
          <p style="font-size: 14px; color: #666;">
            Or click the button below to verify:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1e40af; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This code will expire in 10 minutes.
          </p>
          <p style="font-size: 14px; color: #666;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>&copy; 2026 Cargo Connect. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send load status update email
exports.sendLoadStatusEmail = async (email, name, loadId, status) => {
  const mailOptions = {
    from: `"Cargo Connect" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Load Status Update - ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #1e40af; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Cargo Connect</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-top: 0;">Load Status Update</h2>
          <p style="font-size: 16px; color: #333;">Hi ${name},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your load <strong>#${loadId}</strong> status has been updated to: <strong style="color: #1e40af;">${status}</strong>
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #1e40af; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send payment verification email
exports.sendPaymentVerificationEmail = async (email, name, loadId, status) => {
  const mailOptions = {
    from: `"Cargo Connect" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Payment ${status} - Load #${loadId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #1e40af; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Cargo Connect</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-top: 0;">Payment ${status}</h2>
          <p style="font-size: 16px; color: #333;">Hi ${name},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your payment for load <strong>#${loadId}</strong> has been <strong style="color: #1e40af;">${status}</strong>.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send generic notification email
exports.sendNotificationEmail = async (email, name, subject, message) => {
  const mailOptions = {
    from: `"Cargo Connect" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #1e40af; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Cargo Connect</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Hi ${name},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">${message}</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
