import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaPlane } from 'react-icons/fa';
import { bookingsAPI } from '../services/api';
import './Booking.css';

export default function FlightSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBooking, setIsBooking] = useState(false);

  const stateData = location.state || {};
  const {
    flight,
    route,
    flightClass,
    selectedSeats,
    passengers,
    boardingPoint,
    dropPoint
  } = stateData;

  const routeId =
    route?._id?.toString?.() ||
    route?.id ||
    route?.routeId ||
    null;

  if (!flight || !passengers) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Invalid Session</h2>
        <button onClick={() => navigate(`/flights/${id}`)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const baseFare = flightClass.price * selectedSeats.length;
  const taxes = Math.round(baseFare * 0.18); 
  const totalAmount = baseFare + taxes;

  const handleConfirmAndPay = async () => {
    try {
      setIsBooking(true);
      const payload = {
        flightId: id,
        routeId,
        classType: flightClass?.className || flightClass?.name,
        seats: Array.isArray(selectedSeats) ? selectedSeats : [],
        travelerDetails: Array.isArray(passengers) ? passengers : [],
        boardingPoint: boardingPoint?.name || route?.source?.name,
        dropPoint: dropPoint?.name || route?.destination?.name,
      };

      if (!payload.flightId || !payload.classType || payload.seats.length === 0) {
        throw new Error('Incomplete booking details. Please return to the previous step and retry.');
      }

      const { data } = await bookingsAPI.bookFlight(payload);
      
      toast.success('Flight booked successfully! Redirecting to payment...');
      setTimeout(() => {
        navigate(`/payment`, { state: { bookingId: data.booking.bookingId, totalAmount: data.booking.totalAmount } });
      }, 1500);

    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.message || 'Failed to book flight. Try again later.');
      setIsBooking(false);
    }
  };

  return (
    <div className="bk-layout" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingBottom: '40px' }}>
      <div className="bk-header">
        <div className="bk-header-content">
          <h1>Review Itinerary</h1>
          <div className="bk-route-display">
            <span className="bk-station"><FaPlane/> {boardingPoint?.name || route?.source?.name}</span>
            <span className="bk-divider">➝</span>
            <span className="bk-station"><FaPlane/> {dropPoint?.name || route?.destination?.name}</span>
          </div>
        </div>
      </div>

      <div className="bk-main" style={{ display: 'flex', gap: '20px', maxWidth: '1000px', margin: '-40px auto 0', padding: '0 20px' }}>
        
        {/* LEFT PANEL */}
        <div className="bk-left-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="bk-card" style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Flight Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <p style={{ color: '#777', margin: '0 0 5px 0', fontSize: '12px' }}>AIRLINE</p>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{flight.airline?.name} ({flight.flightNumber})</p>
              </div>
              <div>
                <p style={{ color: '#777', margin: '0 0 5px 0', fontSize: '12px' }}>DATE</p>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{new Date(route.date).toDateString()}</p>
              </div>
              <div>
                <p style={{ color: '#777', margin: '0 0 5px 0', fontSize: '12px' }}>DEPARTURE</p>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{route.departureTime}</p>
              </div>
              <div>
                <p style={{ color: '#777', margin: '0 0 5px 0', fontSize: '12px' }}>ARRIVAL</p>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{route.arrivalTime}</p>
              </div>
              <div>
                <p style={{ color: '#777', margin: '0 0 5px 0', fontSize: '12px' }}>CLASS</p>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{flightClass.className}</p>
              </div>
              <div>
                <p style={{ color: '#777', margin: '0 0 5px 0', fontSize: '12px' }}>AIRCRAFT</p>
                <p style={{ fontWeight: 'bold', margin: '0' }}>{flight.aircraftType}</p>
              </div>
            </div>
          </div>

          <div className="bk-card" style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Passenger Details</h3>
            {passengers.map((p, i) => (
              <div key={`${p.identityNumber || p.seat || 'traveler'}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '6px', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{p.name}</h4>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{p.gender} | {p.age} yrs | ID: {p.identityNumber}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Seat</p>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#1976d2' }}>{p.seat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - FARE SUMMARY */}
        <div className="bk-right-panel" style={{ width: '350px' }}>
          <div className="bk-card" style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Fare Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#555', fontSize: '14px' }}>
              <span>Base Fare ({passengers.length} Traveler{passengers.length > 1 && 's'})</span>
              <span>₹{baseFare}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#555', fontSize: '14px' }}>
              <span>Taxes & Fees (18%)</span>
              <span>₹{taxes}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '15px 0' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontWeight: 'bold', fontSize: '18px', color: '#e53935' }}>
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>

            <button 
              className={`bk-checkout-btn ${isBooking ? 'disabled' : ''}`}
              onClick={handleConfirmAndPay}
              disabled={isBooking}
              style={{ width: '100%', padding: '15px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: isBooking ? 'not-allowed' : 'pointer' }}
            >
              {isBooking ? 'Processing...' : `Pay ₹${totalAmount}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#888', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
               <FaShieldAlt color="#4caf50"/> Safe & Secure Payments
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
