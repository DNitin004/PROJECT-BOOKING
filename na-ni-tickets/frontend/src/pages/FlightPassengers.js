import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserAlt, FaMapMarkerAlt, FaCalendarCheck, FaClock } from 'react-icons/fa';
import './Booking.css';

export default function FlightPassengers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [passengers, setPassengers] = useState([]);

  const stateData = location.state || {};
  const {
    flight,
    route,
    flightClass,
    selectedSeats,
    boardingPoint,
    dropPoint
  } = stateData;

  useEffect(() => {
    if (!flight || !selectedSeats || selectedSeats.length === 0) {
      toast.warn("Invalid session, please re-select seats.");
      navigate(`/flights/${id}`);
      return;
    }
    
    const initialPassengers = selectedSeats.map((seat, idx) => ({
      name: '',
      age: '',
      gender: 'Male',
      identityNumber: '',
      seat
    }));
    setPassengers(initialPassengers);

  }, [flight, selectedSeats, id, navigate]);

  if (!flight) return null;

  const handleReviewDetails = () => {
    for (let i = 0; i < passengers.length; i++) {
       const p = passengers[i];
       if (!p.name.trim() || !p.age || !p.identityNumber.trim()) {
         toast.warn(`Please enter complete details (including Identity number) for Passenger ${i+1}`);      
         return;
       }
    }

    navigate(`/flights/${id}/review`, {
      state: {
        ...stateData,
        passengers
      }
    });
  };

  return (
    <div className="bk-layout">
      <div className="bk-header">
        <div className="bk-header-content">
          <h1>{flight.airline?.name} <span className="bk-train-num">#{flight.flightNumber}</span></h1>
          <div className="bk-route-display">
            <span className="bk-station"><FaMapMarkerAlt/> {boardingPoint?.name || route?.source?.name}</span>
            <span className="bk-divider">➝</span>
            <span className="bk-station"><FaMapMarkerAlt/> {dropPoint?.name || route?.destination?.name}</span>
          </div>
          <div className="bk-timing">
             <span className="bk-pill"><FaCalendarCheck/> {new Date(route?.date).toDateString()}</span>
             <span className="bk-pill"><FaClock/> Duration: {route?.journeyDuration}</span>
             <span className="bk-pill">Class: {flightClass?.className}</span>
          </div>
        </div>
      </div>

      <div className="bk-main" style={{ display: 'flex', justifyContent: 'center', margin: '-40px auto 0', padding: '0 20px' }}>
        <div className="bk-left-panel" style={{ width: '100%', maxWidth: '700px' }}>
          <div className="bk-card" style={{ marginBottom: '20px', padding: '30px' }}>
            <h3 className="bk-card-title"><FaUserAlt className="bk-icon-accent"/> Passenger Details</h3>

            <div className="bk-passengers-list">
                {passengers.map((p, index) => (
                    <div key={index} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #007bff' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            Passenger {index + 1} (Seat: {p.seat})
                        </div>
                        <input
                            type="text"
                            value={p.name}
                            onChange={(e) => {
                                const newP = [...passengers];
                                newP[index].name = e.target.value;
                                setPassengers(newP);
                            }}
                            placeholder="Full Name (as per ID)"
                            style={{ marginBottom: '10px', padding: '10px', width: '100%', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <div style={{ display: 'flex', gap: '15px' }}>      
                            <input
                                type="number"
                                value={p.age}
                                onChange={(e) => {
                                    const newP = [...passengers];
                                    newP[index].age = e.target.value;       
                                    setPassengers(newP);
                                }}
                                placeholder="Age"
                                style={{ flex: '1', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <input
                                type="text"
                                value={p.identityNumber || ''}
                                onChange={(e) => {
                                    const newP = [...passengers];
                                    newP[index].identityNumber = e.target.value;       
                                    setPassengers(newP);
                                }}
                                placeholder="Passport / Aadhar No."
                                style={{ flex: '2', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <select
                                value={p.gender}
                                onChange={(e) => {
                                    const newP = [...passengers];
                                    newP[index].gender = e.target.value;    
                                    setPassengers(newP);
                                }}
                                style={{ flex: '1', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>      
                                <option value="Other">Other</option>        
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button 
                  onClick={handleReviewDetails}
                  style={{
                    padding: '15px 30px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  Continue to Summary & Review ➝
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}