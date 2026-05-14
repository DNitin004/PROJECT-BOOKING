const express = require('express');
const router = express.Router();
const {
  bookMovie,
  bookConcert,
  bookBus,
  bookTrain,
  bookFlight,
  bookCar,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
} = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/auth');

// All booking routes require authentication except in development for testing
router.use(authMiddleware);

// Booking routes
router.post('/movie', bookMovie);
router.post('/event', bookConcert);
router.post('/bus', bookBus);
router.post('/train', bookTrain);
router.post('/flight', bookFlight);
router.post('/car', bookCar);

// Get bookings
router.get('/', getUserBookings);
router.get('/names/passengers', require('../controllers/bookingController').getPassengerNames);
router.get('/:bookingId', getBookingDetails);
router.post('/:bookingId/cancel', cancelBooking);

module.exports = router;
