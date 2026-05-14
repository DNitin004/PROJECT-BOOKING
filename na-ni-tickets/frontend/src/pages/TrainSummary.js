import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUserAlt, FaCreditCard, FaInfoCircle, FaCheckCircle, FaMapMarkerAlt, FaCalendarCheck, FaClock } from 'react-icons/fa';
import './Booking.css';
import './TrainDetails.css';

export default function TrainSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isBooking, setIsBooking] = useState(false);
  
  const stateData = location.state || {};
  const {
    train,
    journeyDate,
    source,
    destination,
    selectedCoach,
    selectedSeats,
    totalFare,
    passengers
  } = stateData;

  if (!train || !selectedSeats || !passengers) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Invalid session</h3>
        <button onClick={() => navigate('/trains')} className="bk-checkout-btn" style={{ width: 'auto', padding: '10px 20px', marginTop: '20px' }}>Back to Search</button>
      </div>
    );
  }

  const handleBookTicket = async () => {
    setIsBooking(true);
    try {
      const payload = {
        trainId: train._id,
        journeyDate,
        source,
        destination,
        coachNumber: selectedCoach.coachNumber,
        coachType: selectedCoach.coachType,
        seats: selectedSeats,
        travelerDetails: { 
          name: passengers[0].name,
          passengers: passengers 
        }
      };

      const res = await bookingsAPI.bookTrain(payload);
      if (res.data.success) {
        toast.success('Seats confirmed! Redirecting to payment...');
        setTimeout(() => {
          navigate('/payment', { state: { booking: res.data.booking } });
        }, 1200);
      }
    } catch (error) {
        if(error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error('Failed to reserve seats. They might be booked just now.');
        }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bk-layout">
      <div className="bk-header">
        <div className="bk-header-content">
          <h1>{train.trainName} <span className="bk-train-num">#{train.trainNumber}</span></h1>
          <div className="bk-route-display">
            <span className="bk-station"><FaMapMarkerAlt/> {source.split('(')[0]}</span>
            <span className="bk-divider">→</span>
            <span className="bk-station"><FaMapMarkerAlt/> {destination.split('(')[0]}</span>
          </div>
          <div className="bk-timing">
             <span className="bk-pill"><FaCalendarCheck/> {new Date(journeyDate).toDateString()}</span>
             <span className="bk-pill"><FaClock/> {train.duration || '6h 30m'}</span>
          </div>
        </div>
      </div>

      <div className="bk-main">
        <div className="bk-left-panel">
          <div className="bk-card" style={{ marginBottom: '20px' }}>
            <h3 className="bk-card-title"><FaUserAlt className="bk-icon-accent"/> 3. Review Passenger Details</h3>
            <div className="bk-passengers-list">
              {passengers.map((p, index) => (
                  <div key={index} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #3498db' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '5px', color: '#2c3e50' }}>
                          Passenger {index + 1}: {p.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#555' }}>
                        {p.age} yrs | {p.gender} | Seat: {selectedSeats[index]} ({selectedCoach.coachType})
                      </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bk-right-panel">
          <div className="bk-card bk-summary-card">
            <h3 className="bk-card-title"><FaInfoCircle className="bk-icon-accent"/> 4. Booking Summary</h3>

            <div className="bk-seats-overview">
              <div className="bk-o-row">
                <span>Selected Seats/Berths:</span>
                <strong>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
              </div>
              <div className="bk-o-row">
                <span>Coach:</span>
                <strong>{selectedCoach.coachType} ({selectedCoach.coachNumber})</strong>
              </div>
              <div className="bk-o-row">
                <span>Base Fare per Seat:</span>
                <strong>₹{Math.round((train.routeFare||450) * (selectedCoach.priceModifier||1.0))}</strong>
              </div>
            </div>

            <div className="bk-total-box">
              <span className="bk-tb-label">Total Fare</span>
              <span className="bk-tb-value">₹{totalFare}</span>
            </div>

            <button 
              className={`bk-checkout-btn ${isBooking ? 'disabled' : ''}`}
              onClick={handleBookTicket}
              disabled={isBooking}
            >
              {isBooking ? <span className="bk-spinner-sm"></span> : <FaCreditCard />} 
              {isBooking ? ' Reserving...' : ' Proceed to Payment'}
            </button>
            <p className="bk-secure-note"><FaCheckCircle/> Secure Booking & Instant Confirmation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
