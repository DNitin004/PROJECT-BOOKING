import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlaneDeparture, FaPlaneArrival, FaMapMarkerAlt, FaChair, FaPlane } from 'react-icons/fa';

function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [dropPoint, setDropPoint] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getFlightDetails(id);
        const data = res.data.flight || res.data;
        setFlight(data);
        if (data?.routes?.length > 0) {
          const defaultRoute = data.routes[0];
          setSelectedRoute(defaultRoute);
          setBoardingPoint(defaultRoute.source);
          setDropPoint(defaultRoute.destination);
        }
        if (data?.classes?.length > 0) {
          setSelectedClass(data.classes[0]);
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

  const getPoints = () => {
    if (!selectedRoute) return [];
    return [selectedRoute.source, ...(selectedRoute.stops || []), selectedRoute.destination];
  };

  const getRouteKey = (route) =>
    route?._id?.toString?.() ||
    route?.id ||
    `${route?.source?.code || route?.source?.name}-${route?.destination?.code || route?.destination?.name}-${route?.departureTime}-${route?.date || ''}`;

  const getPointKey = (point) =>
    point?.code || `${point?.name || 'point'}-${point?.arrivalTime || ''}-${point?.departureTime || ''}`;

  const handleProceed = () => {
    if (selectedSeats.length === 0) return toast.warn('Select at least one seat');
    navigate(`/flights/${id}/passengers`, { 
      state: { 
        flight, 
        route: selectedRoute, 
        flightClass: selectedClass, 
        selectedSeats,
        boardingPoint,
        dropPoint
      }
    });
  };

  const points = getPoints();
  const boardingIndex = boardingPoint ? points.findIndex(p => p.code === boardingPoint.code) : 0;

  return (
    <div className="booking-page" style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: '#fff', padding: '30px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
             <FaPlane style={{ transform: 'rotate(-45deg)' }} /> {flight.airline?.name} <span style={{ opacity: 0.8, fontSize: '20px' }}>#{flight.flightNumber}</span>
          </h2>
          <p style={{ marginTop: '10px', fontSize: '16px', opacity: 0.9 }}>{boardingPoint?.name} ({boardingPoint?.code}) → {dropPoint?.name} ({dropPoint?.code})</p>
        </div>

        <div style={{ padding: '30px' }}>
          
          <div style={{ marginBottom: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 15px', color: '#333' }}>1. Select Flight Route</h4>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {flight.routes?.map((route) => (
                 <button
                   key={getRouteKey(route)}
                   onClick={() => {
                     setSelectedRoute(route);
                     setSelectedSeats([]);
                     setBoardingPoint(route.source);
                     setDropPoint(route.destination);
                   }}
                   style={{
                     flex: '1', minWidth: '200px', padding: '15px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                     background: selectedRoute?._id === route._id ? '#e8f0fe' : '#fff',
                     border: selectedRoute?._id === route._id ? '2px solid #1e3c72' : '2px solid #ddd',
                     color: selectedRoute?._id === route._id ? '#1e3c72' : '#555',
                     transition: 'all 0.2s'
                   }}
                 >
                   <strong style={{ display: 'block', fontSize: '16px', marginBottom: '5px' }}>{route.source?.code} → {route.destination?.code}</strong>
                   <span style={{ fontSize: '13px' }}>Dep: {route.departureTime} | Arr: {route.arrivalTime}</span>
                 </button>
              ))}
            </div>
          </div>

          {points.length > 2 && (
            <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}><FaPlaneDeparture /> Boarding From</label>
                <select
                  value={boardingPoint?.code || ''}
                  onChange={(e) => {
                    const point = points.find(p => p.code === e.target.value);
                    setBoardingPoint(point);
                    const bIdx = points.findIndex(p => p.code === point.code);
                    const dIdx = points.findIndex(p => p.code === dropPoint?.code);
                    if (dIdx <= bIdx) setDropPoint(points[points.length - 1]);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', backgroundColor: '#fff' }}
                >
                  {points.slice(0, points.length - 1).map((point, index) => (
                    <option key={`boarding-${getPointKey(point)}-${index}`} value={point.code}>{point.name} ({point.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}><FaPlaneArrival /> Drop At</label>
                <select
                  value={dropPoint?.code || ''}
                  onChange={(e) => {
                    const point = points.find(p => p.code === e.target.value);
                    setDropPoint(point);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', backgroundColor: '#fff' }}
                >
                  {points.slice(boardingIndex + 1).map((point, index) => (
                    <option key={`drop-${getPointKey(point)}-${index}`} value={point.code}>{point.name} ({point.code})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ margin: '0 0 15px', color: '#333' }}>2. Select Cabin Class</h4>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {flight.classes?.map((cls) => (
                <button
                  key={cls.className}
                  onClick={() => {
                    setSelectedClass(cls);
                    setSelectedSeats([]);
                  }}
                  style={{
                    flex: '1', minWidth: '150px', padding: '15px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                    background: selectedClass?.className === cls.className ? '#fff0f0' : '#fff',
                    border: selectedClass?.className === cls.className ? '2px solid #ff5a5f' : '2px solid #ddd',
                    color: selectedClass?.className === cls.className ? '#ff5a5f' : '#555',
                    transition: 'all 0.2s', fontWeight: 'bold'
                  }}
                >
                  <span style={{ display: 'block', fontSize: '18px', marginBottom: '5px' }}>{cls.className}</span>
                  <span style={{ fontSize: '14px', color: '#888' }}>₹{cls.price}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedRoute && selectedClass && (
            <div style={{ borderTop: '2px dashed #eee', paddingTop: '30px' }}>
              
              {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                <div style={{ marginBottom: '20px', background: '#fff8e1', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
                  <strong style={{ color: '#d68910', display: 'block', marginBottom: '8px' }}><FaMapMarkerAlt /> Layovers / Stops:</strong>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {selectedRoute.stops.map(s => `${s.name} (${s.code}) [Arr: ${s.arrivalTime}, Dep: ${s.departureTime}]`).join(' → ')}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: '2', minWidth: '300px' }}>
                  <h4 style={{ margin: '0 0 15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><FaChair /> 3. Select Seats</h4>
                  
                  <div className="flight-cabin-shell" style={{ padding: '30px', background: '#f0f2f5', borderRadius: '12px', border: '1px solid #ddd', minHeight: '300px' }}>
                    <div className="flight-seat-map" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                      {Array.from({ length: seatsInCabin }).map((_, idx) => {       
                        const seatNum = `${String.fromCharCode(65 + (idx % 6))}${Math.floor(idx / 6) + 1}`;
                        const isBooked = bookedSeats.includes(seatNum);
                        const isSelected = selectedSeats.includes(seatNum);
                        
                        // Create an aisle layout gap after 3rd seat column
                        const isAisle = (idx % 6) === 2;

                        return (
                          <React.Fragment key={seatNum}>
                            <button
                              className={`flight-seat ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                              onClick={() => !isBooked && toggleSeat(seatNum)}        
                              style={{
                                padding: '10px 0',
                                backgroundColor: isBooked ? '#dbe2e8' : isSelected ? '#1e3c72' : '#fff',
                                color: isBooked ? '#999' : isSelected ? '#fff' : '#555',
                                border: isBooked ? '1px solid #cfd8dc' : isSelected ? '1px solid #1e3c72' : '1px solid #bbb',
                                borderRadius: '4px', cursor: isBooked ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold', fontSize: '12px', transition: 'all 0.2s',
                              }}
                              disabled={isBooked}
                              title={`Seat ${seatNum}`}
                            >
                              {seatNum}
                            </button>
                            {isAisle && <div key={`aisle-${seatNum}`} style={{ width: '15px' }}></div>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: '#666' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 15, height: 15, background: '#1e3c72', borderRadius: 3 }}></div> Selected</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 15, height: 15, background: '#fff', border: '1px solid #bbb', borderRadius: 3 }}></div> Available</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 15, height: 15, background: '#dbe2e8', border: '1px solid #cfd8dc', borderRadius: 3 }}></div> Booked</span>
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
                    <h4 style={{ margin: '0 0 20px', color: '#1e3c72', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Booking Summary</h4>
                    
                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '14px' }}>
                      <span>Class</span>
                      <strong style={{ color: '#333' }}>{selectedClass.className}</strong>
                    </div>
                    
                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '14px' }}>
                      <span>Price per Seat</span>
                      <strong style={{ color: '#333' }}>₹{selectedClass.price}</strong>
                    </div>

                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '14px' }}>
                      <span>Selected Seats</span>
                      <strong style={{ color: '#333', textAlign: 'right' }}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</strong>
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>Total Fare</span>
                      <strong style={{ fontSize: '24px', color: '#ff5a5f' }}>₹{totalAmount}</strong>
                    </div>

                    <button
                      onClick={handleProceed}
                      disabled={selectedSeats.length === 0}
                      style={{ 
                        width: '100%', marginTop: '25px', padding: '15px', fontSize: '16px', 
                        background: selectedSeats.length === 0 ? '#ccc' : '#ff5a5f', 
                        color: '#fff', border: 'none', borderRadius: '8px', 
                        cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold', transition: 'background 0.3s'
                      }}
                      onMouseOver={(e) => { if (selectedSeats.length > 0) e.target.style.background = '#e0484d' }}
                      onMouseOut={(e) => { if (selectedSeats.length > 0) e.target.style.background = '#ff5a5f' }}
                    >
                      Proceed with {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlightDetails;



