import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FaCheckCircle,
  FaDownload,
  FaMapMarkerAlt,
  FaPrint,
  FaReceipt,
  FaShieldAlt,
  FaStar,
} from 'react-icons/fa';
import { bookingsAPI } from '../services/api';
import './ReceiptPage.css';

const extractBooking = (response) =>
  response?.booking ||
  response?.data?.booking ||
  response?.data ||
  null;

const getFetchers = () => [
  bookingsAPI?.getBookingById,
  bookingsAPI?.getBookingDetails,
  bookingsAPI?.getBooking,
  bookingsAPI?.getReceipt,
].filter((fn) => typeof fn === 'function');

const getSeats = (booking) => {
  const seats =
    booking?.selectedSeats ||
    booking?.seats ||
    booking?.seatNumbers ||
    booking?.seatLabels ||
    [];

  return Array.isArray(seats) ? seats : [];
};

const getTitle = (booking, state) =>
  booking?.movieName ||
  booking?.title ||
  booking?.itemName ||
  state?.movie?.title ||
  state?.movie?.name ||
  'Booking receipt';

const getVenue = (booking, state) =>
  booking?.theatreName ||
  booking?.venue ||
  booking?.location ||
  state?.theatre?.name ||
  state?.theatre?.theatreName ||
  'Venue details unavailable';

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
};

const getBookingType = (booking) => {
  if (booking?.movieName || booking?.movieId) return 'movie';
  if (booking?.trainNo || booking?.trainId) return 'train';
  if (booking?.flightNo || booking?.flightId) return 'flight';
  if (booking?.busNo || booking?.busId) return 'bus';
  if (booking?.eventName || booking?.concertId) return 'event';
  return 'general';
};

const getTypeSpecificData = (booking, type) => {
  switch (type) {
    case 'movie':
      return {
        icon: '🎬',
        title: 'Movie Ticket Receipt',
        subtitle: 'Cinematic Experience Confirmed',
        venueLabel: 'Theatre',
        experienceLabel: 'Film',
      };
    case 'train':
      return {
        icon: '🚂',
        title: 'Train Ticket Receipt',
        subtitle: 'Rail Journey Confirmed',
        venueLabel: 'Station',
        experienceLabel: 'Route',
      };
    case 'flight':
      return {
        icon: '✈️',
        title: 'Flight Ticket Receipt',
        subtitle: 'Aerial Journey Confirmed',
        venueLabel: 'Airport',
        experienceLabel: 'Flight',
      };
    case 'bus':
      return {
        icon: '🚌',
        title: 'Bus Ticket Receipt',
        subtitle: 'Road Journey Confirmed',
        venueLabel: 'Bus Stand',
        experienceLabel: 'Route',
      };
    case 'event':
      return {
        icon: '🎪',
        title: 'Event Ticket Receipt',
        subtitle: 'Live Experience Confirmed',
        venueLabel: 'Venue',
        experienceLabel: 'Event',
      };
    default:
      return {
        icon: '🎫',
        title: 'Booking Receipt',
        subtitle: 'Experience Confirmed',
        venueLabel: 'Venue',
        experienceLabel: 'Service',
      };
  }
};

const createThemeVariant = (booking, seats) => {
  const source = `${booking?._id || booking?.id || booking?.bookingId || ''}${seats.length}${booking?.bookingType || booking?.type || ''}`;
  const variants = ['royal', 'aurora', 'sunset', 'emerald'];

  const hash = source.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return variants[hash % variants.length];
};

const ReceiptPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const [booking, setBooking] = useState(state.booking || state.bookingData || null);
  const [loading, setLoading] = useState(!state.booking && !state.bookingData && !!bookingId);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadBooking = async () => {
      if (booking || !bookingId) {
        return;
      }

      setLoading(true);
      setError('');

      const fetchers = getFetchers();

      if (!fetchers.length) {
        setError('This receipt cannot be loaded directly right now.');
        setLoading(false);
        return;
      }

      for (const fetcher of fetchers) {
        try {
          const response = await fetcher(bookingId);
          const resolvedBooking = extractBooking(response);

          if (resolvedBooking) {
            if (isMounted) {
              setBooking(resolvedBooking);
              setLoading(false);
            }
            return;
          }
        } catch (err) {
          continue;
        }
      }

      if (isMounted) {
        setError('We could not load that booking receipt.');
        setLoading(false);
      }
    };

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [booking, bookingId]);

  const seats = useMemo(() => getSeats(booking), [booking]);
  const theme = useMemo(() => createThemeVariant(booking, seats), [booking, seats]);
  const title = getTitle(booking, state);
  const amount = Number(
    booking?.totalAmount ||
      booking?.amount ||
      booking?.totalPrice ||
      seats.length * Number(booking?.pricePerSeat || booking?.price || state?.pricePerSeat || 0)
  );
  const bookingType = getBookingType(booking);
  const typeData = getTypeSpecificData(booking, bookingType);

  if (loading) {
    return (
      <div className="receipt-page">
        <div className="receipt-shell">
          <div className="receipt-card receipt-card--loading">
            <div className="receipt-loading-orb" />
            <h1>Loading your premium receipt...</h1>
            <p>Fetching booking details and preparing your confirmation card.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="receipt-page">
        <div className="receipt-shell">
          <div className="receipt-card receipt-card--error">
            <h1>Receipt unavailable</h1>
            <p>{error || 'We could not find a booking to show here.'}</p>
            <button type="button" className="receipt-action-btn" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reference =
    booking?._id ||
    booking?.id ||
    booking?.bookingId ||
    bookingId ||
    `BK-${Date.now().toString().slice(-6)}`;

  return (
    <div className={`receipt-page receipt-theme--${theme}`}>
      <div className="receipt-shell">
        <section className="receipt-hero">
          <span className="receipt-badge">
            <FaCheckCircle />
            Booking confirmed
          </span>
          <h1>{typeData.title}</h1>
          <p>
            {typeData.subtitle}. Save or print this confirmation card for quick access at the venue.
          </p>
          <div className="receipt-hero__actions no-print">
            <button type="button" className="receipt-action-btn" onClick={() => window.print()}>
              <FaPrint />
              Print
            </button>
            <button type="button" className="receipt-action-btn is-primary" onClick={() => navigate('/')}>
              <FaDownload />
              Done
            </button>
          </div>
        </section>

        <section className="receipt-card">
          <div className="receipt-card__glow" />
          <div className="receipt-card__top">
            <div className="receipt-brand">
              <div className="receipt-brand__icon">
                {typeData.icon}
              </div>
              <div>
                <span>NA-NI Tickets</span>
                <strong>{typeData.subtitle}</strong>
              </div>
            </div>

            <div className="receipt-status-chip">
              <FaShieldAlt />
              Paid & secured
            </div>
          </div>

          <div className="receipt-highlight-row">
            <div className="receipt-highlight">
              <span>{typeData.experienceLabel}</span>
              <strong>{title}</strong>
            </div>
            <div className="receipt-highlight">
              <span>Booking reference</span>
              <strong>{reference}</strong>
            </div>
            <div className="receipt-highlight">
              <span>Type</span>
              <strong>{bookingType.toUpperCase()}</strong>
            </div>
          </div>

          <div className="receipt-body">
            <div className="receipt-main-panel">
              <div className="receipt-section">
                <span className="receipt-section__label">{typeData.venueLabel} details</span>
                <h2>{getVenue(booking, state)}</h2>
                <p className="receipt-info-line">
                  <FaMapMarkerAlt />
                  <span>{booking?.city || state?.city || 'City unavailable'}</span>
                </p>
              </div>

              <div className="receipt-info-grid">
                <div>
                  <span>Showtime</span>
                  <strong>{booking?.showTime || booking?.time || state?.show?.time || 'TBA'}</strong>
                </div>
                <div>
                  <span>Issued at</span>
                  <strong>{formatDate(booking?.createdAt || booking?.bookingDate || Date.now())}</strong>
                </div>
                <div>
                  <span>Seats</span>
                  <strong>{seats.length ? seats.join(', ') : 'Seat details unavailable'}</strong>
                </div>
                <div>
                  <span>Total paid</span>
                  <strong>₹{amount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="receipt-feature-strip">
                <div>
                  <FaReceipt />
                  <span>Receipt sync ready</span>
                </div>
                <div>
                  <FaStar />
                  <span>{seats.length || 1} guest pass{seats.length === 1 ? '' : 'es'}</span>
                </div>
                <div>
                  <FaCheckCircle />
                  <span>Fast lane confirmation</span>
                </div>
              </div>
            </div>

            <aside className="receipt-side-panel">
              <div className="receipt-total-panel">
                <span>Total paid</span>
                <strong>₹{amount.toLocaleString()}</strong>
                <small>
                  Includes {seats.length || 1} seat{seats.length === 1 ? '' : 's'} at{' '}
                  ₹{Number(booking?.pricePerSeat || booking?.price || state?.pricePerSeat || 0).toLocaleString()} each
                </small>
              </div>

              <div className="receipt-barcode" aria-hidden="true">
                {Array.from({ length: 42 }).map((_, index) => (
                  <span key={`bar-${index}`} style={{ height: `${45 + ((index * 13) % 55)}%` }} />
                ))}
              </div>

              <div className="receipt-reference-panel">
                <span>Quick scan reference</span>
                <strong>{String(reference).slice(-10).toUpperCase()}</strong>
                <small>Keep this handy for support and entry verification.</small>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReceiptPage;