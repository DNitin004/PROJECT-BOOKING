import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { FaBus, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

function Buses() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getBuses();
        setBuses(res.data.buses || []);
      } catch (error) {
        toast.error('Failed to load buses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="items-page">
      <div className="page-header">
        <h1><FaBus /> Bus Tickets</h1>
        <p>RedBus style bus selection with bus-shaped seat booking</p>
      </div>
      <div className="container">
        {loading ? (
          <div className="loading"><div className="spinner"></div><p>Loading buses...</p></div>
        ) : buses.length ? (
          <div className="list-cards">
            {buses.map((bus) => (
              <div key={bus._id} className="list-card">
                <h3>{bus.busName} ({bus.busNumber})</h3>
                <p>{bus.operatorName} | {bus.busType}</p>
                {(bus.routes || []).map((route) => (
                  <div key={route._id} className="route-row">
                    <div>
                      <p><FaMapMarkerAlt /> {route.source?.name} to {route.destination?.name}</p>
                      <p><FaClock /> {route.departureTime} - {route.arrivalTime}</p>
                    </div>
                    <div>
                      <strong>Rs {route.fare}</strong>
                      <button className="btn-primary" onClick={() => navigate(`/buses/${bus._id}`)}>Select Seats</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data"><p>No buses available</p></div>
        )}
      </div>
    </div>
  );
}

export default Buses;
