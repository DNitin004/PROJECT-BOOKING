const fs = require('fs');

const content = \import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/store';
import { FaTrain, FaMapMarkerAlt, FaCalendarCheck, FaClock, FaCheckCircle, FaUserAlt, FaCreditCard, FaInfoCircle, FaCouch, FaBed, FaChair } from 'react-icons/fa';
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
  const { user } = useAuthStore();

  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journeyDate, setJourneyDate] = useState(location.state?.journeyDate || new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState(location.state?.fromStation || '');
  const [destination, setDestination] = useState(location.state?.toStation || '');
  
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [travelerName, setTravelerName] = useState(user?.name || '');
  const [isBooking, setIsBooking] = useState(false);

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

  const handleBookTicket = async () => {
    if (selectedSeats.length === 0) return toast.warn('Please select at least one seat/berth');
    if (!travelerName.trim()) return toast.warn('Please enter lead traveler name');
    
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
        travelerDetails: { name: travelerName }
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

      <div className="bk-main">
        <div className="bk-left-panel">
          <div className="bk-card">
            <h3 className="bk-card-title"><FaCouch className="bk-icon-accent"/> 1. Select Class & Coach</h3>
            
            <div className="bk-coaches-list">
              {train.coaches.map(coach => (
                <button 
                  key={coach.coachNumber}
                  className={\\\k-coach-btn \\\\\\}
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
                  const seatId = \\\\\\-\\\\\\;
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
                      className={\\\k-seat \\\ \\\ \\\\\\}
                      onClick={() => !booked && handleSeatClick(seatId)}
                      disabled={booked}
                      title={\\\Seat \\\\\\}
                    >
                      {getSeatIcon(selectedCoach.coachType)}
                      <span className="bk-s-text">{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bk-right-panel">
          <div className="bk-card bk-summary-card">
            <h3 className="bk-card-title"><FaInfoCircle className="bk-icon-accent"/> 2. Booking Summary</h3>
            
            <div className="bk-form-group">
              <label><FaUserAlt/> Lead Traveler Name</label>
              <input 
                type="text" 
                value={travelerName} 
                onChange={(e) => setTravelerName(e.target.value)}
                placeholder="Enter full name as per Govt ID"
                className="bk-input"
              />
            </div>

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
              className={\\\k-checkout-btn \\\\\\}
              onClick={handleBookTicket}
              disabled={selectedSeats.length === 0 || isBooking}
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
}\;

fs.writeFileSync('frontend/src/pages/TrainDetails.js', content, 'utf8');
