const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieCities,
  getMovieDetails,
  getMovieTheatres,
  getTheatresByCity,
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
  getTrainStops,
} = require('../controllers/itemController');

// Public routes
router.get('/movies', getMovies);
router.get('/movies/cities', getMovieCities);
router.get('/movies/:id', getMovieDetails);
router.get('/movies/:id/theatres', getMovieTheatres);
router.get('/theatres', getTheatresByCity);

router.get('/events', getConcerts);
router.get('/events/:id', getConcertDetails);

router.get('/buses', getBuses);
// Get all unique bus locations
router.get('/buses/locations', require('../controllers/itemController').getBusLocations);
router.get('/buses/:id', getBusDetails);

router.get('/trains', getTrains);
// Get all stops (with details) for a train
router.get('/trains/stations', require('../controllers/itemController').getTrainStations);
router.get('/trains/:id/stops', getTrainStops);
router.get('/trains/:id', getTrainDetails);

router.get('/flights', getFlights);
// Get all unique airports
router.get('/flights/airports', require('../controllers/itemController').getFlightAirports);
router.get('/flights/:id', getFlightDetails);

router.get('/cars', getCars);
router.get('/cars/nearby', getNearByCars);
router.get('/cars/:id', getCarDetails);

// Admin routes (should be protected with admin middleware in production)
router.post('/movies/add', addMovie);
router.post('/cars/add', addCar);
router.post('/seed-all', seedAll);

module.exports = router;
