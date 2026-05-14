const fs = require('fs');
const fn = '../backend/controllers/bookingController.js';
let data = fs.readFileSync(fn, 'utf8');

const sText = 'exports.bookCar = async (req, res, next) => {';
const eText = 'exports.getUserBookings = async (req, res, next) => {';
const startIdx = data.indexOf(sText);
const endIdx = data.indexOf(eText);

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find functions');
  process.exit(1);
}

const newLogic = \exports.bookCar = async (req, res, next) => {
  try {
    const { 
      carId, pickupLocation, dropLocation, pickupTime, dropTime, passengerCount,
      travelers, drivingLicenseUrl, phoneNumber, identityNumber
    } = req.body;
    const userId = req.user.id;

    if (!carId || !pickupLocation || !dropLocation || !pickupTime || !dropTime || !travelers || !travelers.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields, including traveler proofs',
      });
    }

    const { Car, Booking, User } = require('../models');

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    if (passengerCount > car.seatingCapacity) {
      return res.status(400).json({
        success: false,
        message: \\\This car can accommodate maximum \ passengers\\\,
      });
    }

    const start = new Date(pickupTime);
    const end = new Date(dropTime);
    
    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Drop time must be after pickup time.' });
    }

    const hours = Math.ceil(Math.abs(end - start) / 36e5) || 1;
    const pricePerHour = car.baseFare || 80;
    const totalAmount = hours * pricePerHour;

    const bookingId = generateBookingId();

    let newTravelers = travelers || [];

    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Car',
      itemId: carId,
      selectedSeatsCount: parseInt(passengerCount) || 1,
      pricePerSeat: pricePerHour,
      totalAmount,
      travelerDetails: newTravelers,
      rentalDetails: {
        drivingLicenseUrl,
        rentalStartTime: start,
        rentalEndTime: end,
        totalHours: hours,
        dropLocation: dropLocation
      },
      bookingDate: new Date(),
      journeyDate: start,
      departureTime: start.toISOString(),
      departureLocation: pickupLocation,
      arrivalLocation: dropLocation,
      status: 'Confirmed',
      paymentStatus: 'Pending',
    });

    await booking.save();
    
    if (car.bookings) {
      car.bookings.push(booking._id);
      await car.save();
    }

    const user = await User.findById(userId);
    if (user && user.bookings) {
      user.bookings.push(booking._id);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Car booked. Please proceed to payment.',
      booking: {
        bookingId: booking.bookingId,
        totalAmount,
        hours
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings
// @desc Get all bookings for a user
\;

const head = data.substring(0, startIdx);
const tail = data.substring(endIdx);
fs.writeFileSync(fn, head + newLogic + tail);
console.log('Patched');
