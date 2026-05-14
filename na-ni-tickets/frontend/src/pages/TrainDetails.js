import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaCalendarCheck, FaClock, FaCouch, FaBed, FaChair } from 'react-icons/fa';
import './Booking.css';
import './TrainDetails.css';

const DEFAULT_COACHES = [
  { coachNumber: 'A1', coachType: 'AC 1-Tier', totalSeats: 24, bookedSeats: [], priceModifier: 2.5 },
  { coachNumber: 'B1', coachType: 'AC 3-Tier', totalSeats: 64, bookedSeats: [], priceModifier: 1.5 },
  { coachNumber: 'S1', coachType: 'Sleeper', totalSeats: 72, bookedSeats: [], priceModifier: 1.0 },
  { coachNumber: 'GEN', coachType: 'General', totalSeats: 90, bookedSeats: [], priceModifier: 0.5 }
];

export default function TrainDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journeyDate] = useState(location.state?.journeyDate || new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState(location.state?.fromStation || '');
  const [destination, setDestination] = useState(location.state?.toStation || '');
  
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    async function fetchTrain() {
      try {
        setLoading(true);
        const res = await itemsAPI.getTrainDetails(id);
        const data = res.data.train || res.data;
        
        if (!data.coaches || data.coaches.length === 0) {
          data.coaches = DEFAULT_COACHES;
        }

        if (!source) setSource(data.stationFrom);
        if (!destination) setDestination(data.stationTo);

        setTrain(data);
        setSelectedCoach(data.coaches[0]);

      } catch (error) {
        toast.error('Failed to load train details');
        navigate('/trains');
      } finally {
        setLoading(false);
      }
    }
    fetchTrain();
  }, [id, navigate, source, destination]);

  const handleSeatClick = (seatNum) => {
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
    } else {
      if (selectedSeats.length >= 6) {
        toast.info('Maximum 6 seats can be booked at once');
        return;
      }
      setSelectedSeats(prev => [...prev, seatNum]);
    }
  };

  const getSeatIcon = (type) => {
    if (type?.includes('Sleeper') || type?.includes('AC')) return <FaBed />;
    return <FaChair />;
  };

  const calculateFare = () => {
    if (!train || !selectedCoach) return 0;
    const baseFare = train.routeFare || 450;
    const modifier = selectedCoach.priceModifier || 1.0;
    return Math.round(baseFare * modifier * selectedSeats.length);
  };

  if (loading) {
    return (
      <div className="bk-loader-container">
        <div className="bk-spinner"></div>
        <p>Loading realtime inventory...</p>
      </div>
    );
  }

  if (!train) return null;

  const totalFare = calculateFare();
  const isBooked = (s) => (selectedCoach.bookedSeats || []).includes(s);

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
          <div className="bk-card">
            <h3 className="bk-card-title"><FaCouch className="bk-icon-accent"/> 1. Select Class & Coach</h3>
            
            <div className="bk-coaches-list">
              {train.coaches.map(coach => (
                <button 
                  key={coach.coachNumber}
                  className={`bk-coach-btn ${selectedCoach?.coachNumber === coach.coachNumber ? 'active' : ''}`}
                  onClick={() => { setSelectedCoach(coach); setSelectedSeats([]); }}
                >
                  <div className="bk-c-type">{coach.coachType}</div>
                  <div className="bk-c-num">{coach.coachNumber}</div>
                  <div className="bk-c-fare">₹{Math.round((train.routeFare || 450) * (coach.priceModifier || 1))}</div>
                </button>
              ))}
            </div>

            <div className="bk-legend">
              <span className="bk-leg-item"><span className="bk-box available"></span> Available</span>
              <span className="bk-leg-item"><span className="bk-box selected"></span> Selected</span>
              <span className="bk-leg-item"><span className="bk-box booked"></span> Booked</span>
            </div>

            <div className="bk-seat-map-container">
              <div className="bk-seat-map">
                {Array.from({ length: selectedCoach?.totalSeats || 72 }).map((_, idx) => {
                  const seatId = `${selectedCoach.coachNumber}-${idx + 1}`;
                  const booked = isBooked(seatId);
                  const selected = selectedSeats.includes(seatId);
                  
                  let berthClass = '';
                  if (selectedCoach.coachType.includes('Sleeper') || selectedCoach.coachType.includes('AC')) {
                     const r = (idx % 8);
                     if (r===0||r===1) berthClass='lower';
                     if (r===2||r===3) berthClass='middle';
                     if (r===4||r===5) berthClass='upper';
                     if (r===6) berthClass='side-lower';
                     if (r===7) berthClass='side-upper';
                  }

                  return (
                    <button
                      key={seatId}
                      className={`bk-seat ${booked ? 'booked' : ''} ${selected ? 'selected' : ''} ${berthClass}`}
                      onClick={() => !booked && handleSeatClick(seatId)}
                      disabled={booked}
                      title={`Seat ${seatId}`}
                    >
                      {getSeatIcon(selectedCoach.coachType)}
                      <span className="bk-s-text">{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button 
                  className="bk-checkout-btn"
                  onClick={() => {
                    navigate(`/trains/${id}/passengers`, {
                        state: {
                            train,
                            journeyDate,
                            source,
                            destination,
                            selectedCoach,
                            selectedSeats,
                            totalFare
                        }
                    });
                  }}
                  style={{ width: 'auto', padding: '15px 40px', fontSize: '18px' }}
                >
                  Proceed with {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
