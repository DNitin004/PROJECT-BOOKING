import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/store';

function TrainDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [train, setTrain] = useState(null);
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [travelerName, setTravelerName] = useState(user?.name || '');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getTrainDetails(id);
        setTrain(res.data.train || res.data);
        if (res.data.train?.coaches?.length > 0) {
          setSelectedCoach(res.data.train.coaches[0]);
        }
      } catch (err) {
        toast.error('Failed to load train details');
        setTrain(null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Loading train...</h2>
        </div>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Train not found</h2>
        </div>
      </div>
    );
  }

  const toggleSeat = (seatNum) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNum) ? prev.filter((s) => s !== seatNum) : [...prev, seatNum]
    );
  };

  const seatsPerCoach = selectedCoach?.totalSeats || 72;
  const bookedSeatsForDate = selectedCoach?.bookedSeats || [];
  const avgFare = 1000;
  const totalAmount = avgFare * selectedSeats.length;

  const handleBook = async () => {
    if (selectedSeats.length === 0) return toast.warn('Select at least one seat');
    try {
      const payload = {
        trainId: id,
        journeyDate: new Date(journeyDate).toISOString(),
        seats: selectedSeats,
        travelerDetails: { name: travelerName || user?.name || 'Guest' },
      };
      const res = await bookingsAPI.bookTrain(payload);
      toast.success('Booking created. Redirecting to payment...');
      const booking = res.data.booking;
      navigate('/payment', { state: { bookingId: booking.bookingId } });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create booking');
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <h2>{train.trainName} ({train.trainNumber})</h2>
        <p>Running days: {train.runningDays?.join(', ')}</p>

        <div style={{ marginBottom: 16 }}>
          <label><strong>Journey Date:</strong></label>
          <input
            type="date"
            value={journeyDate}
            onChange={(e) => {
              setJourneyDate(e.target.value);
              setSelectedSeats([]);
            }}
            style={{ padding: 8, marginLeft: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label><strong>Select Coach:</strong></label>
          <select
            value={selectedCoach?.coachNumber || ''}
            onChange={(e) => {
              const coach = train.coaches.find((c) => c.coachNumber === e.target.value);
              setSelectedCoach(coach);
              setSelectedSeats([]);
            }}
            style={{ padding: 8, marginLeft: 8 }}
          >
            {train.coaches?.map((coach) => (
              <option key={coach.coachNumber} value={coach.coachNumber}>
                {coach.coachType} - {coach.coachNumber}
              </option>
            ))}
          </select>
        </div>

        {selectedCoach && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', gap: 20 }}>
              <div style={{ flex: 2 }}>
                <h4>Select Seats (Coach Layout)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {Array.from({ length: seatsPerCoach }).map((_, idx) => {
                    const seatNum = `${selectedCoach.coachNumber}${String.fromCharCode(65 + (idx % 6))}${Math.floor(idx / 6) + 1}`;
                    const isBooked = bookedSeatsForDate.includes(seatNum);
                    const isSelected = selectedSeats.includes(seatNum);
                    return (
                      <button
                        key={seatNum}
                        onClick={() => !isBooked && toggleSeat(seatNum)}
                        style={{
                          padding: 12,
                          backgroundColor: isBooked ? '#ccc' : isSelected ? '#4CAF50' : '#fff',
                          border: `2px solid ${isBooked ? '#999' : isSelected ? '#4CAF50' : '#ddd'}`,
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                        disabled={isBooked}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h4>Summary</h4>
                <div style={{ border: '1px solid #ddd', padding: 12 }}>
                  <p>
                    <strong>Coach:</strong> {selectedCoach.coachType} ({selectedCoach.coachNumber})
                  </p>
                  <p>
                    <strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                  </p>
                  <p>
                    <strong>Fare/Seat:</strong> ₹{avgFare}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹{totalAmount}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label><strong>Your Name</strong></label>
              <input
                value={travelerName}
                onChange={(e) => setTravelerName(e.target.value)}
                placeholder="Name for ticket"
                style={{ display: 'block', marginTop: 6, padding: 8, width: '100%', maxWidth: 360 }}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={handleBook} disabled={selectedSeats.length === 0}>
                Proceed to Payment (₹{totalAmount})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TrainDetails;
