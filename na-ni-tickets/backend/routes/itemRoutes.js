const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieDetails,
  getConcerts,
  getConcertDetails,
  getBuses,
  getBusDetails,
  getTrains,
  getTrainDetails,
  getFlights,
  getFlightDetails,
  getCars,
  getNearByCars,
  getCarDetails,
  addMovie,
  addCar,
  seedAll,
} = require('../controllers/itemController');

// Public routes
router.get('/movies', getMovies);
router.get('/movies/:id', getMovieDetails);

router.get('/concerts', getConcerts);
router.get('/concerts/:id', getConcertDetails);

router.get('/buses', getBuses);
router.get('/buses/:id', getBusDetails);

router.get('/trains', getTrains);
router.get('/trains/:id', getTrainDetails);

router.get('/flights', getFlights);
router.get('/flights/:id', getFlightDetails);

router.get('/cars', getCars);
router.get('/cars/nearby', getNearByCars);
router.get('/cars/:id', getCarDetails);

// Admin routes (should be protected with admin middleware in production)
router.post('/movies/add', addMovie);
router.post('/cars/add', addCar);
router.post('/seed-all', seedAll);

module.exports = router;
