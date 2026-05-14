const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/store';
import { FaBus, FaMapMarkerAlt, FaClock, FaCheckCircle, FaUser, FaChair } from 'react-icons/fa';

function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [bus, setBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getBusDetails(id);
        const fetchedBus = res.data.bus || res.data;
        setBus(fetchedBus);
        if (fetchedBus?.routes?.length > 0) {
          setSelectedRoute(fetchedBus.routes[0]);
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
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="spinner" style={{ margin: '0 auto', borderColor: '#d84e55', borderTopColor: 'transparent' }}></div>
        <p>Loading Seat Layout...</p>
      </div>
    );
  }

  if (!bus) return <div style={{ textAlign: 'center', padding: '100px' }}>Bus not found</div>;

  const bookedSeats = selectedRoute?.bookedSeats || [];
  const totalSeats = bus.totalSeats || 42;

  const toggleSeat = (seatNum) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNum)) {
        const newSeats = prev.filter((s) => s !== seatNum);
        const newPassengers = { ...passengerDetails };
        delete newPassengers[seatNum];
        setPassengerDetails(newPassengers);
        return newSeats;
      } else {
        if (prev.length >= 6) {
          toast.info('You can only book maximum 6 seats at once.');
          return prev;
        }
        return [...prev, seatNum];
      }
    });
  };

  const handlePassengerChange = (seatNum, field, value) => {
    setPassengerDetails(prev => ({
      ...prev,
      [seatNum]: {
        ...prev[seatNum],
        [field]: value
      }
    }));
  };

  const totalAmount = (selectedRoute?.fare || 0) * selectedSeats.length;

  const handleBook = async () => {
    if (selectedSeats.length === 0) return toast.warn('Please select at least one seat');
    
    // Validate passengers
    for (let seat of selectedSeats) {
        if (!passengerDetails[seat]?.name || !passengerDetails[seat]?.age || !passengerDetails[seat]?.gender) {
            return toast.warn(\`Please fill all details for Seat \${seat}\`);
        }
    }

    try {
      const payload = {
        busId: id,
        routeId: selectedRoute._id,
        seats: selectedSeats,
        travelerDetails: { 
            name: passengerDetails[selectedSeats[0]].name, 
            passengers: selectedSeats.map(seat => ({
                seat,
                name: passengerDetails[seat].name,
                age: passengerDetails[seat].age,
                gender: passengerDetails[seat].gender
            }))
        },
      };
      
      const res = await bookingsAPI.bookBus(payload);
      toast.success('Seats reserved successfully! Redirecting to payment...');
      const booking = res.data.booking;
      // Send to payment page
      setTimeout(() => {
          navigate('/payment', { state: { bookingId: booking.bookingId } });
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to reserve seats. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Open Sans", sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Summary */}
        <div style={{ background: '#fff', padding: '20px 30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 5px', color: '#222', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBus color="#d84e55" /> {bus.operatorName}
              </h1>
              <p style={{ margin: 0, color: '#666' }}>{bus.busName} ({bus.busNumber}) | {bus.busType}</p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <label style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Selected Route:</label>
              <select
                value={selectedRoute?._id || ''}
                onChange={(e) => {
                  const route = bus.routes.find((r) => r._id === e.target.value);
                  setSelectedRoute(route);
                  setSelectedSeats([]);
                  setPassengerDetails({});
                }}
                style={{ display: 'block', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', background: '#f9f9f9', minWidth: '250px' }}
              >
                {bus.routes?.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.source?.name || 'Unknown'} → {route.destination?.name || 'Unknown'} ({route.departureTime || 'TBD'})
                  </option>
                ))}
              </select>
            </div>
        </div>

        {selectedRoute && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            {/* Left: Seat Selection Layout */}
            <div style={{ flex: '1 1 500px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaChair color="#d84e55"/> Click on an Available Seat to Select
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', fontSize: '14px', color: '#555' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 20, height: 20, border: '1px solid #ccc', background: '#fff', borderRadius: 4 }}></div> Available</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 20, height: 20, background: '#ccc', borderRadius: 4 }}></div> Booked</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 20, height: 20, background: '#38b87c', borderRadius: 4 }}></div> Selected</div>
                </div>

                <div style={{ border: '2px solid #ddd', padding: '30px', borderRadius: '16px', position: 'relative', width: 'fit-content', margin: '0 auto', background: '#fafafa' }}>
                    <div style={{ position: 'absolute', top: 20, right: 20, width: 30, height: 30, border: '2px solid #ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 10, fontWeight: 'bold' }}>S</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '40px' }}>
                        {Array.from({ length: totalSeats }).map((_, idx) => {
                            // Leave gap for aisle (skip 3rd column)
                            const row = Math.floor(idx / 4);
                            const col = idx % 4;
                            const gridCol = col >= 2 ? col + 2 : col + 1; // 1, 2, 4, 5
                            
                            const seatNum = \`\${row + 1}\${String.fromCharCode(65 + col)}\`;
                            const isBooked = bookedSeats.includes(seatNum);
                            const isSelected = selectedSeats.includes(seatNum);
                            
                            return (
                                <button
                                    key={seatNum}
                                    onClick={() => !isBooked && toggleSeat(seatNum)}
                                    style={{
                                        gridColumn: gridCol,
                                        width: '45px',
                                        height: '45px',
                                        backgroundColor: isBooked ? '#ccc' : isSelected ? '#38b87c' : '#fff',
                                        border: \`2px solid \${isBooked ? '#aaa' : isSelected ? '#38b87c' : '#bbb'}\`,
                                        borderRadius: '8px 8px 4px 4px',
                                        cursor: isBooked ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold',
                                        color: isSelected || isBooked ? '#fff' : '#555',
                                        fontSize: '12px',
                                        transition: 'all 0.2s',
                                        boxShadow: isSelected ? '0 4px 8px rgba(56, 184, 124, 0.4)' : 'none'
                                    }}
                                    disabled={isBooked}
                                >
                                    {seatNum}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right: Passenger Details & Summary */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Route Summary */}
                <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>{selectedRoute.source?.name}</div>
                        <div style={{ color: '#aaa', fontSize: '20px' }}>→</div>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>{selectedRoute.destination?.name}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaClock /> {selectedRoute.departureTime}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaClock /> {selectedRoute.arrivalTime}</div>
                    </div>
                    <div style={{ background: '#f0f8ff', padding: '10px', borderRadius: '6px', color: '#0056b3', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                        Fare: ₹{selectedRoute.fare} per seat
                    </div>
                </div>

                {/* Selected Seats & Passenger Input */}
                {selectedSeats.length > 0 ? (
                    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
                        <h3 style={{ margin: '0 0 15px', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                           <FaUser style={{ color: '#d84e55', marginRight: 8 }}/> Passenger Details
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                            {selectedSeats.map((seat) => (
                                <div key={seat} style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '6px', padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#d84e55', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Seat {seat}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Passenger Name" 
                                            value={passengerDetails[seat]?.name || ''}
                                            onChange={(e) => handlePassengerChange(seat, 'name', e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input 
                                                type="number" 
                                                placeholder="Age" 
                                                value={passengerDetails[seat]?.age || ''}
                                                onChange={(e) => handlePassengerChange(seat, 'age', e.target.value)}
                                                style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                                                min="1" max="100"
                                            />
                                            <select
                                                value={passengerDetails[seat]?.gender || ''}
                                                onChange={(e) => handlePassengerChange(seat, 'gender', e.target.value)}
                                                style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', background: '#fff' }}
                                            >
                                                <option value="" disabled>Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '2px dashed #eee', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                                <span>Total Amount:</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <button 
                                onClick={handleBook}
                                style={{ width: '100%', background: '#d84e55', color: '#fff', border: 'none', padding: '15px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'background 0.3s' }}
                            >
                                <FaCheckCircle /> Proceed to Pay
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '40px 20px', textAlign: 'center', color: '#888' }}>
                        <div style={{ fontSize: '40px', color: '#ddd', marginBottom: '10px' }}><FaChair /></div>
                        <h3>No Seats Selected</h3>
                        <p>Click on the available seats layout to select your preferred seats.</p>
                    </div>
                )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default BusDetails;
`;

fs.writeFileSync('c:/Users/nithi/OneDrive/Desktop/PROJECT-BOOKING/na-ni-tickets/frontend/src/pages/writebusdetails.js', code);
