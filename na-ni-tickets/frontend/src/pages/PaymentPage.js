import React, { useState, useEffect } from 'react'
import './Booking.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { bookingsAPI } from '../services/api'

// Simple QR Code generator (dummy/placeholder)
const QRCodeGenerator = ({ text, size = 200 }) => {
  // For demo purposes, we'll create a visual QR using canvas
  useEffect(() => {
    const canvas = document.getElementById('qr-canvas')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size

    // Fill white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Draw a pattern that looks like a QR code
    const moduleSize = size / 25
    ctx.fillStyle = '#000000'

    // Top-left finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Top-right finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          ctx.fillRect((size / moduleSize - 7 + i) * moduleSize, j * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Bottom-left finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          ctx.fillRect(i * moduleSize, (size / moduleSize - 7 + j) * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Random data modules
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Avoid finder patterns and separator areas
        if ((i < 9 && j < 9) || (i >= 16 && j < 9) || (i < 9 && j >= 16)) {
          continue
        }
        // Seed-based pseudo-random for consistent QR
        const seed = (text || 'NANI-TICKETS').charCodeAt(0) * 31
        if ((i * j + seed) % 2 === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [text, size])

  return <canvas id="qr-canvas" style={{ border: '1px solid #ccc', display: 'block' }} />
}

export default function PaymentPage() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (loc.state?.booking) {
      setBooking(loc.state.booking)
    } else if (loc.state?.bookingId || loc.state?.amount) {
      setBooking({
        bookingId: loc.state.bookingId,
        totalAmount: loc.state.amount,
      })
    } else {
      toast.error('No booking information found')
      navigate('/movies')
    }
  }, [loc.state, navigate])

  async function handlePaymentConfirm() {
    if (!booking?.bookingId) {
      toast.error('Invalid booking')
      return
    }

    setLoading(true)
    try {
      // Simulate payment confirmation
      toast.success(`Payment of ₹${booking.totalAmount} confirmed via ${paymentMethod.toUpperCase()}!`)
      
      // Navigate to receipt page
      setTimeout(() => {
        navigate('/receipt', {
          state: { 
            bookingId: booking.bookingId,
            booking: booking,
            paymentMethod: paymentMethod
          },
        })
      }, 1000)
    } catch (err) {
      toast.error('Payment confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  if (!booking) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Loading payment details...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#e74c3c' }}>
          Complete Your Payment
        </h2>

        {/* Booking Summary */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ marginTop: 0, color: '#333' }}>Booking Summary</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
            <div>
              <strong style={{ color: '#666' }}>Booking ID:</strong>
              <div style={{ color: '#e74c3c', fontSize: '16px', marginTop: '5px' }}>
                {booking.bookingId}
              </div>
            </div>
            <div>
              <strong style={{ color: '#666' }}>Amount Due:</strong>
              <div style={{ color: '#27ae60', fontSize: '24px', marginTop: '5px', fontWeight: 'bold' }}>
                ₹{booking.totalAmount}
              </div>
            </div>
            {booking.movieName && (
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ color: '#666' }}>Movie:</strong>
                <div style={{ marginTop: '5px' }}>{booking.movieName}</div>
              </div>
            )}
            {booking.seats && (
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ color: '#666' }}>Seats:</strong>
                <div style={{ marginTop: '5px' }}>{booking.seats.join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#333', marginBottom: '15px' }}>Select Payment Method</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {[
              { id: 'upi', label: 'UPI', icon: '📱' },
              { id: 'card', label: 'Debit/Credit Card', icon: '💳' },
              { id: 'wallet', label: 'Digital Wallet', icon: '👛' },
              { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => { setPaymentMethod(method.id); setShowQR(false) }}
                style={{
                  padding: '15px',
                  border: paymentMethod === method.id ? '2px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: paymentMethod === method.id ? '#ffe5e0' : '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: paymentMethod === method.id ? 'bold' : 'normal',
                  color: '#333',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>{method.icon}</div>
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* QR Code for UPI */}
        {paymentMethod === 'upi' && (
          <div style={{
            backgroundColor: '#f0f0f0',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowQR(!showQR)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginBottom: '15px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {showQR ? 'Hide QR Code' : 'Show QR Code for Payment'}
            </button>

            {showQR && (
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                display: 'inline-block',
                border: '2px solid #e74c3c'
              }}>
                <QRCodeGenerator text={`upi://pay?pa=nani.tickets@bank&pn=NANI%20TICKETS&am=${booking.totalAmount}&tr=${booking.bookingId}`} size={250} />
                <p style={{ margin: '15px 0 0 0', fontSize: '12px', color: '#666' }}>
                  Scan with any UPI app to pay ₹{booking.totalAmount}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePaymentConfirm}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#bdc3c7' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Processing...' : `Pay ₹${booking.totalAmount} via ${paymentMethod.toUpperCase()}`}
        </button>

        {/* Info Text */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          marginTop: '20px',
          borderTop: '1px solid #eee',
          paddingTop: '15px'
        }}>
          This is a DEMO payment page. No actual payment will be processed.<br />
          Click the payment button to proceed to booking confirmation.
        </p>
      </div>
    </div>
  )
}
