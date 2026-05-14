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
    const template = (bookingDetails.template || bookingDetails.bookingType || 'ticket').toLowerCase();
    const heroImage = bookingDetails.posterUrl || {
      movie: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
      train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
      flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
      car: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      event: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      concert: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    }[template] || 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80';

    const html = `
      <div style="margin:0;background:#f4f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 22px 70px rgba(15,23,42,0.16);">
          <div style="background:#111827;color:#ffffff;padding:18px 24px;">
            <div style="font-size:22px;font-weight:900;letter-spacing:.5px;">NA-NI TICKETS</div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#fbbf24;">Official E-Ticket</div>
          </div>
          <div style="height:230px;background:linear-gradient(180deg,rgba(17,24,39,.1),rgba(17,24,39,.72)),url('${heroImage}') center/cover;"></div>
          <div style="padding:28px;">
            <p style="margin:0 0 8px;color:#64748b;font-size:15px;">Hello ${bookingDetails.userName || 'Guest'},</p>
            <h1 style="margin:0 0 8px;font-size:30px;line-height:1.1;color:#111827;">Your ${bookingDetails.bookingType} booking is confirmed</h1>
            <p style="margin:0 0 22px;color:#64748b;">Keep this email handy at the venue, station, airport, pickup point, or theatre.</p>

            <div style="border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
              <div style="padding:20px;background:linear-gradient(135deg,#f43f5e,#f59e0b);color:white;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;opacity:.85;">Booking ID</div>
                <div style="font-size:24px;font-weight:900;">${bookingDetails.bookingId}</div>
              </div>
              <div style="padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div><div style="font-size:12px;color:#64748b;text-transform:uppercase;">Type</div><strong>${bookingDetails.bookingType}</strong></div>
                <div><div style="font-size:12px;color:#64748b;text-transform:uppercase;">Date</div><strong>${bookingDetails.date || 'TBA'}</strong></div>
                <div><div style="font-size:12px;color:#64748b;text-transform:uppercase;">Seats</div><strong>${bookingDetails.seats || 'N/A'}</strong></div>
                <div><div style="font-size:12px;color:#64748b;text-transform:uppercase;">Venue / Pickup</div><strong>${bookingDetails.venue || 'N/A'}</strong></div>
              </div>
              <div style="padding:20px;border-top:1px dashed #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:800;color:#374151;">Amount Paid</span>
                <strong style="font-size:28px;color:#10b981;">Rs ${bookingDetails.totalAmount}</strong>
              </div>
            </div>

            <p style="font-size:13px;color:#64748b;margin:22px 0 0;">This is your official NA-NI TICKETS confirmation. Show the booking ID or printed receipt when requested.</p>
          </div>
          <div style="background:#f8fafc;padding:16px 24px;color:#64748b;font-size:12px;text-align:center;">
            © ${new Date().getFullYear()} NA-NI TICKETS. All rights reserved.
          </div>
        </div>
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
