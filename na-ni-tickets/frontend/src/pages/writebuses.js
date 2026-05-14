const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { FaBus, FaMapMarkerAlt, FaClock, FaExchangeAlt, FaRoute, FaArrowRight } from 'react-icons/fa';

function Buses() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    if (!fromCity || !toCity) {
      return toast.warning('Please enter both From and To cities');
    }
    
    setHasSearched(true);
    setLoading(true);
    
    try {
      const res = await itemsAPI.getBuses({ source: fromCity, destination: toCity });
      setBuses(res.data.buses || []);
    } catch (error) {
      toast.error('Failed to find buses');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  return (
    <div style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* RedBus Style Header Search */}
      <div style={{ background: '#d84e55', padding: '60px 20px', color: '#fff', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <FaBus /> Intercity Bus Bookings
        </h1>
        <p style={{ margin: '0 0 30px', opacity: 0.9 }}>Book connecting routes across India's largest bus network</p>

        <form onSubmit={handleSearch} style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '10px', background: '#fff', borderRadius: '8px', padding: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f5f5f5', padding: '10px 15px', borderRadius: '6px' }}>
            <FaMapMarkerAlt color="#888" style={{ marginRight: '10px' }} />
            <input 
              type="text"
              placeholder="From (City or Stop)" 
              value={fromCity} 
              onChange={e => setFromCity(e.target.value)} 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' }}
              required 
            />
          </div>

          <button type="button" onClick={handleSwap} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#d84e55', fontSize: '20px' }}>
            <FaExchangeAlt />
          </button>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f5f5f5', padding: '10px 15px', borderRadius: '6px' }}>
            <FaMapMarkerAlt color="#888" style={{ marginRight: '10px' }} />
            <input 
              type="text"
              placeholder="To (City or Stop)" 
              value={toCity} 
              onChange={e => setToCity(e.target.value)} 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' }}
              required 
            />
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f5f5f5', padding: '10px 15px', borderRadius: '6px' }}>
            <input 
              type="date"
              value={date} 
              onChange={e => setDate(e.target.value)} 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' }} 
            />
          </div>

          <button type="submit" style={{ background: '#d84e55', color: '#fff', border: 'none', padding: '0 30px', fontSize: '18px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>
            Search Buses
          </button>
        </form>
      </div>

      {!hasSearched ? (
         <div style={{ textAlign: 'center', margin: '80px 20px', color: '#666' }}>
           <h2>Enter source and destination to explore buses</h2>
           <p>We serve thousands of intermediate stops generated from the Pan-India routes database!</p>
           <br/>
           <p><strong>E.g. Try searching "Sattur" to "Chennai"</strong></p>
         </div>
      ) : (
        <div className="container" style={{ maxWidth: '1000px', margin: '40px auto 0' }}>
          <h2>{buses.length} Buses Found</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', margin: '50px 0' }}><div className="spinner" style={{ margin: '0 auto', borderColor: '#d84e55', borderTopColor: 'transparent' }}></div><br/>Searching...</div>
          ) : buses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {buses.map((bus) => (
                <div key={bus._id} style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px', color: '#222' }}>{bus.operatorName}</h3>
                      <p style={{ margin: 0, color: '#777', fontSize: '14px' }}>{bus.busType} | {bus.busName} | {bus.totalSeats} Seats</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <span style={{ display: 'inline-block', background: '#38b87c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>⭐ 4.5 Ratings</span>
                    </div>
                  </div>

                  {(bus.routes || []).map((route) => (
                    <div key={route._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                           {route.departureTime} <FaArrowRight style={{ fontSize: '14px', margin: '0 15px', color: '#ccc' }}/> {route.arrivalTime}
                        </h2>
                        <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <FaMapMarkerAlt color="#d84e55"/> <strong>{route.source?.name}</strong> to <strong>{route.destination?.name}</strong> <span style={{ color: '#aaa' }}>|</span> <FaClock /> {route.journeyDuration}
                        </p>
                        
                        {route.stops && route.stops.length > 2 && (
                          <div style={{ marginTop: '15px', borderLeft: '3px solid #d84e55', paddingLeft: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#555', fontWeight: 'bold' }}><FaRoute color="#d84e55" style={{marginRight: '5px'}}/> Intermediary Stops:</span>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px', lineHeight: '1.4' }}>
                               {route.stops.join(' → ')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h2 style={{ margin: 0, color: '#222' }}>₹ {route.fare}</h2>
                        <button 
                          style={{ background: '#d84e55', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => navigate(\`/buses/\${bus._id}\`)}
                        >
                          View Seats
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
               <h3>Oops! No buses found for {fromCity} to {toCity}.</h3>
               <p>Try different cities or intermediate stops (e.g. Sattur, Chennai, Bangalore)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Buses;
`;

fs.writeFileSync('c:/Users/nithi/OneDrive/Desktop/PROJECT-BOOKING/na-ni-tickets/frontend/src/pages/Buses.js', code, 'utf8');
