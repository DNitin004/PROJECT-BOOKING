import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';

function ConcertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [concert, setconcert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getConcertDetails(id);
        const concertData = res.data.concert;
        setconcert(concertData);
      } catch (err) {
        toast.error('Failed to load concert details');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) return <div className="booking-page"><div className="container"><h2>Loading event...</h2></div></div>;
  if (!concert) return <div className="booking-page"><div className="container"><h2>Event not found</h2></div></div>;

  return (
    <div className="booking-page">
      <div className="container">
        <h2>{concert.name}</h2>
        <p><strong>Guests:</strong> {(concert.artists || []).map((a) => a.name).join(', ') || 'TBA'}</p>
        <p><strong>Venue:</strong> {concert.venue?.name} | <strong>Date:</strong> {new Date(concert.date).toLocaleString()}</p>

        <div className="oat-layout">
          <div className="oat-stage">OAT STAGE</div>
          <div className="oat-tier tier-gold">Gold</div>
          <div className="oat-tier tier-premium">Premium</div>
          <div className="oat-tier tier-silver">Silver</div>
        </div>

        <h3>Choose Category</h3>
        <div className="category-grid">
          {(concert.ticketCategories || []).map((cat) => {
            const available = Math.max(0, (cat.totalSeats || 0) - (cat.bookedSeats || 0));
            return (
              <div key={cat.name} className="category-btn" style={{ cursor: 'default' }}>
                <strong>{cat.name}</strong>
                <span>Rs {cat.price}</span>
                <span style={{ marginBottom: '10px' }}>{available} seats left</span>
                
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '8px', fontSize: '14px', marginTop: 'auto' }}
                  onClick={() => navigate(`/concerts/${id}/tickets`, { state: { concert, category: cat } })}
                >
                  Select Seats
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ConcertDetails;
