import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { FaPlane } from 'react-icons/fa';

function Flights() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getFlights();
        setFlights(res.data.flights || []);
      } catch (error) {
        toast.error('Failed to load flights');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="items-page">
      <div className="page-header">
        <h1><FaPlane /> Flight Tickets</h1>
        <p>Airline style booking with plane cabin seat map</p>
      </div>
      <div className="container">
        {loading ? (
          <div className="loading"><div className="spinner"></div><p>Loading flights...</p></div>
        ) : flights.length ? (
          <div className="list-cards">
            {flights.map((flight) => (
              <div key={flight._id} className="list-card">
                <h3>{flight.airline?.name || 'Airline'} ({flight.flightNumber})</h3>
                {(flight.routes || []).map((route) => (
                  <div key={route._id} className="route-row">
                    <div>
                      <p>{route.source?.code} to {route.destination?.code}</p>
                      <p>{route.departureTime} - {route.arrivalTime}</p>
                    </div>
                    <div>
                      <button className="btn-primary" onClick={() => navigate(`/flights/${flight._id}`)}>Book Seats</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data"><p>No flights available</p></div>
        )}
      </div>
    </div>
  );
}

export default Flights;
