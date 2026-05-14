import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
  FaReceipt,
  FaShieldAlt,
  FaTicketAlt,
} from 'react-icons/fa';
import './Booking.css';

const getSeats = (booking, state) => {
  const seats =
    state?.selectedSeats ||
    booking?.selectedSeats ||
    booking?.seats ||
    booking?.seatNumbers ||
    [];

  return Array.isArray(seats) ? seats : [];
};

const getBookingTitle = (booking, state) =>
  booking?.movieName ||
  booking?.title ||
  booking?.itemName ||
  state?.movie?.title ||
  state?.movie?.name ||
  'Booking';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state;
  const state = useMemo(() => locationState || {}, [locationState]);

  const booking = state.booking || state.bookingData || null;
  const seats = useMemo(() => getSeats(booking, state), [booking, state]);
  const amount = Number(
    state.totalAmount ||
      booking?.totalAmount ||
      booking?.amount ||
      booking?.totalPrice ||
      seats.length * Number(state.pricePerSeat || booking?.pricePerSeat || booking?.price || 0)
  );

  const [form, setForm] = useState({
    paymentMethod: 'card',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
    saveCard: false,
    saveUpi: false,
  });
  const [processing, setProcessing] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!booking) {
      return;
    }

    setProcessing(true);

    const paymentReference = `PAY-${Date.now().toString().slice(-8)}`;

    setTimeout(() => {
      navigate('/receipt', {
        state: {
          booking,
          bookingData: booking,
          payment: {
            status: 'paid',
            method: form.paymentMethod,
            reference: paymentReference,
          },
          movie: state.movie,
          theatre: state.theatre,
          show: state.show,
          city: state.city,
        },
      });
    }, 1200);
  };

  if (!booking) {
    return (
      <div className="booking-page booking-page--premium">
        <div className="booking-shell">
          <div className="booking-card booking-card--empty">
            <h1>No booking found for payment</h1>
            <p>
              Your payment page needs an active booking first. Choose your movie,
              reserve seats, and then return here to complete checkout.
            </p>
            <button type="button" className="booking-primary-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft />
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page booking-page--premium">
      <div className="booking-backdrop" />

      <div className="booking-shell">
        <section className="payment-hero-card">
          <div>
            <span className="booking-badge">
              <FaLock />
              Secure payment
            </span>
            <h1>Review and complete your booking</h1>
            <p>
              Your seats are ready. Finish payment to generate a premium receipt and
              lock your entry details for the selected show.
            </p>
          </div>

          <div className="payment-confidence">
            <div>
              <FaShieldAlt />
              <span>Protected checkout</span>
            </div>
            <div>
              <FaReceipt />
              <span>Instant receipt</span>
            </div>
            <div>
              <FaCheckCircle />
              <span>Booking confirmation</span>
            </div>
          </div>
        </section>

        <div className="payment-grid">
          <section className="booking-card booking-card--form">
            <div className="booking-card__header">
              <div>
                <span className="booking-card__eyebrow">{form.paymentMethod === 'card' ? 'Card details' : 'UPI details'}</span>
                <h2>Payment method</h2>
              </div>
              <div className="payment-card-icon">
                {form.paymentMethod === 'card' ? <FaCreditCard /> : '📱'}
              </div>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="payment-method-selector">
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={form.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <span>💳 Credit/Debit Card</span>
                </label>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={form.paymentMethod === 'upi'}
                    onChange={handleChange}
                  />
                  <span>📱 UPI Payment</span>
                </label>
              </div>

              {form.paymentMethod === 'card' ? (
                <>
                  <label className="booking-field">
                    <span>Name on card</span>
                    <input
                      type="text"
                      name="cardName"
                      value={form.cardName}
                      onChange={handleChange}
                      placeholder="Enter cardholder name"
                      required
                    />
                  </label>

                  <label className="booking-field">
                    <span>Card number</span>
                    <input
                      type="text"
                      name="cardNumber"
                      value={form.cardNumber}
                      onChange={handleChange}
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </label>

                  <div className="booking-form__row">
                    <label className="booking-field">
                      <span>Expiry</span>
                      <input
                        type="text"
                        name="expiry"
                        value={form.expiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </label>

                    <label className="booking-field">
                      <span>CVV</span>
                      <input
                        type="password"
                        name="cvv"
                        value={form.cvv}
                        onChange={handleChange}
                        inputMode="numeric"
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </label>
                  </div>

                  <label className="booking-field--checkbox">
                    <input
                      type="checkbox"
                      name="saveCard"
                      checked={form.saveCard}
                      onChange={(e) => setForm(current => ({ ...current, saveCard: e.target.checked }))}
                    />
                    <span>Save this card for future payments</span>
                  </label>
                </>
              ) : (
                <>
                  <label className="booking-field">
                    <span>UPI ID</span>
                    <input
                      type="text"
                      name="upiId"
                      value={form.upiId}
                      onChange={handleChange}
                      placeholder="yourname@upi"
                      required
                    />
                  </label>

                  <label className="booking-field--checkbox">
                    <input
                      type="checkbox"
                      name="saveUpi"
                      checked={form.saveUpi}
                      onChange={(e) => setForm(current => ({ ...current, saveUpi: e.target.checked }))}
                    />
                    <span>Save this UPI ID for future payments</span>
                  </label>
                </>
              )}

              <div className="payment-note">
                <FaLock />
                <span>This demo flow securely confirms your booking and generates the receipt immediately.</span>
              </div>

              <button type="submit" className="booking-primary-btn booking-primary-btn--wide" disabled={processing}>
                {processing ? 'Processing payment...' : `Pay ₹${amount.toLocaleString()} and confirm`}
              </button>
            </form>
          </section>

          <aside className="booking-card booking-card--summary">
            <div className="booking-card__header">
              <div>
                <span className="booking-card__eyebrow">Order summary</span>
                <h2>{getBookingTitle(booking, state)}</h2>
              </div>
              <div className="summary-icon-chip">
                <FaTicketAlt />
              </div>
            </div>

            <div className="booking-summary-list">
              <div>
                <span>Venue</span>
                <strong>
                  {booking?.theatreName || booking?.venue || state?.theatre?.name || 'Theatre'}
                </strong>
              </div>
              <div>
                <span>Showtime</span>
                <strong>{booking?.showTime || booking?.time || state?.show?.time || 'TBA'}</strong>
              </div>
              <div>
                <span>Seats</span>
                <strong>{seats.length ? seats.join(', ') : 'Seat details unavailable'}</strong>
              </div>
              <div>
                <span>Price per seat</span>
                <strong>₹{Number(state.pricePerSeat || booking?.pricePerSeat || booking?.price || 0).toLocaleString()}</strong>
              </div>
            </div>

            <div className="booking-total-card">
              <span>Total payable</span>
              <strong>₹{amount.toLocaleString()}</strong>
            </div>

            <div className="booking-confidence-list">
              <div>
                <FaCheckCircle />
                <span>Seats already reserved in your booking flow</span>
              </div>
              <div>
                <FaShieldAlt />
                <span>Receipt works for both direct links and in-app confirmation</span>
              </div>
              <div>
                <FaReceipt />
                <span>Booking reference generated after payment confirmation</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;