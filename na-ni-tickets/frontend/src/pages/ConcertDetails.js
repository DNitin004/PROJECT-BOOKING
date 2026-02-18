import React, { useEffect, useState } from 'react';
import './Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/store';

function ConcertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [concert, setConcert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getConcertDetails(id);
        const concertData = res.data.concert;
        setConcert(concertData);
        if (concertData?.ticketCategories?.length) {
          setSelectedCategory(concertData.ticketCategories[0].name);
        }
      } catch (err) {
        toast.error('Failed to load concert details');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const selected = concert?.ticketCategories?.find((c) => c.name === selectedCategory);
  const total = (selected?.price || 0) * quantity;

  const handleBook = async () => {
    if (!selectedCategory) return toast.warn('Select ticket category');

    try {
      const seats = Array.from({ length: quantity }).map((_, i) => `${selectedCategory}-${Date.now()}-${i + 1}`);
      const payload = {
        concertId: id,
        category: selectedCategory,
        seats,
        travelerDetails: [{ name: user?.firstName || user?.name || 'Guest' }],
      };

      const res = await bookingsAPI.bookConcert(payload);
      toast.success('Concert booking created. Proceeding to payment...');
      navigate('/payment', {
        state: {
          bookingId: res.data.booking.bookingId,
          amount: res.data.booking.totalAmount,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create concert booking');
    }
  };

  if (isLoading) return <div className="booking-page"><div className="container"><h2>Loading concert...</h2></div></div>;
  if (!concert) return <div className="booking-page"><div className="container"><h2>Concert not found</h2></div></div>;

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
              <button key={cat.name} className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.name)}>
                <strong>{cat.name}</strong>
                <span>Rs {cat.price}</span>
                <span>{available} seats left</span>
              </button>
            );
          })}
        </div>

        <div className="qty-row">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)}>+</button>
        </div>

        <div style={{ marginTop: 16 }}>
          <strong>Total: Rs {total}</strong>
        </div>
        <button className="btn-primary" style={{ marginTop: 12 }} onClick={handleBook}>Proceed to Payment</button>
      </div>
    </div>
  );
}

export default ConcertDetails;
