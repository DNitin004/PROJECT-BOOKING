import React, { useEffect, useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaChair,
  FaCheckCircle,
  FaCouch,
  FaCrown,
  FaLock,
  FaTicketAlt,
} from 'react-icons/fa';
import './MiniTheater.css';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const normalizeSeatValue = (seat) => {
  if (seat === null || seat === undefined) {
    return '';
  }

  if (typeof seat === 'string' || typeof seat === 'number') {
    return String(seat);
  }

  return (
    seat.seatNumber ||
    seat.number ||
    seat.label ||
    seat.code ||
    seat.name ||
    `${seat.row || ''}${seat.col || seat.column || ''}`
  );
};

const buildSeatGrid = ({ rows, cols, capacity }) => {
  const safeCols = Math.max(1, Number(cols) || 10);
  const derivedRows = Math.max(1, Number(rows) || Math.ceil((Number(capacity) || safeCols) / safeCols));

  return Array.from({ length: derivedRows }, (_, rowIndex) => {
    const rowLabel = alphabet[rowIndex] || `R${rowIndex + 1}`;

    return Array.from({ length: safeCols }, (_, colIndex) => ({
      id: `${rowLabel}${colIndex + 1}`,
      rowLabel,
      colNumber: colIndex + 1,
      zone: rowIndex < 2 ? 'royal' : rowIndex < Math.ceil(derivedRows / 2) ? 'prime' : 'classic',
    }));
  });
};

const MiniTheater = ({
  capacity = 80,
  cols = 10,
  rows,
  booked = [],
  price = 0,
  variant = 'movie',
  title = 'Select your seats',
  onConfirm,
  onSelectionChange,
}) => {
  const seatGrid = useMemo(
    () => buildSeatGrid({ rows, cols, capacity }),
    [capacity, cols, rows]
  );

  const bookedSeatSet = useMemo(() => {
    return new Set(
      (Array.isArray(booked) ? booked : [])
        .map(normalizeSeatValue)
        .filter(Boolean)
    );
  }, [booked]);

  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    setSelectedSeats((current) => current.filter((seat) => !bookedSeatSet.has(seat)));
  }, [bookedSeatSet]);

  useEffect(() => {
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(selectedSeats);
    }
  }, [onSelectionChange, selectedSeats]);

  const totalAmount = selectedSeats.length * (Number(price) || 0);
  const totalSeats = seatGrid.flat().length;
  const availableSeats = Math.max(0, totalSeats - bookedSeatSet.size);
  const occupancyRate = totalSeats ? Math.round((bookedSeatSet.size / totalSeats) * 100) : 0;

  const handleSeatToggle = (seatId) => {
    if (bookedSeatSet.has(seatId)) {
      return;
    }

    setSelectedSeats((current) =>
      current.includes(seatId)
        ? current.filter((seat) => seat !== seatId)
        : [...current, seatId]
    );
  };

  const handleConfirm = () => {
    if (selectedSeats.length && typeof onConfirm === 'function') {
      onConfirm(selectedSeats);
    }
  };

  const selectedZoneLabel = useMemo(() => {
    if (!selectedSeats.length) {
      return 'Choose any seat to see your zone';
    }

    const firstSeat = seatGrid.flat().find((seat) => seat.id === selectedSeats[0]);

    if (!firstSeat) {
      return 'Flexible seating';
    }

    if (firstSeat.zone === 'royal') {
      return 'Royal Row';
    }

    if (firstSeat.zone === 'prime') {
      return 'Prime View';
    }

    return 'Classic View';
  }, [seatGrid, selectedSeats]);

  return (
    <div className={`mini-theater premium-${variant}`}>
      <div className="mini-theater__header">
        <div>
          <span className="mini-theater__eyebrow">Immersive seat map</span>
          <h3>{title}</h3>
          <p>
            Tap seats to build your perfect view. Booked seats are locked in real time
            and your total updates instantly.
          </p>
        </div>

        <div className="mini-theater__stats">
          <div className="mini-theater__stat-card">
            <span>Available</span>
            <strong>{availableSeats}</strong>
          </div>
          <div className="mini-theater__stat-card">
            <span>Reserved</span>
            <strong>{bookedSeatSet.size}</strong>
          </div>
          <div className="mini-theater__stat-card">
            <span>Occupancy</span>
            <strong>{occupancyRate}%</strong>
          </div>
        </div>
      </div>

      <div className="mini-theater__screen-wrap">
        <div className="mini-theater__screen-glow" />
        <div className="mini-theater__screen">
          <FaCouch />
          <span>SCREEN THIS WAY</span>
        </div>
      </div>

      <div className="mini-theater__legend">
        <div className="mini-theater__legend-item">
          <span className="mini-theater__legend-seat is-available" />
          <span>Available</span>
        </div>
        <div className="mini-theater__legend-item">
          <span className="mini-theater__legend-seat is-selected" />
          <span>Selected</span>
        </div>
        <div className="mini-theater__legend-item">
          <span className="mini-theater__legend-seat is-booked" />
          <span>Booked</span>
        </div>
        <div className="mini-theater__legend-item">
          <FaCrown />
          <span>{selectedZoneLabel}</span>
        </div>
      </div>

      <div className="mini-theater__zones">
        <span>Royal</span>
        <span>Prime</span>
        <span>Classic</span>
      </div>

      <div className="mini-theater__grid-wrap">
        {seatGrid.map((rowSeats, rowIndex) => (
          <div key={`row-${rowIndex}`} className="mini-theater__row">
            <div className="mini-theater__row-label">{rowSeats[0]?.rowLabel}</div>

            <div className="mini-theater__row-seats">
              {rowSeats.map((seat) => {
                const isBooked = bookedSeatSet.has(seat.id);
                const isSelected = selectedSeats.includes(seat.id);

                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={[
                      'mini-theater__seat',
                      `zone-${seat.zone}`,
                      isBooked ? 'is-booked' : '',
                      isSelected ? 'is-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSeatToggle(seat.id)}
                    disabled={isBooked}
                    aria-label={`Seat ${seat.id}${isBooked ? ' booked' : isSelected ? ' selected' : ''}`}
                    title={`${seat.id} · ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                  >
                    <span className="mini-theater__seat-inner">
                      <FaChair />
                      <small>{seat.id}</small>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mini-theater__row-label is-right">{rowSeats[0]?.rowLabel}</div>
          </div>
        ))}
      </div>

      <div className="mini-theater__footer">
        <div className="mini-theater__selection-card">
          <div className="mini-theater__selection-copy">
            <span className="mini-theater__pill">
              <FaTicketAlt />
              {selectedSeats.length} seat{selectedSeats.length === 1 ? '' : 's'}
            </span>
            <h4>Selection summary</h4>
            <p>
              {selectedSeats.length
                ? selectedSeats.join(', ')
                : 'No seats selected yet. Pick your preferred seats to continue.'}
            </p>
          </div>

          <div className="mini-theater__selection-meta">
            <div>
              <span>Price per seat</span>
              <strong>₹{Number(price || 0).toLocaleString()}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>₹{totalAmount.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mini-theater__confirm-btn"
          onClick={handleConfirm}
          disabled={!selectedSeats.length}
        >
          {selectedSeats.length ? (
            <>
              <FaCheckCircle />
              Continue with {selectedSeats.length} seat{selectedSeats.length === 1 ? '' : 's'}
              <FaArrowRight />
            </>
          ) : (
            <>
              <FaLock />
              Select seats to continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MiniTheater;