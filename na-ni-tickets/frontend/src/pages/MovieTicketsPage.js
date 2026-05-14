import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaArrowRight,
  FaChair,
  FaClock,
  FaCrown,
  FaLock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaStar,
  FaTicketAlt,
  FaUsers,
} from 'react-icons/fa';
import MiniTheater from '../components/MiniTheater';
import { bookingsAPI, itemsAPI } from '../services/api';
import './MovieDetails.css';

const getMovieTitle = (movie) =>
  movie?.title || movie?.name || movie?.movieName || 'Selected movie';

const getMoviePoster = (movie) =>
  movie?.poster ||
  movie?.posterUrl ||
  movie?.image ||
  movie?.imageUrl ||
  movie?.thumbnail ||
  '';

const formatTime = (value) => {
  if (!value) {
    return 'Time TBA';
  }

  const raw = String(value);

  if (!raw.includes(':')) {
    return raw;
  }

  const [hoursValue = '0', minutesValue = '00'] = raw.split(':');
  const hours = Number(hoursValue);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutesValue).slice(0, 2)} ${suffix}`;
};

const getSeatsArray = (bookingLike) => {
  if (!bookingLike) {
    return [];
  }

  const seats =
    bookingLike.selectedSeats ||
    bookingLike.seats ||
    bookingLike.seatNumbers ||
    bookingLike.seatLabels ||
    [];

  return Array.isArray(seats) ? seats : [];
};

const MovieTicketsPage = () => {
  const { id, city } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialMovie = location.state?.movie || null;
  const initialTheatre = location.state?.theatre || null;
  const initialShow = location.state?.show || null;

  const [movie, setMovie] = useState(initialMovie);
  const [theatre, setTheatre] = useState(initialTheatre);
  const [show, setShow] = useState(initialShow);
  const [draftSeats, setDraftSeats] = useState([]);
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [refreshingLiveData, setRefreshingLiveData] = useState(false);
  const [bookingNow, setBookingNow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const refreshLiveShow = async () => {
      if (!city || !id || !initialTheatre?._id || !initialShow?._id) {
        return;
      }

      setRefreshingLiveData(true);

      try {
        const [movieResponse, theatresResponse] = await Promise.all([
          initialMovie ? Promise.resolve({ movie: initialMovie }) : itemsAPI.getMovieDetails(id),
          itemsAPI.getMovieTheatres(id, { city }),
        ]);

        const latestMovie = movieResponse?.movie || movieResponse?.data?.movie || movie;
        const theatreList = theatresResponse?.theatres || theatresResponse?.data?.theatres || [];
        const matchedTheatre = theatreList.find((entry) => entry?._id === initialTheatre?._id);
        const matchedShow = (matchedTheatre?.shows || matchedTheatre?.showtimes || []).find(
          (entry) => entry?._id === initialShow?._id || entry?.showId === initialShow?._id
        );

        if (isMounted) {
          if (latestMovie) {
            setMovie(latestMovie);
          }
          if (matchedTheatre) {
            setTheatre(matchedTheatre);
          }
          if (matchedShow) {
            setShow(matchedShow);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || '');
        }
      } finally {
        if (isMounted) {
          setRefreshingLiveData(false);
        }
      }
    };

    refreshLiveShow();

    return () => {
      isMounted = false;
    };
  }, [city, id, initialMovie, initialShow?._id, initialTheatre?._id, movie, refreshSeed]);

  const bookedSeats = useMemo(() => {
    const seats = getSeatsArray(show);
    return seats.length ? seats : Array.isArray(show?.bookedSeats) ? show.bookedSeats : [];
  }, [show]);

  const seatPrice = Number(show?.price || 0);
  const totalSeats = Number(show?.totalSeats || theatre?.capacity || 0);
  const seatsLeft = Math.max(totalSeats - bookedSeats.length, 0);
  const occupancy = totalSeats ? Math.round((bookedSeats.length / totalSeats) * 100) : 0;
  const totalAmount = draftSeats.length * seatPrice;

  const handleConfirmSeats = async (selectedSeats) => {
    if (!movie || !theatre || !show) {
      return;
    }

    setBookingNow(true);
    setError('');

    const payload = {
      bookingType: 'movie',
      type: 'movie',
      itemType: 'movie',
      itemId: movie?._id,
      itemName: getMovieTitle(movie),
      movieId: movie?._id,
      movieName: getMovieTitle(movie),
      title: getMovieTitle(movie),
      theatreId: theatre?._id,
      theatreName: theatre?.name || theatre?.theatreName,
      venue: theatre?.name || theatre?.theatreName,
      city,
      showId: show?._id || show?.showId,
      showTime: show?.time,
      time: show?.time,
      selectedSeats,
      seats: selectedSeats,
      seatNumbers: selectedSeats,
      seatCount: selectedSeats.length,
      numberOfSeats: selectedSeats.length,
      price: seatPrice,
      pricePerSeat: seatPrice,
      amount: totalAmount || selectedSeats.length * seatPrice,
      totalAmount: totalAmount || selectedSeats.length * seatPrice,
      totalPrice: totalAmount || selectedSeats.length * seatPrice,
    };

    try {
      const response = await bookingsAPI.bookMovie(payload);
      const createdBooking =
        response?.booking ||
        response?.data?.booking ||
        response?.data ||
        payload;

      navigate('/payment', {
        state: {
          booking: createdBooking,
          bookingData: createdBooking,
          movie,
          theatre,
          show,
          city,
          selectedSeats,
          totalAmount: payload.totalAmount,
          pricePerSeat: seatPrice,
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'We could not reserve those seats. Please refresh the seat map and try again.'
      );
    } finally {
      setBookingNow(false);
    }
  };

  if (!initialMovie || !initialTheatre || !initialShow) {
    return (
      <div className="movie-page-shell premium-page-shell">
        <div className="movie-page-content">
          <div className="premium-recovery-card">
            <span className="premium-badge">
              <FaLock />
              Seat selection requires a showtime
            </span>
            <h1>Your seat map needs a theatre and showtime to continue</h1>
            <p>
              It looks like this page was opened without the required movie selection
              context. Return to the theatre listings and choose a showtime again.
            </p>
            <div className="premium-recovery-card__actions">
              <button
                type="button"
                className="premium-primary-btn"
                onClick={() => navigate(`/movies/city/${city}/movie/${id}`)}
              >
                <FaArrowLeft />
                Back to theatres
              </button>
              <button type="button" className="premium-secondary-btn" onClick={() => navigate(-1)}>
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-page-shell premium-page-shell">
      <div className="movie-page-backdrop movie-page-backdrop--tickets" />

      <div className="movie-page-content movie-ticket-layout">
        <section className="movie-ticket-hero">
          <div className="movie-ticket-hero__left">
            {getMoviePoster(movie) ? (
              <img src={getMoviePoster(movie)} alt={getMovieTitle(movie)} className="movie-ticket-hero__poster" />
            ) : (
              <div className="movie-ticket-hero__poster movie-ticket-hero__poster--fallback">
                <FaTicketAlt />
              </div>
            )}

            <div className="movie-ticket-hero__copy">
              <span className="premium-badge">
                <FaCrown />
                Premium seat selection
              </span>

              <h1>{getMovieTitle(movie)}</h1>

              <p>
                Final step before checkout: review live availability, choose your exact
                seats, and continue to payment with confidence.
              </p>

              <div className="movie-ticket-hero__meta">
                <span>
                  <FaMapMarkerAlt />
                  {theatre?.name || theatre?.theatreName || 'Theatre'}, {city}
                </span>
                <span>
                  <FaClock />
                  {formatTime(show?.time)}
                </span>
                <span>
                  <FaStar />
                  ₹{seatPrice.toLocaleString()} per seat
                </span>
              </div>
            </div>
          </div>

          <div className="movie-ticket-hero__stats">
            <div className="ticket-stat-card">
              <span>Seats left</span>
              <strong>{seatsLeft}</strong>
              <small>Live inventory</small>
            </div>
            <div className="ticket-stat-card">
              <span>Reserved</span>
              <strong>{bookedSeats.length}</strong>
              <small>Already booked</small>
            </div>
            <div className="ticket-stat-card">
              <span>Occupancy</span>
              <strong>{occupancy}%</strong>
              <small>Current show load</small>
            </div>
          </div>
        </section>

        {error ? (
          <div className="premium-inline-alert">
            <FaShieldAlt />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="movie-ticket-main-grid">
          <div className="movie-ticket-main-grid__primary">
            <MiniTheater
              title="Choose your exact seats"
              variant="movie"
              capacity={Math.min(totalSeats || theatre?.capacity || 80, 40)}
              cols={8}
              rows={Math.ceil((Math.min(totalSeats || theatre?.capacity || 80, 40)) / 8)}
              booked={bookedSeats}
              price={seatPrice}
              onSelectionChange={setDraftSeats}
              onConfirm={handleConfirmSeats}
            />
          </div>

          <aside className="movie-ticket-summary">
            <div className="movie-ticket-summary__card">
              <span className="movie-ticket-summary__label">Booking snapshot</span>
              <h3>Your order summary</h3>

              <div className="movie-ticket-summary__list">
                <div>
                  <span>Movie</span>
                  <strong>{getMovieTitle(movie)}</strong>
                </div>
                <div>
                  <span>Theatre</span>
                  <strong>{theatre?.name || theatre?.theatreName || 'Theatre'}</strong>
                </div>
                <div>
                  <span>Showtime</span>
                  <strong>{formatTime(show?.time)}</strong>
                </div>
                <div>
                  <span>Selected seats</span>
                  <strong>{draftSeats.length ? draftSeats.join(', ') : 'Not selected yet'}</strong>
                </div>
                <div>
                  <span>Subtotal</span>
                  <strong>₹{totalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="movie-ticket-summary__confidence">
                <div>
                  <FaUsers />
                  <span>{seatsLeft} seats still open</span>
                </div>
                <div>
                  <FaChair />
                  <span>Real seat map with locked reserved seats</span>
                </div>
                <div>
                  <FaShieldAlt />
                  <span>Secure continuation to payment</span>
                </div>
              </div>

              <button
                type="button"
                className="premium-primary-btn movie-ticket-summary__refresh"
                onClick={() => setRefreshSeed((current) => current + 1)}
                disabled={refreshingLiveData || bookingNow}
              >
                {refreshingLiveData ? 'Refreshing seat map...' : 'Refresh live seat map'}
              </button>
            </div>

            <div className="movie-ticket-summary__card is-highlight">
              <span className="movie-ticket-summary__label">Pro tip</span>
              <h3>Best viewing zone</h3>
              <p>
                The center rows typically offer the most balanced viewing angle and
                audio experience. Premium rows fill fastest for popular shows.
              </p>
              <div className="movie-ticket-summary__tip">
                <FaArrowRight />
                {draftSeats.length
                  ? `Ready to continue with ${draftSeats.length} selected seat${draftSeats.length === 1 ? '' : 's'}.`
                  : 'Tap any seat on the map to start building your booking.'}
              </div>
            </div>
          </aside>
        </div>

        {bookingNow ? (
          <div className="premium-floating-status">
            Reserving your seats and preparing payment...
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MovieTicketsPage;