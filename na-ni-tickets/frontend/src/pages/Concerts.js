import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Items.css';
import { FaMusic, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';

function Concerts() {
  const navigate = useNavigate();
  const [concerts, setConcerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      setIsLoading(true);
      const response = await itemsAPI.getConcerts();
      setConcerts(response.data.concerts || []);
    } catch (error) {
      toast.error('Failed to fetch concerts');
      setConcerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      await api.post('/items/seed-all');
      toast.success('Database seeded with sample data!');
      fetchConcerts();
    } catch (error) {
      toast.error('Failed to seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="items-page">
      <div className="page-header">
        <h1><FaMusic /> Concert Tickets</h1>
        <p>Select concert and guest artists, then book OAT category tickets</p>
      </div>

      <div className="container">
        {concerts.length === 0 && !isLoading && (
          <div style={{ marginBottom: 16 }}>
            <button 
              className="btn-primary" 
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              style={{ padding: '10px 20px', fontSize: '16px' }}
            >
              {isSeeding ? 'Seeding...' : '📥 Seed Database with Sample Data'}
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading concerts...</p>
          </div>
        ) : concerts.length > 0 ? (
          <div className="items-grid">
            {concerts.map((concert) => (
              <div key={concert._id} className="item-card concert-card">
                <div className="item-image" style={{ backgroundColor: '#e0e0e0', backgroundImage: `url(${concert.posterUrl || 'about:blank'})` }}>
                  <img src={concert.posterUrl} alt={concert.name} style={concert.posterUrl ? {} : { display: 'none' }} />
                  {!concert.posterUrl && <div className="placeholder-text">{concert.name}</div>}
                  <div className="overlay">
                    <button className="btn-book" onClick={() => navigate(`/concerts/${concert._id}`)}>Book Now</button>
                  </div>
                </div>
                <div className="item-info">
                  <h3>{concert.name}</h3>
                  <div className="artists">
                    {(concert.artists || []).map((artist) => (
                      <span key={artist.name}>{artist.name}</span>
                    ))}
                  </div>
                  <div className="concert-meta">
                    <p><FaCalendar /> {new Date(concert.date).toLocaleDateString()}</p>
                    <p><FaMapMarkerAlt /> {concert.venue?.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>No concerts available at the moment</p>
            <button 
              className="btn-primary"
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              style={{ marginTop: '16px', padding: '10px 20px', fontSize: '16px' }}
            >
              {isSeeding ? 'Seeding...' : '📥 Load Sample Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Concerts;
