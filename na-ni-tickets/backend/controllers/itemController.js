const Movie = require('../models/Movie');
const Concert = require('../models/Concert');
const Bus = require('../models/Bus');
const Train = require('../models/Train');
const Flight = require('../models/Flight');
const Car = require('../models/Car');

// ==================== MOVIES ====================

// @route GET /api/items/movies
// @desc Get all movies
exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/movies/:id
// @desc Get movie details
exports.getMovieDetails = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }
    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CONCERTS ====================

// @route GET /api/items/concerts
// @desc Get all concerts
exports.getConcerts = async (req, res, next) => {
  try {
    const concerts = await Concert.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: concerts.length,
      concerts,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/concerts/:id
// @desc Get concert details
exports.getConcertDetails = async (req, res, next) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) {
      return res.status(404).json({
        success: false,
        message: 'Concert not found',
      });
    }
    res.status(200).json({
      success: true,
      concert,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== BUSES ====================

// @route GET /api/items/buses
// @desc Get all buses
exports.getBuses = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;
    let query = { isActive: true };

    if (source) {
      query['routes.source.city'] = source;
    }
    if (destination) {
      query['routes.destination.city'] = destination;
    }

    const buses = await Bus.find(query);
    res.status(200).json({
      success: true,
      count: buses.length,
      buses,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/buses/:id
// @desc Get bus details
exports.getBusDetails = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }
    res.status(200).json({
      success: true,
      bus,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== TRAINS ====================

// @route GET /api/items/trains
// @desc Get all trains
exports.getTrains = async (req, res, next) => {
  try {
    const { source, destination } = req.query;
    let query = { isActive: true };

    if (source) {
      query['routes.source.code'] = source.toUpperCase();
    }
    if (destination) {
      query['routes.destination.code'] = destination.toUpperCase();
    }

    const trains = await Train.find(query);
    res.status(200).json({
      success: true,
      count: trains.length,
      trains,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/trains/:id
// @desc Get train details
exports.getTrainDetails = async (req, res, next) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Train not found',
      });
    }
    res.status(200).json({
      success: true,
      train,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== FLIGHTS ====================

// @route GET /api/items/flights
// @desc Get all flights
exports.getFlights = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;
    let query = { isActive: true };

    if (source) {
      query['routes.source.code'] = source.toUpperCase();
    }
    if (destination) {
      query['routes.destination.code'] = destination.toUpperCase();
    }

    const flights = await Flight.find(query);
    res.status(200).json({
      success: true,
      count: flights.length,
      flights,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/flights/:id
// @desc Get flight details
exports.getFlightDetails = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found',
      });
    }
    res.status(200).json({
      success: true,
      flight,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CARS ====================

// @route GET /api/items/cars
// @desc Get all cars
exports.getCars = async (req, res, next) => {
  try {
    const cars = await Car.find({ isActive: true, isVerified: true });
    res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/cars/nearby
// @desc Get nearby cars
exports.getNearByCars = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude',
      });
    }

    const cars = await Car.find({
      isActive: true,
      isVerified: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(maxDistance),
        },
      },
    });

    res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/cars/:id
// @desc Get car details
exports.getCarDetails = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('bookings');
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }
    res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN: Add Items ====================

// @route POST /api/items/movies/add
// @desc Add new movie (Admin only)
exports.addMovie = async (req, res, next) => {
  try {
    const { name, genre, description, language, rating, posterUrl, releaseDate, duration, shows } =
      req.body;

    const movie = new Movie({
      name,
      genre,
      description,
      language,
      rating,
      posterUrl,
      releaseDate,
      duration,
      shows,
    });

    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// Similar add functions for other items...

// @route POST /api/items/cars/add
// @desc Add new car
exports.addCar = async (req, res, next) => {
  try {
    const { registrationNumber, carModel, manufacturer, carType, seatingCapacity, pricePerKm, currentLocation } = req.body;

    const car = new Car({
      registrationNumber,
      carModel,
      manufacturer,
      carType,
      seatingCapacity,
      pricePerKm,
      currentLocation: {
        type: 'Point',
        coordinates: [currentLocation.longitude, currentLocation.latitude],
      },
    });

    await car.save();

    res.status(201).json({
      success: true,
      message: 'Car added successfully',
      car,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SEED DATA ====================

// @route POST /api/items/seed-all
// @desc Seed database with sample data
exports.seedAll = async (req, res, next) => {
  try {
    // Clear existing data
    await Movie.deleteMany({});
    await Concert.deleteMany({});
    await Bus.deleteMany({});
    await Train.deleteMany({});
    await Flight.deleteMany({});
    await Car.deleteMany({});

    // Add sample movies
    const movies = await Movie.insertMany([
      {
        name: 'Pathaan',
        genre: 'Action/Thriller',
        description: 'An Indian spy navigates perilous global threats',
        language: 'Hindi',
        rating: 8.2,
        posterUrl: '',
        releaseDate: new Date('2023-01-25'),
        duration: 146,
        shows: [
          { time: '10:00 AM', theater: 'PVR Mumbai', price: 150, totalSeats: 100, bookedSeats: [] },
          { time: '01:30 PM', theater: 'IMAX Delhi', price: 200, totalSeats: 80, bookedSeats: [] },
          { time: '06:00 PM', theater: 'Cinepolis Bangalore', price: 180, totalSeats: 120, bookedSeats: [] },
        ],
        isActive: true,
      },
      {
        name: 'Animal',
        genre: 'Crime/Drama',
        description: 'A son seeks vengeance for his father\'s death',
        language: 'Hindi',
        rating: 7.8,
        posterUrl: '',
        releaseDate: new Date('2023-12-01'),
        duration: 210,
        shows: [
          { time: '11:00 AM', theater: 'PVR Mumbai', price: 150, totalSeats: 100, bookedSeats: [] },
          { time: '02:00 PM', theater: 'IMAX Delhi', price: 200, totalSeats: 90, bookedSeats: [] },
          { time: '07:00 PM', theater: 'Cinepolis Bangalore', price: 180, totalSeats: 110, bookedSeats: [] },
        ],
        isActive: true,
      },
      {
        name: 'Oppenheimer',
        genre: 'Biography/Drama',
        description: 'The story of physicist J. Robert Oppenheimer',
        language: 'English',
        rating: 9.0,
        posterUrl: '',
        releaseDate: new Date('2023-07-21'),
        duration: 180,
        shows: [
          { time: '09:30 AM', theater: 'PVR Mumbai', price: 160, totalSeats: 95, bookedSeats: [] },
          { time: '03:00 PM', theater: 'IMAX Delhi', price: 210, totalSeats: 85, bookedSeats: [] },
          { time: '08:30 PM', theater: 'Cinepolis Bangalore', price: 190, totalSeats: 115, bookedSeats: [] },
        ],
        isActive: true,
      },
      {
        name: 'Killers of the Flower Moon',
        genre: 'Crime/Drama',
        description: 'FBI investigates murders of Osage Nation members',
        language: 'English',
        rating: 8.6,
        posterUrl: '',
        releaseDate: new Date('2023-10-27'),
        duration: 206,
        shows: [
          { time: '10:30 AM', theater: 'PVR Mumbai', price: 170, totalSeats: 100, bookedSeats: [] },
          { time: '03:30 PM', theater: 'IMAX Delhi', price: 220, totalSeats: 88, bookedSeats: [] },
          { time: '09:00 PM', theater: 'Cinepolis Bangalore', price: 200, totalSeats: 120, bookedSeats: [] },
        ],
        isActive: true,
      },
    ]);

    // Add sample concerts
    const concerts = await Concert.insertMany([
      {
        name: 'Coldplay Live in India',
        artists: [
          { name: 'Coldplay', genre: 'Rock/Alternative' },
        ],
        date: new Date('2024-03-15'),
        venue: { name: 'DY Patil Stadium, Mumbai', city: 'Mumbai', capacity: 50000 },
        ticketCategories: [
          { name: 'Gold', price: 3500, totalSeats: 5000, bookedSeats: 0 },
          { name: 'Premium', price: 5500, totalSeats: 3000, bookedSeats: 0 },
          { name: 'Silver', price: 2000, totalSeats: 8000, bookedSeats: 0 },
        ],
        posterUrl: '',
        isActive: true,
      },
      {
        name: 'The Weeknd XO Tour',
        artists: [
          { name: 'The Weeknd', genre: 'R&B/Hip-Hop' },
        ],
        date: new Date('2024-04-20'),
        venue: { name: 'NSCI Dome, Delhi', city: 'Delhi', capacity: 35000 },
        ticketCategories: [
          { name: 'Gold', price: 4000, totalSeats: 4000, bookedSeats: 0 },
          { name: 'Premium', price: 6000, totalSeats: 2500, bookedSeats: 0 },
          { name: 'Silver', price: 2500, totalSeats: 7000, bookedSeats: 0 },
        ],
        posterUrl: '',
        isActive: true,
      },
      {
        name: 'Indian Premier League - CSK vs MI',
        artists: [
          { name: 'Chennai Super Kings', genre: 'Cricket' },
          { name: 'Mumbai Indians', genre: 'Cricket' },
        ],
        date: new Date('2024-04-10'),
        venue: { name: 'Wankhede Stadium, Mumbai', city: 'Mumbai', capacity: 33000 },
        ticketCategories: [
          { name: 'Gold', price: 2500, totalSeats: 8000, bookedSeats: 0 },
          { name: 'Premium', price: 4000, totalSeats: 5000, bookedSeats: 0 },
          { name: 'Silver', price: 1500, totalSeats: 12000, bookedSeats: 0 },
        ],
        posterUrl: '',
        isActive: true,
      },
    ]);

    // Add sample buses
    const buses = await Bus.insertMany([
      {
        busName: 'Redbus Express',
        busNumber: 'BR-001',
        operatorName: 'InterCity Travels',
        busType: 'Semi-Sleeper',
        totalSeats: 42,
        amenities: ['AC', 'WiFi', 'Charging Ports'],
        routes: [
          {
            source: { name: 'Mumbai', city: 'Mumbai', code: 'MUM' },
            destination: { name: 'Bangalore', city: 'Bangalore', code: 'BNG' },
            departureTime: '10:00 PM',
            arrivalTime: '06:30 AM',
            fare: 1200,
            date: new Date('2024-02-20'),
            bookedSeats: [],
          },
          {
            source: { name: 'Mumbai', city: 'Mumbai', code: 'MUM' },
            destination: { name: 'Hyderabad', city: 'Hyderabad', code: 'HYD' },
            departureTime: '02:00 PM',
            arrivalTime: '08:30 PM',
            fare: 900,
            date: new Date('2024-02-21'),
            bookedSeats: [],
          },
        ],
        isActive: true,
      },
      {
        busName: 'GoIbibo Travels',
        busNumber: 'GB-002',
        operatorName: 'GoIbibo Services',
        busType: 'AC',
        totalSeats: 48,
        amenities: ['AC', 'LED Display', 'Food Service'],
        routes: [
          {
            source: { name: 'Delhi', city: 'Delhi', code: 'DEL' },
            destination: { name: 'Jaipur', city: 'Jaipur', code: 'JAP' },
            departureTime: '08:00 AM',
            arrivalTime: '12:30 PM',
            fare: 600,
            date: new Date('2024-02-20'),
            bookedSeats: [],
          },
          {
            source: { name: 'Delhi', city: 'Delhi', code: 'DEL' },
            destination: { name: 'Agra', city: 'Agra', code: 'AGR' },
            departureTime: '07:00 AM',
            arrivalTime: '11:00 AM',
            fare: 550,
            date: new Date('2024-02-21'),
            bookedSeats: [],
          },
        ],
        isActive: true,
      },
    ]);

    // Add sample trains
    const trains = await Train.insertMany([
      {
        trainName: 'Rajdhani Express',
        trainNumber: '12952',
        runningDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
        coaches: [
          { coachNumber: 'A1', coachType: 'AC First', totalSeats: 72, bookedSeats: [] },
          { coachNumber: 'B1', coachType: 'AC 2-Tier', totalSeats: 96, bookedSeats: [] },
          { coachNumber: 'C1', coachType: 'AC 3-Tier', totalSeats: 120, bookedSeats: [] },
        ],
        routes: [
          { source: { name: 'New Delhi', code: 'NDLS' }, destination: { name: 'Mumbai Central', code: 'BCT' } },
        ],
        journeys: [],
        isActive: true,
      },
      {
        trainName: 'Shatabdi Express',
        trainNumber: '12001',
        runningDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday', 'Sunday'],
        coaches: [
          { coachNumber: 'A2', coachType: 'General', totalSeats: 100, bookedSeats: [] },
          { coachNumber: 'B2', coachType: 'Sleeper', totalSeats: 80, bookedSeats: [] },
        ],
        routes: [
          { source: { name: 'New Delhi', code: 'NDLS' }, destination: { name: 'Jaipur', code: 'JP' } },
        ],
        journeys: [],
        isActive: true,
      },
    ]);

    // Add sample flights
    const flights = await Flight.insertMany([
      {
        flightNumber: 'AI201',
        airline: { name: 'Air India', code: 'AI' },
        classes: [
          { className: 'Economy', price: 4000, availableSeats: 150 },
          { className: 'Business', price: 12000, availableSeats: 40 },
          { className: 'First Class', price: 25000, availableSeats: 8 },
        ],
        routes: [
          {
            source: { name: 'Delhi', code: 'DEL' },
            destination: { name: 'Mumbai', code: 'BOM' },
            departureTime: '06:00 AM',
            arrivalTime: '08:30 AM',
            date: new Date('2024-02-20'),
            bookedSeats: [],
          },
        ],
        isActive: true,
      },
      {
        flightNumber: 'SG301',
        airline: { name: 'SpiceJet', code: 'SG' },
        classes: [
          { className: 'Economy', price: 3500, availableSeats: 180 },
          { className: 'Business', price: 10000, availableSeats: 30 },
        ],
        routes: [
          {
            source: { name: 'Bangalore', code: 'BLR' },
            destination: { name: 'Hyderabad', code: 'HYD' },
            departureTime: '09:00 AM',
            arrivalTime: '10:30 AM',
            date: new Date('2024-02-20'),
            bookedSeats: [],
          },
        ],
        isActive: true,
      },
    ]);

    // Add sample cars
    const cars = await Car.insertMany([
      {
        carModel: 'Toyota Innova',
        manufacturer: 'Toyota',
        carType: 'XL',
        licensePlate: 'MH02AB1234',
        registrationNumber: 'MH02AB1234',
        seatingCapacity: 7,
        minimumFare: 250,
        pricePerKm: 15,
        currentLocation: {
          type: 'Point',
          coordinates: [72.8479, 19.0176], // Mumbai
        },
        isActive: true,
        isVerified: true,
      },
      {
        carModel: 'Honda City',
        manufacturer: 'Honda',
        carType: 'Comfort',
        licensePlate: 'DL01CD5678',
        registrationNumber: 'DL01CD5678',
        seatingCapacity: 5,
        minimumFare: 150,
        pricePerKm: 12,
        currentLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139], // Delhi
        },
        isActive: true,
        isVerified: true,
      },
      {
        carModel: 'Hyundai Creta',
        manufacturer: 'Hyundai',
        carType: 'Premium',
        licensePlate: 'KA01EF9012',
        registrationNumber: 'KA01EF9012',
        seatingCapacity: 5,
        minimumFare: 200,
        pricePerKm: 14,
        currentLocation: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bangalore
        },
        isActive: true,
        isVerified: true,
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        moviesAdded: movies.length,
        concertsAdded: concerts.length,
        busesAdded: buses.length,
        trainsAdded: trains.length,
        flightsAdded: flights.length,
        carsAdded: cars.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

