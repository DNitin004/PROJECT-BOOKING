const fs = require('fs');
let content = fs.readFileSync('backend/controllers/bookingController.js', 'utf8');
const p1 = content.substring(0, content.indexOf('exports.bookTrain = async'));
const p2 = content.substring(content.indexOf('exports.bookFlight = async'));
const newFunc = \exports.bookTrain = async (req, res, next) => {
  try {
    const { trainId, journeyDate, seats, travelerDetails, source, destination, coachNumber, coachType } = req.body;
    const userId = req.user?.id || null;

    if (!trainId || !journeyDate || !seats || seats.length === 0 || !coachNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields including coachNumber.' });
    }

    const train = await require('../models/Train').findById(trainId);
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });

    let routeFare = train.routeFare || 1000;
    const coach = train.coaches.find(c => c.coachNumber === coachNumber);
    if (!coach) return res.status(400).json({ success: false, message: 'Coach not found' });

    const bookedSeats = coach.bookedSeats || [];
    const unavailableSeats = seats.filter(seat => bookedSeats.includes(seat));
    if (unavailableSeats.length > 0) return res.status(400).json({ success: false, message: 'Seats are already booked' });

    coach.bookedSeats = [...bookedSeats, ...seats];
    const modifier = coach.priceModifier || 1.0;
    const totalAmount = Math.round(routeFare * modifier * seats.length);

    const bookingId = 'TRN' + Date.now() + Math.floor(Math.random()*1000);
    const Booking = require('../models/Booking');
    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Train',
      itemId: trainId,
      seats,
      selectedSeatsCount: seats.length,
      pricePerSeat: Math.round(routeFare * modifier),
      totalAmount,
      bookingDate: new Date(),
      journeyDate: new Date(journeyDate),
      departureLocation: source || train.stationFrom,
      arrivalLocation: destination || train.stationTo,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      travelerDetails: travelerDetails ? [travelerDetails] : []
    });

    await booking.save();
    await train.save();

    if (userId) {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user) { user.bookings.push(booking._id); await user.save(); }
    }

    res.status(201).json({
      success: true,
      message: 'Train booking created successfully!',
      booking: {
        ...booking.toObject(),
        trainNumber: train.trainNumber,
        trainName: train.trainName,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

\
fs.writeFileSync('backend/controllers/bookingController.js', p1 + newFunc + p2);
