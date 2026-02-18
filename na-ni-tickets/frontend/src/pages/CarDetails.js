import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupTime, setPickupTime] = useState(new Date().toISOString().slice(0, 16));
  const [dropTime, setDropTime] = useState(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
  const [passengerCount, setPassengerCount] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getCarDetails(id);
        setCar(res.data.car || res.data);
      } catch (err) {
        toast.error('Failed to load car details');
        setCar(null);
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
          <h2>Loading car...</h2>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="booking-page">
        <div className="container">
          <h2>Car not found</h2>
        </div>
      </div>
    );
  }

  const totalAmount = car.minimumFare || 80;

  const handleBook = async () => {
    if (!pickupLocation) return toast.warn('Enter pickup location');
    if (!dropLocation) return toast.warn('Enter drop location');
    if (passengerCount > car.seatingCapacity) {
      return toast.warn(`Maximum ${car.seatingCapacity} passengers allowed`);
    }
    try {
      const payload = {
        carId: id,
        pickupLocation,
        dropLocation,
        pickupTime,
        dropTime,
        passengerCount,
      };
      const res = await bookingsAPI.bookCar(payload);
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
        <h2>{car.carModel}</h2>
        <p>
          {car.carType} | Seating: {car.seatingCapacity} | License: {car.licensePlate}
        </p>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 2 }}>
            <div style={{ marginBottom: 16 }}>
              <label><strong>Pickup Location</strong></label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g., Downtown Station"
                style={{ display: 'block', marginTop: 6, padding: 8, width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label><strong>Drop Location</strong></label>
              <input
                type="text"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder="e.g., Airport"
                style={{ display: 'block', marginTop: 6, padding: 8, width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label><strong>Pickup Time</strong></label>
                <input
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  style={{ display: 'block', marginTop: 6, padding: 8, width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label><strong>Drop Time</strong></label>
                <input
                  type="datetime-local"
                  value={dropTime}
                  onChange={(e) => setDropTime(e.target.value)}
                  style={{ display: 'block', marginTop: 6, padding: 8, width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label><strong>Passengers</strong></label>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setPassengerCount((p) => Math.max(1, p - 1))}>-</button>
                <span style={{ padding: '0 12px', fontSize: '16px', fontWeight: 'bold' }}>{passengerCount}</span>
                <button onClick={() => setPassengerCount((p) => Math.min(car.seatingCapacity, p + 1))}>+</button>
                <span style={{ marginLeft: 12, color: '#666' }}>Max: {car.seatingCapacity}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h4>Booking Summary</h4>
            <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>{car.carModel}</strong>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '12px', color: '#666' }}>From</div>
                <div>{pickupLocation || '-'}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '12px', color: '#666' }}>To</div>
                <div>{dropLocation || '-'}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Passengers</div>
                <div>{passengerCount}</div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total Fare:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleBook}
            disabled={!pickupLocation || !dropLocation}
            style={{ padding: 12, fontSize: '16px' }}
          >
            Proceed to Payment (₹{totalAmount})
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarDetails;
