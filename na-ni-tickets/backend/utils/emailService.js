const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmailOTP = async (email, otp, type) => {
  try {
    const subject = type === 'signup' ? 'Email Verification OTP' : 'Password Reset OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">NA-NI TICKETS</h2>
        <p style="font-size: 16px; color: #666;">Hello,</p>
        <p style="font-size: 14px; color: #666;">
          ${type === 'signup' ? 'Your email verification' : 'Your password reset'} OTP is:
        </p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #007bff; text-align: center; letter-spacing: 2px;">${otp}</h1>
        </div>
        <p style="font-size: 12px; color: #999;">This OTP will expire in ${process.env.OTP_EXPIRY} minutes.</p>
        <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} NA-NI TICKETS. All rights reserved.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

const sendBookingConfirmation = async (email, bookingDetails) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">NA-NI TICKETS - Booking Confirmation</h2>
        <p style="font-size: 16px; color: #666;">Hello ${bookingDetails.userName},</p>
        <p style="font-size: 14px; color: #666;">Your booking has been confirmed!</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="color: #007bff; margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Type:</strong> ${bookingDetails.bookingType}</p>
          <p><strong>Date:</strong> ${bookingDetails.date}</p>
          <p><strong>Seats:</strong> ${bookingDetails.seats}</p>
          <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</p>
        </div>

        <p style="font-size: 14px; color: #666;">Your ticket details are attached. Please carry this confirmation to your venue.</p>
        <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} NA-NI TICKETS. All rights reserved.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: `Booking Confirmation - ${bookingDetails.bookingId}`,
      html: html,
    });

    return true;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw new Error('Failed to send booking confirmation');
  }
};

const sendReminderEmail = async (email, bookingDetails) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">NA-NI TICKETS - Event Reminder</h2>
        <p style="font-size: 16px; color: #666;">Hello ${bookingDetails.userName},</p>
        <p style="font-size: 14px; color: #666;">Your ${bookingDetails.bookingType} is happening in 10 minutes!</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <h3 style="color: #ff9800; margin-top: 0;">Quick Details</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Seats:</strong> ${bookingDetails.seats}</p>
          <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
        </div>

        <p style="font-size: 14px; color: #666;">Please reach 10 minutes before the event starts!</p>
        <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} NA-NI TICKETS. All rights reserved.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: `Reminder: Your ${bookingDetails.bookingType} is starting soon`,
      html: html,
    });

    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

module.exports = {
  sendEmailOTP,
  sendBookingConfirmation,
  sendReminderEmail,
};
