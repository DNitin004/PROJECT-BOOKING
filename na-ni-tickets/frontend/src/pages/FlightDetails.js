import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/store';

function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [flight, setFlight] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [travelerName, setTravelerName] = useState(user?.name || '');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getFlightDetails(id);
        setFlight(res.data.flight || res.data);
        if (res.data.flight?.routes?.length > 0) {
          setSelectedRoute(res.data.flight.routes[0]);
        }
        if (res.data.flight?.classes?.length > 0) {
          setSelectedClass(res.data.flight.classes[0]);
        }
      } catch (err) {
        toast.error('Failed to load flight details');
        setFlight(null);
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
          <h2>Loading flight...</h2>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Flight not found</h2>
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
  const seatsInCabin = 180; // typical aircraft cabin
  const totalAmount = (selectedClass?.price || 0) * selectedSeats.length;

  const handleBook = async () => {
    if (selectedSeats.length === 0) return toast.warn('Select at least one seat');
    if (!selectedRoute) return toast.warn('Select a route');
    if (!selectedClass) return toast.warn('Select a class');
    try {
      const payload = {
        flightId: id,
        routeId: selectedRoute._id,
        classType: selectedClass.className,
        seats: selectedSeats,
        travelerDetails: { name: travelerName || user?.name || 'Guest' },
      };
      const res = await bookingsAPI.bookFlight(payload);
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
        <h2>{flight.airline?.name} ({flight.flightNumber})</h2>

        <div style={{ marginBottom: 16, display: 'flex', gap: 20 }}>
          <div>
            <label><strong>Route:</strong></label>
            <select
              value={selectedRoute?._id || ''}
              onChange={(e) => {
                const route = flight.routes.find((r) => r._id === e.target.value);
                setSelectedRoute(route);
                setSelectedSeats([]);
              }}
              style={{ padding: 8, marginLeft: 8 }}
            >
              {flight.routes?.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.source?.code} → {route.destination?.code} ({route.departureTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label><strong>Class:</strong></label>
            <select
              value={selectedClass?.className || ''}
              onChange={(e) => {
                const cls = flight.classes.find((c) => c.className === e.target.value);
                setSelectedClass(cls);
                setSelectedSeats([]);
              }}
              style={{ padding: 8, marginLeft: 8 }}
            >
              {flight.classes?.map((cls) => (
                <option key={cls.className} value={cls.className}>
                  {cls.className} - ₹{cls.price}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedRoute && selectedClass && (
          <>
            <p>
              <strong>Departure:</strong> {selectedRoute.departureTime} | <strong>Arrival:</strong>{' '}
              {selectedRoute.arrivalTime} | <strong>Available seats in {selectedClass.className}:</strong>{' '}
              {selectedClass.availableSeats}
            </p>

            <div style={{ marginBottom: 16, display: 'flex', gap: 20 }}>
              <div style={{ flex: 2 }}>
                <h4>Select Seats (Cabin Layout)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {Array.from({ length: seatsInCabin }).map((_, idx) => {
                    const seatNum = `${String.fromCharCode(65 + (idx % 6))}${Math.floor(idx / 6) + 1}`;
                    const isBooked = bookedSeats.includes(seatNum);
                    const isSelected = selectedSeats.includes(seatNum);
                    return (
                      <button
                        key={seatNum}
                        onClick={() => !isBooked && toggleSeat(seatNum)}
                        style={{
                          padding: 10,
                          backgroundColor: isBooked ? '#ccc' : isSelected ? '#4CAF50' : '#fff',
                          border: `2px solid ${isBooked ? '#999' : isSelected ? '#4CAF50' : '#ddd'}`,
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '11px',
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
                    <strong>Class:</strong> {selectedClass.className}
                  </p>
                  <p>
                    <strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                  </p>
                  <p>
                    <strong>Price/Seat:</strong> ₹{selectedClass.price}
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

export default FlightDetails;
