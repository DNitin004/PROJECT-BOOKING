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

// All booking routes require authentication
router.use(authMiddleware);

// Booking routes
router.post('/movie', bookMovie);
router.post('/concert', bookConcert);
router.post('/bus', bookBus);
router.post('/train', bookTrain);
router.post('/flight', bookFlight);
router.post('/car', bookCar);

// Get bookings
router.get('/', getUserBookings);
router.get('/:bookingId', getBookingDetails);
router.post('/:bookingId/cancel', cancelBooking);

module.exports = router;
