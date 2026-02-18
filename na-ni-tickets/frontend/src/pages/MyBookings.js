import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bookingsAPI } from '../services/api';
import './Booking.css';

// Ticket printer component
const TicketPrinter = ({ booking }) => {
  const handlePrint = () => {
    const ticketWindow = window.open('', '', 'width=800,height=600');
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>E-Ticket - ${booking.bookingId}</title>
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
          .section-content {
            font-size: 16px;
            color: #333;
          }
          .row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
          }
          .row.full {
            grid-template-columns: 1fr;
          }
          .info-box {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #e74c3c;
          }
          .booking-id {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
            margin: 10px 0;
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
            font-size: 12px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
          }
          .status-confirmed {
            background: #d4edda;
            color: #155724;
          }
          .status-paid {
            background: #d1ecf1;
            color: #0c5460;
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
            <div class="ticket-section full">
              <div class="section-title">Booking ID</div>
              <div class="booking-id">${booking.bookingId}</div>
              <div class="status-badge status-confirmed">✓ CONFIRMED</div>
              <div class="status-badge status-paid">✓ PAID</div>
            </div>

            <div class="ticket-section">
              <div class="section-title">${booking.bookingType}</div>
              <div class="section-content">
                <div class="row full">
                  <div class="info-box">
                    <strong>${booking.movieName || booking.concertName || booking.busName || booking.trainName || booking.flightNumber || booking.carModel}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="ticket-section">
              <div class="row">
                <div>
                  <div class="section-title">Location</div>
                  <div class="section-content">${booking.departureLocation || booking.theater || 'N/A'}</div>
                </div>
                <div>
                  <div class="section-title">Date</div>
                  <div class="section-content">${new Date(booking.journeyDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
              </div>
            </div>

            <div class="ticket-section">
              <div class="row">
                <div>
                  <div class="section-title">Seats/Tickets</div>
                  <div class="section-content"><strong>${(booking.seats && booking.seats.join(', ')) || booking.selectedSeatsCount + ' ticket(s)'}</strong></div>
                </div>
                <div>
                  <div class="section-title">Total Amount</div>
                  <div class="section-content" style="color: #27ae60; font-weight: bold;">₹${booking.totalAmount}</div>
                </div>
              </div>
            </div>

            <div class="ticket-section">
              <div class="section-title">Passenger Details</div>
              <div class="section-content">
                ${booking.travelerDetails && booking.travelerDetails.length > 0 
                  ? booking.travelerDetails.map((p, i) => `<div style="margin: 5px 0;">${i + 1}. ${p.name}</div>`).join('') 
                  : 'N/A'}
              </div>
            </div>

            <div class="qr-code">
              <canvas id="qr"></canvas>
              <div style="margin-top: 10px;">Scan QR code at venue</div>
            </div>
          </div>

          <div class="footer">
            <p>This is your e-ticket. Please keep it safe. Present this ticket at the venue.</p>
            <p>Booking Time: ${new Date(booking.bookingDate).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <script>
          // Simple QR code generator
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
            
            // Random data
            const seed = '${booking.bookingId}'.charCodeAt(0) * 31;
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

  return (
    <button
      onClick={handlePrint}
      style={{
        padding: '8px 16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
        marginTop: '10px'
      }}
    >
      🖨️ Print Ticket
    </button>
  );
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await bookingsAPI.getUserBookings();
        setBookings(res.data.bookings || []);
      } catch (err) {
        toast.error('Failed to load bookings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.bookingType === filter);

  if (loading) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>My Bookings</h2>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>My Bookings</h2>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              No bookings yet
            </p>
            <a href="/movies" style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#e74c3c',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              Start Booking Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: 0 }}>My Bookings ({filteredBookings.length})</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['all', 'Movie', 'Concert', 'Bus', 'Train', 'Flight', 'Car'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filter === type ? '#e74c3c' : '#ddd',
                  color: filter === type ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {filteredBookings.map(booking => (
            <div
              key={booking._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Header */}
              <div style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                padding: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '16px' }}>
                    {booking.bookingType === 'Movie' && '🎬'}
                    {booking.bookingType === 'Concert' && '🎵'}
                    {booking.bookingType === 'Bus' && '🚌'}
                    {booking.bookingType === 'Train' && '🚂'}
                    {booking.bookingType === 'Flight' && '✈️'}
                    {booking.bookingType === 'Car' && '🚗'}
                    {' '}{booking.bookingType}
                  </h4>
                  <span style={{
                    backgroundColor: booking.paymentStatus === 'Paid' ? '#27ae60' : '#f39c12',
                    paddingX: '8px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>
                  ID: <strong>{booking.bookingId}</strong>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                {/* Title */}
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ fontSize: '16px', color: '#333' }}>
                    {booking.movieName || booking.concertName || booking.busName || booking.trainName || booking.flightNumber || booking.carModel}
                  </strong>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '15px',
                  fontSize: '13px'
                }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>Location</div>
                    <div style={{ fontWeight: 'bold' }}>{booking.departureLocation || booking.theater || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>Date</div>
                    <div style={{ fontWeight: 'bold' }}>
                      {new Date(booking.journeyDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>Seats</div>
                    <div style={{ fontWeight: 'bold' }}>
                      {booking.seats && booking.seats.length > 0
                        ? booking.seats.join(', ')
                        : `${booking.selectedSeatsCount || 1} ticket(s)`}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '3px' }}>Total Amount</div>
                    <div style={{ fontWeight: 'bold', color: '#27ae60' }}>₹{booking.totalAmount}</div>
                  </div>
                </div>

                {/* Passengers */}
                {booking.travelerDetails && booking.travelerDetails.length > 0 && (
                  <div style={{
                    backgroundColor: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    fontSize: '12px'
                  }}>
                    <div style={{ color: '#666', marginBottom: '5px' }}>Passengers:</div>
                    {booking.travelerDetails.map((p, i) => (
                      <div key={i}>{i + 1}. {p.name}</div>
                    ))}
                  </div>
                )}

                {/* Status */}
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  marginBottom: '15px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    ✓ {booking.status}
                  </span>
                  {booking.paymentStatus === 'Paid' && (
                    <span style={{
                      backgroundColor: '#d1ecf1',
                      color: '#0c5460',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      ✓ Payment Verified
                    </span>
                  )}
                </div>

                {/* Print Button */}
                <TicketPrinter booking={booking} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyBookings;
