import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function sendResetPasswordEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // For Outlook.com
    port: 587, // SMTP port
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,  // your email
      pass: process.env.EMAIL_PASSWORD,    // your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password for PeerPrep',
    text: `You requested a password reset for your PeerPrep account. Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${token}. This link will expire in 5 minutes.`,
  };

  return transporter.sendMail(mailOptions);
}