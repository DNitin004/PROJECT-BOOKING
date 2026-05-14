import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowRight,
  FaBolt,
  FaCalendarAlt,
  FaChair,
  FaClock,
  FaCompass,
  FaMapMarkerAlt,
  FaPlayCircle,
  FaStar,
  FaTicketAlt,
} from 'react-icons/fa';
import { itemsAPI } from '../services/api';
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

const formatTime = (timeValue) => {
  if (!timeValue) {
    return 'Time TBA';
  }

  const raw = String(timeValue);

  if (raw.includes(':')) {
    const [hoursValue = '0', minutesValue = '00'] = raw.split(':');
    const hours = Number(hoursValue);
    const minutes = String(minutesValue).slice(0, 2);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${suffix}`;
  }

  return raw;
};

const formatDuration = (movie) =>
  movie?.duration ||
  movie?.runtime ||
  movie?.length ||
  (movie?.durationMinutes ? `${movie.durationMinutes} mins` : 'Runtime unavailable');

const extractMoviePayload = (response) => response?.movie || response?.data?.movie || null;
const extractTheatresPayload = (response) => response?.theatres || response?.data?.theatres || [];

const MovieTheatresPage = () => {
  const { id, city } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(location.state?.movie || null);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingShowId, setSwitchingShowId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTheatres = async () => {
      setLoading(true);
      setError('');

      try {
        const tasks = [
          itemsAPI.getMovieTheatres(id, { city }),
        ];

        if (!location.state?.movie) {
          tasks.unshift(itemsAPI.getMovieDetails(id));
        }

        const responses = await Promise.all(tasks);
        const theatresResponse = responses[responses.length - 1];

        if (responses.length > 1) {
          const movieResponse = responses[0];
          if (isMounted) {
            setMovie(extractMoviePayload(movieResponse));
          }
        }

        if (isMounted) {
          setTheatres(extractTheatresPayload(theatresResponse));
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Unable to load theatres right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTheatres();

    return () => {
      isMounted = false;
    };
  }, [city, id, location.state?.movie]);

  const movieTitle = getMovieTitle(movie);

  const theatreStats = useMemo(() => {
    const totalShows = theatres.reduce(
      (count, theatre) => count + (theatre?.shows?.length || theatre?.showtimes?.length || 0),
      0
    );
    const totalSeatsOpen = theatres.reduce((count, theatre) => {
      const shows = theatre?.shows || theatre?.showtimes || [];
      return (
        count +
        shows.reduce((showCount, show) => {
          const totalSeats = Number(show?.totalSeats || theatre?.capacity || 0);
          const bookedCount = Array.isArray(show?.bookedSeats) ? show.bookedSeats.length : 0;
          return showCount + Math.max(totalSeats - bookedCount, 0);
        }, 0)
      );
    }, 0);

    return {
      totalShows,
      totalSeatsOpen,
    };
  }, [theatres]);

  const handleShowSelect = (theatre, show) => {
    setSwitchingShowId(show?._id || show?.showId || `${theatre?._id}-${show?.time}`);

    navigate(`/movies/city/${city}/movie/${id}/tickets`, {
      state: {
        movie,
        city,
        theatre,
        show,
      },
    });
  };

  return (
    <div className="movie-page-shell premium-page-shell">
      <div className="movie-page-backdrop movie-page-backdrop--theatres" />

      <div className="movie-page-content">
        <section className="movie-premium-hero">
          <div className="movie-premium-hero__media">
            {getMoviePoster(movie) ? (
              <img src={getMoviePoster(movie)} alt={movieTitle} className="movie-premium-hero__poster" />
            ) : (
              <div className="movie-premium-hero__poster movie-premium-hero__poster--fallback">
                <FaPlayCircle />
                <span>{movieTitle}</span>
              </div>
            )}
          </div>

          <div className="movie-premium-hero__content">
            <span className="premium-badge">
              <FaBolt />
              Premium show discovery
            </span>

            <h1>{movieTitle}</h1>

            <p>
              Browse the best theatres in <strong>{city}</strong>, compare live showtimes,
              and lock your seats with a faster, cinema-grade booking flow.
            </p>

            <div className="movie-premium-hero__meta">
              <span>
                <FaClock />
                {formatDuration(movie)}
              </span>
              <span>
                <FaCompass />
                {theatres.length} theatre{theatres.length === 1 ? '' : 's'}
              </span>
              <span>
                <FaTicketAlt />
                {theatreStats.totalShows} showtime{theatreStats.totalShows === 1 ? '' : 's'}
              </span>
              <span>
                <FaChair />
                {theatreStats.totalSeatsOpen}+ seats open
              </span>
            </div>
          </div>
        </section>

        <section className="movie-section-card">
          <div className="section-heading">
            <div>
              <span className="section-heading__eyebrow">Available today</span>
              <h2>Select your theatre & showtime</h2>
              <p>
                Curated for speed: every card highlights its location, current seat
                availability, and the quickest entry point into seat selection.
              </p>
            </div>

            <div className="section-heading__chip-group">
              <span className="section-chip">
                <FaMapMarkerAlt />
                {city}
              </span>
              <span className="section-chip">
                <FaCalendarAlt />
                Instant booking
              </span>
              <span className="section-chip">
                <FaStar />
                Live seat map
              </span>
            </div>
          </div>

          {loading ? (
            <div className="showtime-skeleton-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="showtime-skeleton-card">
                  <div className="skeleton-line skeleton-line--wide" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line--short" />
                  <div className="showtime-skeleton-pills">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="premium-empty-state">
              <h3>We hit a delay loading theatres</h3>
              <p>{error}</p>
              <button type="button" className="premium-primary-btn" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : theatres.length === 0 ? (
            <div className="premium-empty-state">
              <h3>No theatres found for this city yet</h3>
              <p>
                Try another city or return to the movie catalogue to explore more
                available showtimes.
              </p>
              <button type="button" className="premium-primary-btn" onClick={() => navigate(-1)}>
                Go back
              </button>
            </div>
          ) : (
            <div className="premium-theatre-grid">
              {theatres.map((theatre) => {
                const shows = theatre?.shows || theatre?.showtimes || [];

                return (
                  <article key={theatre?._id || theatre?.theater} className="premium-theatre-card">
                    <div className="premium-theatre-card__header">
                      <div>
                        <h3>{theatre?.theater || theatre?.theatreName || 'Theatre'}</h3>
                        <p>
                          <FaMapMarkerAlt />
                          <span>
                            {theatre?.location || theatre?.address || theatre?.city || city}
                          </span>
                        </p>
                      </div>

                      <div className="premium-theatre-card__badge">
                        <FaChair />
                        {theatre?.capacity || shows[0]?.totalSeats || 0} seats
                      </div>
                    </div>

                    <div className="premium-theatre-card__meta">
                      <span>
                        <FaPlayCircle />
                        {shows.length} showtime{shows.length === 1 ? '' : 's'}
                      </span>
                      <span>
                        <FaCompass />
                        Fast checkout
                      </span>
                    </div>

                    <div className="premium-showtime-list">
                      {shows.map((show) => {
                        const totalSeats = Number(show?.totalSeats || theatre?.capacity || 0);
                        const bookedCount = Array.isArray(show?.bookedSeats) ? show.bookedSeats.length : 0;
                        const seatsLeft = Math.max(totalSeats - bookedCount, 0);
                        const isBusy = totalSeats ? seatsLeft / totalSeats < 0.35 : false;
                        const isSwitching = switchingShowId === (show?._id || show?.showId);

                        return (
                          <button
                            key={`${theatre?.theater || theatre?._id}-${show?._id || show?.showId || show?.time}`}
                            type="button"
                            className={`premium-showtime-btn ${isBusy ? 'is-busy' : 'is-open'} ${isSwitching ? 'is-switching' : ''}`}
                            onClick={() => handleShowSelect(theatre, show)}
                          >
                            <div className="premium-showtime-btn__time">
                              <FaClock />
                              <strong>{formatTime(show?.time)}</strong>
                            </div>

                            <div className="premium-showtime-btn__details">
                              <span>₹{Number(show?.price || 0).toLocaleString()}</span>
                              <span>{seatsLeft} seats left</span>
                            </div>

                            <span className="premium-showtime-btn__cta">
                              {isSwitching ? 'Preparing seats...' : 'Choose seats'}
                              <FaArrowRight />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MovieTheatresPage;