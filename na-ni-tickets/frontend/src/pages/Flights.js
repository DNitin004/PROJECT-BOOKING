import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { FaPlane } from 'react-icons/fa';
import { applyImageFallback, getImage } from '../utils/imageFallbacks';

function Flights() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceCity, setSourceCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [airports, setAirports] = useState([]);

  const loadAirports = async () => {
    try {
      const res = await itemsAPI.getFlightAirports();
      if (res.data && res.data.airports) {
        setAirports(res.data.airports);
      }
    } catch (error) {
      console.error('Failed to load airports', error);
    }
  };

  const loadFlights = async (searchParams={}) => {
    try {
      setLoading(true);
      const res = await itemsAPI.getFlights(searchParams);
      setFlights(res.data.flights || []);
    } catch (error) {
      toast.error('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  // Load initial set
  useEffect(() => {
    loadFlights();
    loadAirports();
  }, []);

  const handleSearch = () => {
    let source = sourceCity;
    let dest = destCity;
    
    const sMatch = sourceCity.match(/\((.*?)\)$/);
    const dMatch = destCity.match(/\((.*?)\)$/);
    
    if (sMatch) source = sMatch[1];
    if (dMatch) dest = dMatch[1];
    
    loadFlights({ source, destination: dest });
  };

  return (
    <div className="flights-hero-page" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
      
      {/* Hero Header Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
        color: 'white', 
        padding: '60px 20px', 
        textAlign: 'center',
        paddingBottom: '100px'
       }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <FaPlane style={{ transform: 'rotate(-45deg)' }} /> Global Flight Bookings
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Seamless booking experience with real-time stops, classes, and cabin maps.</p>
      </div>

      <div className="container" style={{ marginTop: '-60px' }}>
      
        {/* Search Bar UI */}
        <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '15px', 
            marginBottom: '40px', 
            justifyContent: 'center', 
            background: '#fff', 
            padding: '25px', 
            borderRadius: '12px', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)' 
          }}>
           <datalist id="airports-list">
             {airports.map(airport => <option key={airport} value={airport} />)}
           </datalist>
           <div style={{ flex: '1', minWidth: '200px' }}>
             <label style={{ display: 'block', fontSize: '12px', color: '#777', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>From</label>
             <input 
               type="text" 
               list="airports-list"
               placeholder="Eg. Delhi, Mumbai, BLR" 
               value={sourceCity} 
               onChange={e => setSourceCity(e.target.value)}
               style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#fbfbfb' }}
             />
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '20px', paddingLeft: '10px', paddingRight: '10px' }}>
              <span style={{ color: '#ccc', fontSize: '20px' }}>⇄</span>
           </div>

           <div style={{ flex: '1', minWidth: '200px' }}>
             <label style={{ display: 'block', fontSize: '12px', color: '#777', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>To</label>
             <input 
               type="text" 
               list="airports-list"
               placeholder="Eg. Chennai, CCU" 
               value={destCity} 
               onChange={e => setDestCity(e.target.value)}
               style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#fbfbfb' }}
             />
           </div>

           <div style={{ display: 'flex', alignItems: 'flex-end', flex: '0.5', minWidth: '150px' }}>
             <button 
               onClick={handleSearch} 
               style={{ width: '100%', padding: '14px 30px', background: '#ff5a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.3s' }}
               onMouseOver={(e) => e.target.style.background = '#e0484d'}
               onMouseOut={(e) => e.target.style.background = '#ff5a5f'}
             >
               Search Flights
             </button>
           </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', margin:'50px 0' }}><div className="spinner" style={{ margin: '0 auto 20px', borderColor: '#1e3c72', borderTopColor: 'transparent', borderWidth: '4px', width: '40px', height: '40px' }}></div><p style={{ color: '#666', fontSize: '18px' }}>Scanning skies for you...</p></div>
        ) : flights.length ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {flights.map((flight, fIdx) => (
              <div key={flight._id || `flight-${fIdx}`} style={{ background: '#fff', borderRadius: '12px', padding: '25px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #eee' }}>
                
                {/* Airline Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '200px' }}>
                  <img
                    src={getImage(flight.airline?.logoUrl, 'airline')}
                    alt={flight.airline?.name}
                    style={{ width: '54px', height: '54px', objectFit: 'cover', background: '#f5f5f5', borderRadius: '50%', padding: '3px' }}
                    onError={(event) => applyImageFallback(event, 'airline')}
                  />
                  <div>
                    <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>{flight.airline?.name || 'Airline'}</h3>
                    <p style={{ margin: '2px 0 0', color: '#888', fontSize: '13px' }}>{flight.flightNumber} • {flight.aircraftType}</p>
                  </div>
                </div>

                {/* Route Info & Price Button per Route */}
                <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(flight.routes || []).map((route, rIdx) => (
                      <div key={route._id || `route-${fIdx}-${rIdx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', flexWrap: 'wrap', gap: '15px' }}>
                        
                        <div style={{ display: 'flex', flex: '1', alignItems: 'center' }}>
                          <div style={{ textAlign: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>{route.departureTime}</h2>
                            <p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: 'bold' }}>{route.source?.code}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{route.source?.name}</p>
                          </div>

                          <div style={{ flex: '1', margin: '0 20px', textAlign: 'center', position: 'relative' }}>
                             <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#666', fontWeight: '600' }}>{route.journeyDuration}</p>
                             <div style={{ height: '2px', background: '#e0e0e0', position: 'relative', width: '100%' }}>
                                <FaPlane style={{ position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)', color: '#ccc', backgroundColor: '#fff', padding: '0 5px' }} />
                             </div>
                             {route.stops && route.stops.length > 0 ? (
                               <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#e67e22', fontWeight: 'bold' }}>{route.stops.length} Stop(s) • {route.stops.map(s => s.code).join(', ')}</p>
                             ) : (
                               <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#27ae60', fontWeight: 'bold' }}>Non-stop</p>
                             )}
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>{route.arrivalTime}</h2>
                            <p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: 'bold' }}>{route.destination?.code}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{route.destination?.name}</p>
                          </div>
                        </div>

                        {/* Price & Action (per route context) */}
                        <div style={{ textAlign: 'right', minWidth: '150px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                           <p style={{ margin: '0 0 5px', color: '#777', fontSize: '13px' }}>Starts from</p>
                           <h2 style={{ margin: '0 0 15px', color: '#1e3c72', fontSize: '24px' }}>₹{flight.classes?.[0]?.price || 'N/A'}</h2>
                           <button 
                             onClick={() => navigate(`/flights/${flight._id}`)}
                             style={{ padding: '10px 20px', background: '#1e3c72', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.3s' }}
                             onMouseOver={(e) => e.target.style.background = '#2a5298'}
                             onMouseOut={(e) => e.target.style.background = '#1e3c72'}
                           >
                             Select Seats
                           </button>
                        </div>
                      </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <FaPlane style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }} />
            <h2 style={{ color: '#555' }}>No flights found matching your criteria</h2>
            <p style={{ color: '#888' }}>Try searching for a different route or layover city.</p>
            <button onClick={() => { setSourceCity(''); setDestCity(''); loadFlights(); }} style={{ marginTop: '20px', padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Flights;
