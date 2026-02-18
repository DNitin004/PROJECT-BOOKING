import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/store';

function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [bus, setBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [travelerName, setTravelerName] = useState(user?.name || '');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getBusDetails(id);
        setBus(res.data.bus || res.data);
        if (res.data.bus?.routes?.length > 0) {
          setSelectedRoute(res.data.bus.routes[0]);
        }
      } catch (err) {
        toast.error('Failed to load bus details');
        setBus(null);
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
          <h2>Loading bus...</h2>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Bus not found</h2>
        </div>
      </div>
    );
  }

  const toggleSeat = (seatNum) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNum) ? prev.filter((s) => s !== seatNum) : [...prev, seatNum]
    );
  };

  const bookedSeats = selectedRoute?.bookedSeats || [];
  const totalSeats = bus.totalSeats || 42;
  const totalAmount = (selectedRoute?.fare || 0) * selectedSeats.length;

  const handleBook = async () => {
    if (selectedSeats.length === 0) return toast.warn('Select at least one seat');
    if (!selectedRoute) return toast.warn('Select a route');
    try {
      const payload = {
        busId: id,
        routeId: selectedRoute._id,
        seats: selectedSeats,
        travelerDetails: { name: travelerName || user?.name || 'Guest' },
      };
      const res = await bookingsAPI.bookBus(payload);
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
        <h2>{bus.busName} ({bus.busNumber})</h2>
        <p>{bus.operatorName} - {bus.busType}</p>

        <div style={{ marginBottom: 16 }}>
          <label><strong>Select Route:</strong></label>
          <select
            value={selectedRoute?._id || ''}
            onChange={(e) => {
              const route = bus.routes.find((r) => r._id === e.target.value);
              setSelectedRoute(route);
              setSelectedSeats([]);
            }}
            style={{ padding: 8, marginLeft: 8 }}
          >
            {bus.routes?.map((route) => (
              <option key={route._id} value={route._id}>
                {route.source?.name} → {route.destination?.name} ({route.departureTime})
              </option>
            ))}
          </select>
        </div>

        {selectedRoute && (
          <>
            <p>
              <strong>Fare:</strong> ₹{selectedRoute.fare} | <strong>Departure:</strong> {selectedRoute.departureTime} |{' '}
              <strong>Arrival:</strong> {selectedRoute.arrivalTime}
            </p>

            <div style={{ marginBottom: 16, display: 'flex', gap: 20 }}>
              <div style={{ flex: 2 }}>
                <h4>Select Seats (Bus Layout)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {Array.from({ length: totalSeats }).map((_, idx) => {
                    const seatNum = `${Math.floor(idx / 6) + 1}${String.fromCharCode(65 + (idx % 6))}`;
                    const isBooked = bookedSeats.includes(seatNum);
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
                    <strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                  </p>
                  <p>
                    <strong>Fare/Seat:</strong> ₹{selectedRoute.fare}
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

export default BusDetails;
