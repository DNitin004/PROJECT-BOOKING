import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import MiniTheater from '../components/MiniTheater';
import { bookingsAPI, itemsAPI } from '../services/api';
import { useAuthStore } from '../store/store';
import './MovieDetails.css';

function EventTicketsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const state = location.state || {};

  const [concert, setConcert] = useState(state.concert || null);
  const [category, setCategory] = useState(state.category || null);
  const [isLoading, setIsLoading] = useState(!state.concert);
  const [error, setError] = useState('');

  useEffect(() => {
    if (concert) return;

    const fetchConcert = async () => {
      try {
        setIsLoading(true);
        const res = await itemsAPI.getConcertDetails(id);
        const fetchedConcert = res.data.concert || res.data;
        setConcert(fetchedConcert);
        setCategory(state.category || fetchedConcert?.ticketCategories?.[0] || null);
        if (!state.category && fetchedConcert?.ticketCategories?.length > 0) {
          toast.info('Selected the first available ticket category. You can change it on the event page.');
        }
      } catch (err) {
        setError('Unable to load event details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcert();
  }, [concert, id, state.category]);

  if (isLoading) {
    return <div className="movie-details-empty">Loading event ticket options...</div>;
  }

  if (error) {
    return <div className="movie-details-empty">{error}</div>;
  }

  if (!concert || !category) {
    return (
      <div className="movie-details-empty">
        Missing booking details or ticket category. Please go back to the event page and select a category.
      </div>
    );
  }

  const handleConfirmSeats = async (seats) => {
    if (!seats || seats.length === 0) {
      toast.warn('Select at least one ticket');
      return;
    }

    try {
      const payload = {
        concertId: id,
        category: category.name,
        seats,
        travelerDetails: [{ name: user?.firstName || user?.name || 'Guest' }],
      };

      const res = await bookingsAPI.bookConcert(payload);
      toast.success('Seats reserved successfully! Proceeding to payment...');
      navigate('/payment', {
        state: {
          bookingId: res.data.booking.bookingId,
          amount: res.data.booking.totalAmount,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    }
  };

  // Determine grid dimensions from capacity
  const capacity = Math.min(category.totalSeats || 100, 40); // Limit to 40 seats max
  const cols = 8;
  const rows = Math.ceil(capacity / cols);
  
  // Format booked seats. The `seats` array usually holds exact IDs. If your backend doesn't store exact ID strings, 
  // it might just increment bookedSeats count. Let's assume booked array isn't natively populated with strings yet if it's missing.
  // Using an empty array here ensures visual functionality, although true lock-out requires backend seat arrays.
  const booked = category.bookedSeatsArr || []; // If your schema supports an array array of seat IDs

  return (
    <div className="movie-details-page">
      <div className="header-info" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>{concert.name}</h2>
        <p style={{ color: '#666' }}>{concert.venue?.name} • Category: {category.name}</p>
        <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>Rs {category.price} / Ticket</p>
      </div>

      <div className="theatre-layout">
        <MiniTheater
          rows={rows}
          cols={cols}
          capacity={capacity}
          price={category.price}
          booked={booked}
          onConfirm={handleConfirmSeats}
        />
      </div>
    </div>
  );
}

export default EventTicketsPage;
