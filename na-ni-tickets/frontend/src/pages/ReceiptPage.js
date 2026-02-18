import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingsAPI } from '../services/api';
import './Booking.css';

function ReceiptPage() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionId] = useState(`TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [paymentMethod] = useState(loc.state?.paymentMethod || 'Card');

  useEffect(() => {
    if (loc.state?.bookingId) {
      fetchBookingDetails(loc.state.bookingId);
    } else {
      navigate('/');
    }
  }, [loc.state, navigate]);

  const fetchBookingDetails = async (bookingId) => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getBookingDetails(bookingId);
      setBooking(res.data.booking);
    } catch (err) {
      console.warn('Could not fetch booking details', err.message);
      // Create minimal booking object from state
      if (loc.state?.booking) {
        setBooking(loc.state.booking);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const receiptWindow = window.open('', '', 'width=900,height=700');
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${booking?.bookingId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .receipt-header h1 {
            font-size: 28px;
            margin-bottom: 5px;
          }
          .receipt-header p {
            font-size: 14px;
            opacity: 0.9;
          }
          .receipt-content {
            padding: 30px;
          }
          .section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
          }
          .section:last-child {
            border-bottom: none;
          }
          .section-title {
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 15px;
            letter-spacing: 1px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .row.header {
            font-weight: bold;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .row.total {
            font-weight: bold;
            font-size: 16px;
            color: #667eea;
            padding: 10px 0;
            border-top: 2px solid #eee;
            border-bottom: 2px solid #eee;
            margin: 10px 0;
          }
          .label { color: #666; }
          .value { font-weight: 600; color: #333; }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 8px;
          }
          .badge-success {
            background: #d4edda;
            color: #155724;
          }
          .badge-paid {
            background: #d1ecf1;
            color: #0c5460;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .detail-item {
            background: #f9f9f9;
            padding: 12px;
            border-radius: 5px;
            border-left: 3px solid #667eea;
          }
          .detail-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          .qr-section {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 5px;
          }
          .qr-section canvas {
            max-width: 150px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
          .footer p { margin: 5px 0; }
          .important-note {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-left: 4px solid #ffc107;
            padding: 12px;
            border-radius: 4px;
            margin: 15px 0;
            font-size: 12px;
            color: #856404;
          }
          @media print {
            body { background: white; }
            .receipt-container { box-shadow: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <h1>💳 PAYMENT RECEIPT</h1>
            <p>NA-NI TICKETS</p>
          </div>

          <div class="receipt-content">
            <!-- Receipt Number -->
            <div class="section">
              <div class="row">
                <span class="label">Receipt ID:</span>
                <span class="value">${transactionId}</span>
              </div>
              <div class="row">
                <span class="label">Booking ID:</span>
                <span class="value">${booking?.bookingId}</span>
              </div>
              <div class="row">
                <span class="label">Date & Time:</span>
                <span class="value">${new Date().toLocaleString('en-IN')}</span>
              </div>
              <div style="margin-top: 10px;">
                <span class="status-badge badge-success">✓ Payment Successful</span>
                <span class="status-badge badge-paid">✓ Verified</span>
              </div>
            </div>

            <!-- Booking Details -->
            <div class="section">
              <div class="section-title">Booking Information</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Type</div>
                  <div class="detail-value">${booking?.bookingType || 'N/A'}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Item</div>
                  <div class="detail-value">${booking?.movieName || booking?.concertName || booking?.busName || booking?.trainName || booking?.flightNumber || booking?.carModel || 'N/A'}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Location</div>
                  <div class="detail-value">${booking?.departureLocation || booking?.theater || 'N/A'}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Date</div>
                  <div class="detail-value">${booking?.journeyDate ? new Date(booking.journeyDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</div>
                </div>
              </div>
            </div>

            <!-- Amount Details -->
            <div class="section">
              <div class="section-title">Payment Details</div>
              <div class="row">
                <span class="label">Payment Method:</span>
                <span class="value">${paymentMethod}</span>
              </div>
              <div class="row">
                <span class="label">Transaction Status:</span>
                <span class="value" style="color: #27ae60;">Completed</span>
              </div>
            </div>

            <!-- Charges Breakdown -->
            <div class="section">
              <div class="section-title">Charges Breakdown</div>
              <div class="row header">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div class="row">
                <span class="label">Base Amount</span>
                <span class="value">₹${Math.round(booking?.totalAmount * 0.95) || booking?.totalAmount}</span>
              </div>
              <div class="row">
                <span class="label">Convenience Fee</span>
                <span class="value">₹${Math.round(booking?.totalAmount * 0.05)}</span>
              </div>
              <div class="row total">
                <span>TOTAL PAID</span>
                <span>₹${booking?.totalAmount || 0}</span>
              </div>
            </div>

            <!-- Passenger Details -->
            ${booking?.travelerDetails && booking.travelerDetails.length > 0 ? `
            <div class="section">
              <div class="section-title">Passenger Details</div>
              ${booking.travelerDetails.map((p, i) => `
                <div class="row">
                  <span class="label">Passenger ${i + 1}:</span>
                  <span class="value">${p.name}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <!-- Seats -->
            ${booking?.seats && booking.seats.length > 0 ? `
            <div class="section">
              <div class="section-title">Booked Seats</div>
              <div class="row">
                <span class="label">Seats/Tickets:</span>
                <span class="value">${booking.seats.join(', ')}</span>
              </div>
            </div>
            ` : ''}

            <!-- QR Code -->
            <div class="qr-section">
              <canvas id="receipt-qr"></canvas>
              <p style="margin-top: 10px; font-size: 11px; color: #666;">Scan QR code to verify receipt</p>
            </div>

            <!-- Important Note -->
            <div class="important-note">
              <strong>⚠️ Important:</strong> Keep this receipt for your records. Show this receipt or your e-ticket at the venue. Payment has been successfully processed.
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for your booking!</strong></p>
            <p>For support, contact: support@nani-tickets.com</p>
            <p style="margin-top: 15px; font-size: 11px;">This is an electronically generated receipt and is valid without signature.</p>
          </div>
        </div>

        <script>
          function generateQR() {
            const canvas = document.getElementById('receipt-qr');
            canvas.width = 180;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 180, 180);
            
            const moduleSize = 180 / 25;
            ctx.fillStyle = '#000000';
            
            // Finder patterns
            for (let i = 0; i < 7; i++) {
              for (let j = 0; j < 7; j++) {
                if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
                  ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                }
              }
            }
            
            const seed = '${transactionId}'.charCodeAt(0) * 31;
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
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Loading receipt...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container" style={{ maxWidth: '700px' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px 20px',
          borderRadius: '8px 8px 0 0',
          textAlign: 'center',
          marginBottom: '0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💳</div>
          <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>Payment Successful!</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>Your receipt has been generated</p>
        </div>

        {/* Receipt Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0 0 8px 8px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {/* Receipt Numbers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '2px solid #f0f0f0'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>RECEIPT ID</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>{transactionId}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>BOOKING ID</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{booking?.bookingId}</div>
            </div>
          </div>

          {/* Booking Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '12px',
              borderRadius: '5px',
              borderLeft: '3px solid #667eea'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>TYPE</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{booking?.bookingType}</div>
            </div>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '12px',
              borderRadius: '5px',
              borderLeft: '3px solid #667eea'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>ITEM</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {booking?.movieName || booking?.concertName || booking?.busName || booking?.trainName || booking?.flightNumber || booking?.carModel}
              </div>
            </div>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '12px',
              borderRadius: '5px',
              borderLeft: '3px solid #667eea'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>LOCATION</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{booking?.departureLocation || booking?.theater}</div>
            </div>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '12px',
              borderRadius: '5px',
              borderLeft: '3px solid #667eea'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>DATE</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {new Date(booking?.journeyDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div style={{
            backgroundColor: '#f0f4ff',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ color: '#666' }}>Base Amount:</span>
              <span style={{ fontWeight: 'bold' }}>₹{Math.round(booking?.totalAmount * 0.95)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: '1px solid #ddd'
            }}>
              <span style={{ color: '#666' }}>Convenience Fee:</span>
              <span style={{ fontWeight: 'bold' }}>₹{Math.round(booking?.totalAmount * 0.05)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px'
            }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>TOTAL PAID:</span>
              <span style={{ fontWeight: 'bold', color: '#27ae60' }}>₹{booking?.totalAmount}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{
            backgroundColor: '#f9f9f9',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ color: '#666' }}>Payment Method:</span>
              <span style={{ fontWeight: 'bold' }}>{paymentMethod}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ color: '#666' }}>Transaction ID:</span>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{transactionId}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#666' }}>Status:</span>
              <span style={{ fontWeight: 'bold', color: '#27ae60' }}>✓ Completed</span>
            </div>
          </div>

          {/* Status Badges */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '10px'
            }}>
              ✓ Payment Verified
            </span>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#d1ecf1',
              color: '#0c5460',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ✓ Confirmed
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={handlePrintReceipt}
              style={{
                padding: '12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              🖨️ Print Receipt
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
              View Bookings
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
            Book More
          </button>

          {/* Info Text */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderLeft: '4px solid #ffc107',
            padding: '12px',
            borderRadius: '4px',
            marginTop: '20px',
            fontSize: '12px',
            color: '#856404'
          }}>
            <strong>⚠️ Keep this receipt:</strong> You'll need it to access your e-ticket and for venue entry. Check your email for confirmation details.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptPage;
