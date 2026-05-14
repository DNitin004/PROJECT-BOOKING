import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import MiniTheater from '../components/MiniTheater';
import { itemsAPI, bookingsAPI } from '../services/api';
import { useAuthStore } from '../store/store';
import { applyImageFallback, getImage } from '../utils/imageFallbacks';
import './MovieDetails.css';

export default function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const passedCity = location.state?.selectedCity;

  const [movie, setMovie] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const normalizeCity = (cityValue = '') => cityValue.toString().trim().toLowerCase();

  const loadTheatresForCity = async (movieId, city) => {
    const response = await itemsAPI.getMovieTheatres(movieId, { city });
    const fetchedTheatres = response.data?.theatres || [];
    setTheatres(fetchedTheatres);

    const firstShow = fetchedTheatres[0]?.shows?.[0] || null;
    setSelectedShow(firstShow);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getMovieDetails(id);
        const movieData = res.data.movie;
        setMovie(movieData);

        if (movieData?.shows?.length) {
          const citiesSet = new Set(movieData.shows.map((show) => show.city).filter(Boolean));
          const sortedCities = Array.from(citiesSet).sort();
          setAvailableCities(sortedCities);

          const preferredCity = passedCity || localStorage.getItem('preferredCity') || '';
          const normalizedPreferred = normalizeCity(preferredCity);
          let defaultCity = '';

          if (normalizedPreferred) {
            const exact = sortedCities.find((city) => normalizeCity(city) === normalizedPreferred);
            const startsWith = sortedCities.find((city) => normalizeCity(city).startsWith(normalizedPreferred));
            defaultCity = exact || startsWith || '';
          }

          if (!defaultCity) {
            defaultCity = sortedCities.includes('Delhi') ? 'Delhi' : sortedCities[0];
          }

          setSelectedCity(defaultCity);
          await loadTheatresForCity(id, defaultCity);
        } else {
          setAvailableCities([]);
          setTheatres([]);
          setSelectedShow(null);
        }
      } catch (err) {
        toast.error('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, passedCity]);

  const handleCityChange = async (e) => {
    const city = e.target.value;
    setSelectedCity(city);

    try {
      await loadTheatresForCity(id, city);
    } catch (error) {
      toast.error('Failed to fetch theatre details for selected city');
    }
  };

  const handleShowSelect = (show) => {
    setSelectedShow(show);
  };

  const handleConfirm = async (seats) => {
    if (!selectedShow || !selectedShow._id) {
      toast.warn('Please select a show timing');
      return;
    }

    try {
      const payload = {
        movieId: id,
        showId: selectedShow._id,
        seats,
        travelerDetails: [{ name: user?.firstName || user?.name || 'Guest' }],
      };

      const res = await bookingsAPI.bookMovie(payload);

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
      const errorMsg = err.response?.data?.message || err.message || 'Unable to reserve seats';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div className="movie-details-loading">Loading movie details...</div>;
  }

  if (!movie) {
    return <div className="movie-details-empty">Movie not found</div>;
  }

  const dateTabs = ['Today', 'Tomorrow', 'Day 3'];

  return (
    <div className="movie-details-screen">
      <div className="movie-hero">
        <img
          src={getImage(movie.posterUrl, 'movieHero')}
          alt={movie.name}
          onError={(event) => applyImageFallback(event, 'movieHero')}
        />
        <div className="movie-hero-overlay" />
        <div className="movie-hero-content">
          <h1 className="movie-hero-title">{movie.name}</h1>
          <div className="movie-hero-sub">
            {(movie.genre || []).join(' • ')} • {movie.language} • {movie.duration} min
          </div>
        </div>
      </div>

      <div className="movie-date-row">
        {dateTabs.map((tab, index) => (
          <button
            key={tab}
            className={`movie-date-btn ${activeDateIndex === index ? 'active' : ''}`}
            onClick={() => setActiveDateIndex(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="movie-filter-row">
        <button className="movie-filter-chip">Filters</button>
        <button className="movie-filter-chip">Sort by</button>
        <button className="movie-filter-chip">After 5 PM</button>
        <button className="movie-filter-chip">Recliners</button>
      </div>

      <div className="movie-city-wrap">
        <select className="movie-city-select" value={selectedCity} onChange={handleCityChange}>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="theatre-list">
        {theatres.length === 0 && <div className="movie-details-empty">No theatres available in this city.</div>}

        {theatres.map((theatre, theatreIndex) => (
          <div key={`${theatre.theater}-${theatreIndex}`} className="theatre-card">
            <div className="theatre-name">{theatre.theater}</div>
            <div className="theatre-sub">
              {theatre.district ? `${theatre.district}, ` : ''}
              {theatre.city || selectedCity}
              {theatre.minPrice ? ` • Rs ${theatre.minPrice} onwards` : ''}
            </div>

            <div className="showtime-grid">
              {(theatre.shows || []).map((show) => {
                const isSelected = selectedShow?._id === show._id;
                return (
                  <button
                    key={show._id}
                    className={`showtime-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleShowSelect(show)}
                  >
                    <div>{show.time}</div>
                    <div className="showtime-price">Rs {show.price}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedShow && (
        <div className="mini-wrap">
          <MiniTheater
            rows={6}
            cols={8}
            booked={selectedShow.bookedSeats || []}
            price={selectedShow.price || 150}
            onConfirm={handleConfirm}
          />
        </div>
      )}
    </div>
  );
}
