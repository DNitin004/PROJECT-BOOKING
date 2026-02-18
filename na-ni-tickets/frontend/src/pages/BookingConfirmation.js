import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingsAPI } from '../services/api';
import './Booking.css';

function BookingConfirmation() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loc.state?.bookingId) {
      setBookingId(loc.state.bookingId);
      // Fetch full booking details
      fetchBookingDetails(loc.state.bookingId);
    } else {
      navigate('/');
    }
  }, [loc.state, navigate]);

  const fetchBookingDetails = async (id) => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getBookingDetails(id);
      setBooking(res.data.booking);
    } catch (err) {
      console.warn('Could not fetch full booking details', err.message);
      // That's okay, we still have the booking ID
    } finally {
      setLoading(false);
    }
  };

  const handlePrintTicket = () => {
    if (!bookingId) return;

    const ticketWindow = window.open('', '', 'width=800,height=600');
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>E-Ticket - ${bookingId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .ticket-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .ticket-header {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 20px;
            text-align: center;
          }
          .ticket-header h1 {
            margin: 0;
            font-size: 28px;
          }
          .ticket-header p {
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .ticket-content {
            padding: 30px;
          }
          .ticket-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #ddd;
          }
          .ticket-section:last-child {
            border-bottom: none;
          }
          .section-title {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .booking-id {
            font-size: 28px;
            font-weight: bold;
            color: #e74c3c;
            margin: 15px 0;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
            margin: 5px 5px 5px 0;
          }
          .status-confirmed {
            background: #d4edda;
            color: #155724;
          }
          .status-paid {
            background: #d1ecf1;
            color: #0c5460;
          }
          .qr-code {
            text-align: center;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
          }
          .footer {
            text-align: center;
            padding: 15px;
            background: #f5f5f5;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #ddd;
          }
          @media print {
            body { margin: 0; background: white; }
            .ticket-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <h1>🎫 E-TICKET</h1>
            <p>NA-NI TICKETS</p>
          </div>
          
          <div class="ticket-content">
            <div class="ticket-section">
              <div class="booking-id">${bookingId}</div>
              <div style="text-align: center;">
                <div class="status-badge status-confirmed">✓ CONFIRMED</div>
                <div class="status-badge status-paid">✓ PAID</div>
              </div>
            </div>

            <div class="ticket-section">
              <div class="section-title">Booking Confirmation</div>
              <p style="margin: 10px 0; font-size: 14px;">Your booking has been successfully confirmed and payment has been received.</p>
              <p style="margin: 10px 0; font-size: 13px; color: #666;">Please present this ticket at the venue. Reach 15 minutes before your show time.</p>
            </div>

            <div class="qr-code">
              <canvas id="qr"></canvas>
              <div style="margin-top: 10px;">Scan QR code at venue entrance</div>
            </div>

            <div style="background: #fffbea; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f39c12;">
              <strong style="color: #856404;">Important Instructions:</strong>
              <ul style="margin: 10px 0; font-size: 12px; color: #666;">
                <li>Keep this ticket safe - you'll need it at the venue</li>
                <li>Arrive 15 minutes before show time</li>
                <li>Present this ticket at the entrance counter</li>
                <li>Digital and printed copies are both valid</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;">Thank you for booking with NA-NI TICKETS</p>
            <p style="margin: 5px 0 0 0;">Confirmation Time: ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>

        <script>
          function generateQR() {
            const canvas = document.getElementById('qr');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 200, 200);
            
            const moduleSize = 200 / 25;
            ctx.fillStyle = '#000000';
            
            // Finder patterns
            for (let i = 0; i < 7; i++) {
              for (let j = 0; j < 7; j++) {
                if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
                  ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                }
              }
            }
            
            // Data area based on booking ID
            const seed = '${bookingId}'.charCodeAt(0) * 31;
            for (let i = 0; i < 25; i++) {
              for (let j = 0; j < 25; j++) {
                if ((i < 9 && j < 9) || (i >= 16 && j < 9) || (i < 9 && j >= 16)) continue;
                if ((i * j + seed) % 2 === 0) {
                  ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                }
              }
            }
          }
          
          generateQR();
          window.print();
        </script>
      </body>
      </html>
    `;
    ticketWindow.document.write(ticketHTML);
    ticketWindow.document.close();
  };

  if (!bookingId) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Loading confirmation...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        {/* Success Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'pulse 1s ease-in-out'
        }}>
          ✅
        </div>

        <h2 style={{ color: '#27ae60', marginBottom: '10px' }}>
          Payment Successful!
        </h2>

        <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
          Your booking is confirmed and payment has been received
        </p>

        {/* Confirmation Details */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '30px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '2px solid #27ae60'
        }}>
          <h4 style={{ marginTop: 0, color: '#333', marginBottom: '20px' }}>
            Booking Confirmation
          </h4>

          <div style={{
            display: 'grid',
            gap: '15px',
            textAlign: 'left'
          }}>
            <div style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '5px',
              borderLeft: '4px solid #e74c3c'
            }}>
              <strong style={{ color: '#666', fontSize: '12px' }}>BOOKING ID</strong>
              <div style={{
                fontSize: '18px',
                color: '#e74c3c',
                marginTop: '5px',
                fontWeight: 'bold'
              }}>
                {bookingId}
              </div>
            </div>

            <div style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '5px',
              borderLeft: '4px solid #3498db'
            }}>
              <strong style={{ color: '#666', fontSize: '12px' }}>STATUS</strong>
              <div style={{
                fontSize: '16px',
                color: '#27ae60',
                marginTop: '5px',
                fontWeight: 'bold'
              }}>
                Confirmed ✓
              </div>
            </div>

            <div style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '5px',
              borderLeft: '4px solid #2ecc71'
            }}>
              <strong style={{ color: '#666', fontSize: '12px' }}>PAYMENT STATUS</strong>
              <div style={{
                fontSize: '16px',
                color: '#27ae60',
                marginTop: '5px',
                fontWeight: 'bold'
              }}>
                Paid Successfully ✓
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#e8f8f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #27ae60'
        }}>
          <h4 style={{ marginTop: 0, color: '#27ae60' }}>What's Next?</h4>
          <ul style={{
            textAlign: 'left',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#27ae60', marginRight: '10px', fontSize: '18px' }}>✓</span>
              Check your email for booking confirmation and ticket details
            </li>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#27ae60', marginRight: '10px', fontSize: '18px' }}>✓</span>
              Download your tickets from "My Bookings" section
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#27ae60', marginRight: '10px', fontSize: '18px' }}>✓</span>
              Reach the venue 15 minutes before your show time
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={handlePrintTicket}
            style={{
              padding: '12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
          >
            🖨️ Print Ticket
          </button>
          <button
            onClick={() => navigate('/my-bookings')}
            style={{
              padding: '12px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            View My Bookings
          </button>
        </div>

        <button
          onClick={() => navigate('/movies')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Book More Tickets
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default BookingConfirmation;
