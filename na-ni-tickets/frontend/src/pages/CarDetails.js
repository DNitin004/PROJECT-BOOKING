import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaImage, FaMapMarkerAlt, FaCalendarAlt, FaPhone } from 'react-icons/fa';
import { applyImageFallback, getImage } from '../utils/imageFallbacks';
import './Booking.css';

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Timings & Locations
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupTime, setPickupTime] = useState(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
  const [dropTime, setDropTime] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));

  // Rider Details & Proofs
  const [passengerCount, setPassengerCount] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [dlUrl, setDlUrl] = useState('');

  // Local state for calculations
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getCarDetails(id);
        const foundCar = res.data.car || res.data;
        setCar(foundCar);
      } catch (err) {
        toast.error('Failed to load car details');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (car) {
      const start = new Date(pickupTime);
      const end = new Date(dropTime);
      const hours = Math.max(1, Math.ceil((end - start) / 36e5));
      setEstimatedHours(hours);
      setEstimatedTotal(hours * (car.baseFare || 80));
    }
  }, [pickupTime, dropTime, car]);

  const handleBook = async () => {
    // Validations
    if (!pickupLocation || !dropLocation || !pickupTime || !dropTime) {
      return toast.warn('Please fill all journey details');
    }
    if (!fullName || !phoneNumber || !aadharNumber || !dlUrl) {
      return toast.warn('Passenger Identity proofs and details are required');
    }
    if (aadharNumber.replace(/\s/g, '').length !== 12) {
      return toast.error('Aadhar Number must be 12 digits');
    }
    if (phoneNumber.replace(/\s/g, '').length < 10) {
      return toast.error('Please enter a valid Phone Number');
    }

    try {
      const payload = {
        carId: id,
        pickupLocation,
        dropLocation,
        pickupTime,
        dropTime,
        passengerCount,
        drivingLicenseUrl: dlUrl,
        travelers: [
          {
            name: fullName,
            phoneNumber: phoneNumber,
            identityNumber: aadharNumber // Aadhar
          }
        ]
      };
      const res = await bookingsAPI.bookCar(payload);
      toast.success('Identity Verified. Redirecting to Payment');
      const booking = res.data.booking;
      
      navigate('/payment', { state: { bookingId: booking.bookingId } });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  if (isLoading) return <div className="loading-screen" style={{color: 'white', background: '#111'}}><h2>Loading Luxury Fleet...</h2></div>;
  if (!car) return <div className="loading-screen" style={{color: 'white', background: '#111'}}><h2>Vehicle Not Found</h2></div>;

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', color: '#fff', paddingBottom: '3rem' }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #111 0%, #1a1a2e 100%)', 
        padding: '3rem 2rem', 
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ backgroundColor: '#222', borderRadius: '12px', padding: '2rem' }}>
          <img 
            src={getImage(car.images && car.images.length ? car.images[0] : '', 'premiumCar')} 
            alt={car.carModel} 
            onError={(event) => applyImageFallback(event, 'premiumCar')}
            style={{ width: '250px', height: 'auto', borderRadius: '8px' }} 
          />
        </div>
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: 700 }}>{car.make} {car.carModel}</h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{background: '#ffc107', color: '#000', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold'}}>{car.carType}</span>
            • {car.seatingCapacity} Seats • {car.fuelType} • {car.transmission}
          </p>
          <h2 style={{ color: '#4caf50', marginTop: '1rem' }}>₹{car.baseFare || 80} <span style={{fontSize: '1rem', color: '#aaa'}}>/ hr</span></h2>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', padding: '0 2rem' }}>
        
        {/* Left Col - Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Journey Details Form */}
          <div style={{ background: '#1c1c1c', borderRadius: '12px', padding: '2rem', border: '1px solid #333' }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCalendarAlt color="#ffc107" /> Plan Required Timings
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}><FaMapMarkerAlt /> Pickup Location</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  placeholder="Street or Airport..."
                  value={pickupLocation} onChange={e => setPickupLocation(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}><FaMapMarkerAlt /> Drop Location</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  placeholder="Street or Airport..."
                  value={dropLocation} onChange={e => setDropLocation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Start Time</label>
                <input 
                  type="datetime-local" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>End Time</label>
                <input 
                  type="datetime-local" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  value={dropTime} onChange={e => setDropTime(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Passengers</label>
                <input 
                  type="number" min="1" max={car.seatingCapacity}
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  value={passengerCount} onChange={e => setPassengerCount(e.target.value)}
                />
            </div>
          </div>

          {/* Passenger Identity & Rules Form */}
          <div style={{ background: '#1c1c1c', borderRadius: '12px', padding: '2rem', border: '1px solid #333' }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaIdCard color="#ffc107" /> Identity Verification
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Valid Aadhar and Driving License are strictly required for generating the receipt.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}><FaUser /> Driver Full Name</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  placeholder="As per Aadhar"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}><FaPhone /> Phone Number</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  placeholder="+91..."
                  value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}><FaIdCard /> Aadhar Number</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px', letterSpacing: '2px' }}
                  placeholder="XXXX XXXX XXXX"
                  value={aadharNumber} onChange={e => setAadharNumber(e.target.value)}
                />
            </div>

            <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}><FaImage /> Driving License Proof (URL / Upload Path)</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
                  placeholder="https://ex.com/my-license.jpg"
                  value={dlUrl} onChange={e => setDlUrl(e.target.value)}
                />
            </div>
          </div>

        </div>

        {/* Right Col - Summary */}
        <div>
          <div style={{ background: '#1c1c1c', borderRadius: '12px', padding: '2rem', border: '1px solid #333', position: 'sticky', top: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Fare Breakdown</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#aaa' }}>
              <span>Base Fare (Per Hr)</span>
              <span>₹{car.baseFare || 80}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#aaa' }}>
              <span>Duration</span>
              <span>{estimatedHours} Hrs</span>
            </div>
            <div style={{ borderTop: '1px dashed #444', margin: '1rem 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total Fare</span>
              <span style={{ color: '#4caf50' }}>₹{estimatedTotal}</span>
            </div>
            
            <button 
              onClick={handleBook}
              style={{
                width: '100%',
                padding: '16px',
                marginTop: '2rem',
                backgroundColor: '#ffc107',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: '0.3s'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#e0a800'}
              onMouseOut={e => e.target.style.backgroundColor = '#ffc107'}
            >
              Verify & Proceed
            </button>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', marginTop: '1rem' }}>
              By proceeding, you authorize identity verification and agree to the vehicle rental terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetails;
