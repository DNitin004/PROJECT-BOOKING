import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserAlt, FaMapMarkerAlt, FaCalendarCheck, FaClock } from 'react-icons/fa';
import './Booking.css';
import './TrainDetails.css';

export default function TrainPassengers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [passengers, setPassengers] = useState([]);
  
  const stateData = location.state || {};
  const {
    train,
    journeyDate,
    source,
    destination,
    selectedSeats
  } = stateData;

  useEffect(() => {
    if (!train || !selectedSeats || selectedSeats.length === 0) {
      toast.warn("Invalid session, please re-select seats.");
      navigate(`/trains/${id}`);
      return;
    }
    
    setPassengers(prev => {
      const newPassengers = [...prev];
      if (newPassengers.length < selectedSeats.length) {
          while(newPassengers.length < selectedSeats.length) {
              newPassengers.push({ name: '', age: '', gender: 'Male' });
          }
      } 
      return newPassengers.slice(0, selectedSeats.length);
    });
  }, [train, selectedSeats, id, navigate]);

  if (!train) return null;

  const handleReviewDetails = () => {
    for (let i = 0; i < passengers.length; i++) {
       const p = passengers[i];
       if (!p.name.trim() || !p.age) {
         toast.warn(`Please enter complete details for Passenger ${i+1}`);
         return;
       }
    }
    
    navigate(`/trains/${id}/review`, { 
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

      <div className="bk-main" style={{ display: 'block', maxWidth: '800px', margin: '-40px auto 0' }}>
        <div className="bk-left-panel">
          <div className="bk-card" style={{ marginBottom: '20px' }}>
            <h3 className="bk-card-title"><FaUserAlt className="bk-icon-accent"/> 2. Passenger Details</h3>
            
            {passengers.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic', fontSize: '14px', margin: '0' }}>Loading passenger form...</p>
            ) : (
                <div className="bk-passengers-list" style={{ paddingRight: '5px' }}>
                    {passengers.map((p, index) => (
                        <div key={index} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #2ecc71' }}>
                            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: '#2c3e50' }}>
                                Passenger {index + 1} (Seat: {selectedSeats[index]})
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
                                className="bk-input"
                                style={{ marginBottom: '10px', fontSize: '13px', padding: '10px', width: '100%', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="number" 
                                    value={p.age} 
                                    onChange={(e) => {
                                        const newP = [...passengers];
                                        newP[index].age = e.target.value;
                                        setPassengers(newP);
                                    }}
                                    placeholder="Age"
                                    className="bk-input"
                                    style={{ flex: '1', fontSize: '13px', padding: '10px' }}
                                />
                                <select 
                                    value={p.gender} 
                                    onChange={(e) => {
                                        const newP = [...passengers];
                                        newP[index].gender = e.target.value;
                                        setPassengers(newP);
                                    }}
                                    className="bk-input"
                                    style={{ flex: '1', fontSize: '13px', padding: '10px', cursor: 'pointer' }}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button 
                  className={`bk-checkout-btn ${(selectedSeats.length === 0) ? 'disabled' : ''}`}
                  onClick={handleReviewDetails}
                  disabled={selectedSeats.length === 0}
                  style={{ width: 'auto', padding: '15px 40px', fontSize: '18px' }}
                >
                  Continue to Summary & Review →
                </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
