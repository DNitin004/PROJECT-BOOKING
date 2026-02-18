import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MiniTheater from '../components/MiniTheater';
import { itemsAPI, bookingsAPI } from '../services/api';
import { useAuthStore } from '../store/store';
import './Booking.css';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [movie, setMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowIdx, setSelectedShowIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getMovieDetails(id);
        const movieData = res.data.movie;
        setMovie(movieData);
        if (movieData?.shows?.length) {
          setSelectedShow(movieData.shows[0]);
          setSelectedShowIdx(0);
        }
      } catch (err) {
        toast.error('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleShowSelect = (show, index) => {
    console.log('Show selected:', show, 'Index:', index);
    setSelectedShow(show);
    setSelectedShowIdx(index);
  };

  const handleConfirm = async (seats) => {
    // Use selectedShowIdx to get the show directly from the movie.shows array
    // This avoids async state update issues
    if (!movie?.shows || selectedShowIdx < 0 || selectedShowIdx >= movie.shows.length) {
      toast.warn('Please select a show timing');
      return;
    }

    const selectedShow = movie.shows[selectedShowIdx];
    console.log('Confirming booking with show:', selectedShow);
    
    if (!selectedShow) {
      toast.warn('Invalid show timing selected');
      return;
    }

    // Use _id if available, it should always be there for MongoDB subdocuments
    const showId = selectedShow._id;
    if (!showId) {
      // Fallback: if no _id, the server might have a custom identifier
      console.warn('Show object missing _id field:', selectedShow);
      toast.warn('Show timing data is incomplete. Please refresh and try again.');
      return;
    }

    try {
      const payload = {
        movieId: id,
        showId: showId,
        seats,
        travelerDetails: [{ name: user?.firstName || user?.name || 'Guest' }],
      };

      console.log('Sending booking payload:', payload);
      const res = await bookingsAPI.bookMovie(payload);
      console.log('Booking response:', res.data);
      
      if (res.data.success) {
        toast.success('Movie seats reserved. Proceeding to payment...');
        navigate('/payment', {
          state: {
            bookingId: res.data.booking.bookingId,
            amount: res.data.booking.totalAmount,
            booking: res.data.booking,
          },
        });
      } else {
        toast.error(res.data.message || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unable to reserve seats';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div className="booking-page"><div className="container"><h2>Loading movie...</h2></div></div>;
  }

  if (!movie) {
    return <div className="booking-page"><div className="container"><h2>Movie not found</h2></div></div>;
  }

  return (
    <div className="booking-page">
      <div className="container">
        <h2>{movie.name}</h2>
        <p>{movie.description}</p>

        <h3 style={{ marginTop: 16 }}>Select Timing</h3>
        <div className="shows" style={{ marginBottom: 20 }}>
          {(!movie.shows || movie.shows.length === 0) ? (
            <p style={{ color: '#999' }}>No shows available for this movie</p>
          ) : (
            movie.shows.map((show, idx) => (
              <button
                key={`show-${idx}`}
                type="button"
                className={`show-time ${selectedShowIdx === idx ? 'selected-time' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleShowSelect(show, idx);
                }}
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              >
                {show.time} | {show.theater} | Rs {show.price}
              </button>
            ))
          )}
        </div>

        {selectedShow && (
          <MiniTheater
            rows={6}
            cols={8}
            booked={selectedShow.bookedSeats || []}
            price={selectedShow.price || 150}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}
