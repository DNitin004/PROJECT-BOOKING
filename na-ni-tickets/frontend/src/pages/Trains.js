import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Items.css';
import { FaTrain } from 'react-icons/fa';

function Trains() {
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getTrains();
        setTrains(res.data.trains || []);
      } catch (error) {
        toast.error('Failed to load trains');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const journeyDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="items-page">
      <div className="page-header">
        <h1><FaTrain /> Train Tickets</h1>
        <p>IRCTC style train list with train coach seat view</p>
      </div>
      <div className="container">
        {loading ? (
          <div className="loading"><div className="spinner"></div><p>Loading trains...</p></div>
        ) : trains.length ? (
          <div className="list-cards">
            {trains.map((train) => (
              <div key={train._id} className="list-card">
                <h3>{train.trainName} ({train.trainNumber})</h3>
                <p>Runs: {(train.runningDays || []).join(', ')}</p>
                <button className="btn-primary" onClick={() => navigate(`/trains/${train._id}`)}>Choose Coach Seats</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data"><p>No trains available</p></div>
        )}
      </div>
    </div>
  );
}

export default Trains;
