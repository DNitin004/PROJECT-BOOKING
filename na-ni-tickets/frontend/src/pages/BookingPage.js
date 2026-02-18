import React from 'react';
import './Booking.css';

function BookingPage({ type }) {
  return (
    <div className="booking-page">
      <div className="container">
        <h2>{type.toUpperCase()} Booking</h2>
        <p>{type} booking page coming soon</p>
      </div>
    </div>
  );
}

export default BookingPage;
