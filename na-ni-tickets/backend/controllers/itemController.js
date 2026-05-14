const Movie = require('../models/Movie');
const mongoose = require('mongoose');

// @route GET /api/items/trains/:id/stops
// @desc Get all stops (with details) for a train
exports.getTrainStops = async (req, res, next) => {
  try {
    const train = await mongoose.model('Train').findById(req.params.id);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }
    // Compose full stops list: source, ...stops, destination
    let stops = [];
    if (train.routes && train.routes.length > 0) {
      // Use the first route as canonical (or could merge all unique stops)
      const route = train.routes[0];
      if (route) {
        stops.push({
          name: route.source?.name || train.stationFrom,
          code: route.source?.code || train.stationFrom,
          type: 'source',
          arrivalTime: null,
          departureTime: route.departureTime || null
        });
        if (route.stops && route.stops.length > 0) {
          stops = stops.concat(route.stops.map(s => ({ ...s, type: 'intermediate' })));
        }
        stops.push({
          name: route.destination?.name || train.stationTo,
          code: route.destination?.code || train.stationTo,
          type: 'destination',
          arrivalTime: route.arrivalTime || null,
          departureTime: null
        });
      }
    } else {
      // Fallback: just source and destination
      stops = [
        { name: train.stationFrom, code: train.stationFrom, type: 'source', arrivalTime: null, departureTime: null },
        { name: train.stationTo, code: train.stationTo, type: 'destination', arrivalTime: null, departureTime: null }
      ];
    }
    res.status(200).json({ success: true, stops });
  } catch (error) {
    next(error);
  }
};
const Event = require('../models/Event');
const Bus = require('../models/Bus');
const Train = require('../models/Train');
const Flight = require('../models/Flight');
const Car = require('../models/Car');
const Theatre = require('../models/Theatre');

// ==================== MOVIES ====================

// @route GET /api/items/movies
// @desc Get all movies
exports.getMovies = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const movies = await Movie.find({ isActive: true }).limit(limit);
    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/movies/cities
// @desc Get all cities where movie theatres are available
exports.getMovieCities = async (req, res, next) => {
  try {
    let cities = await Theatre.distinct('city', { isActive: true });

    if (!cities || cities.length === 0) {
      cities = await Movie.distinct('shows.city', { isActive: true });
    }

    const normalized = Array.from(new Set((cities || []).map((city) => (city || '').trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      count: normalized.length,
      cities: normalized,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/theatres
// @desc Get theatres in a city with movie-wise show timings
exports.getTheatresByCity = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City is required',
      });
    }

    const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cityRegex = new RegExp(`^${escapedCity}$`, 'i');

    const theatres = await Theatre.find({
      isActive: true,
      city: cityRegex,
    }).sort({ name: 1 });

    const movies = await Movie.find({ isActive: true }).select('name posterUrl language genre shows');

    const theatreMap = new Map();

    theatres.forEach((theatre) => {
      const key = `${theatre.theatreCode || ''}::${theatre.name}::${theatre.city}`;
      theatreMap.set(key, {
        theatreId: theatre._id,
        theater: theatre.name,
        theatreCode: theatre.theatreCode,
        city: theatre.city,
        district: theatre.district,
        state: theatre.state,
        seatingCapacity: theatre.seatingCapacity,
        movies: [],
      });
    });

    movies.forEach((movie) => {
      const grouped = new Map();
      (movie.shows || []).forEach((show) => {
        if (!cityRegex.test(show.city || '')) return;
        const key = `${show.theatreCode || ''}::${show.theater || ''}::${show.city || ''}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key).push({
          showId: show._id,
          time: show.time,
          price: show.price,
          totalSeats: show.totalSeats,
          bookedSeats: show.bookedSeats || [],
        });
      });

      grouped.forEach((showtimes, key) => {
        if (!theatreMap.has(key)) {
          const [theatreCode, theater, theatreCity] = key.split('::');
          theatreMap.set(key, {
            theatreId: null,
            theater,
            theatreCode,
            city: theatreCity,
            district: '',
            state: '',
            seatingCapacity: 0,
            movies: [],
          });
        }

        const theatreEntry = theatreMap.get(key);
        theatreEntry.movies.push({
          movieId: movie._id,
          movieName: movie.name,
          posterUrl: movie.posterUrl,
          language: movie.language,
          genre: movie.genre,
          showCount: showtimes.length,
          minPrice: Math.min(...showtimes.map((s) => s.price || 0)),
          showtimes,
        });
      });
    });

    const payload = Array.from(theatreMap.values())
      .map((theatre) => ({
        ...theatre,
        movieCount: theatre.movies.length,
      }))
      .filter((theatre) => theatre.movieCount > 0)
      .sort((a, b) => a.theater.localeCompare(b.theater));

    res.status(200).json({
      success: true,
      city: city.trim(),
      count: payload.length,
      theatres: payload,
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

// @route GET /api/items/movies/:id/theatres
// @desc Get theatres and showtimes for a movie (optionally filtered by city)
exports.getMovieTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const movie = await Movie.findById(req.params.id).select('name shows');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    let filteredShows = movie.shows || [];
    if (city && city.trim()) {
      const cityQuery = city.trim().toLowerCase();
      filteredShows = filteredShows.filter(
        (show) => (show.city || '').toLowerCase() === cityQuery
      );
    }

    const theatresMap = new Map();
    filteredShows.forEach((show) => {
      const key = `${show.theater || ''}::${show.theatreCode || ''}::${show.city || ''}`;
      if (!theatresMap.has(key)) {
        theatresMap.set(key, {
          theater: show.theater || 'Unknown Theatre',
          theatreCode: show.theatreCode || '',
          city: show.city || '',
          state: show.state || '',
          district: show.district || '',
          seatingCapacity: show.seatingCapacity || show.totalSeats || 0,
          shows: [],
        });
      }

      theatresMap.get(key).shows.push({
        _id: show._id,
        time: show.time,
        price: show.price,
        totalSeats: show.totalSeats,
        bookedSeats: show.bookedSeats || [],
      });
    });

    const theatres = Array.from(theatresMap.values())
      .map((theatre) => ({
        ...theatre,
        showCount: theatre.shows.length,
        minPrice: theatre.shows.length > 0 ? Math.min(...theatre.shows.map((s) => s.price || 0)) : 0,
      }))
      .sort((a, b) => a.theater.localeCompare(b.theater));

    res.status(200).json({
      success: true,
      movieId: movie._id,
      movieName: movie.name,
      city: city || null,
      count: theatres.length,
      theatres,
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
    const concerts = await Event.find({ isActive: true });
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
    const concert = await Event.findById(req.params.id);
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

// @route GET /api/items/buses/locations
// @desc Get all bus locations
exports.getBusLocations = async (req, res, next) => {
  try {
    const locations = await Bus.distinct('routes.stops');
    const sources = await Bus.distinct('routes.source.name');
    const destinations = await Bus.distinct('routes.destination.name');

    const uniqueLocations = Array.from(new Set([...locations, ...sources, ...destinations]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    
    res.status(200).json({
      success: true,
      count: uniqueLocations.length,
      locations: uniqueLocations,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/items/buses
// @desc Get all buses
exports.getBuses = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;
    let query = { isActive: true };

    let routeMatch = {};

    if (source) {
      routeMatch['stops'] = { $regex: new RegExp(source, 'i') };
    }
    if (destination) {
      if (routeMatch['stops']) {
        routeMatch['$and'] = [
          { stops: { $regex: new RegExp(source, 'i') } },
          { stops: { $regex: new RegExp(destination, 'i') } }
        ];
        delete routeMatch['stops'];
      } else {
        routeMatch['stops'] = { $regex: new RegExp(destination, 'i') };
      }
    }

    if (Object.keys(routeMatch).length > 0 || date) {
      if (date) routeMatch.date = new Date(date);
      query['routes'] = { $elemMatch: routeMatch };
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
    const { source, destination, train } = req.query;
    // include documents where isActive is true OR field is missing (imported docs)
    let query = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };

    // If a train query is provided, search by train number or name (case-insensitive)
    if (train) {
      const regex = new RegExp(train.trim(), 'i');
      query = {
        $or: [{ isActive: true }, { isActive: { $exists: false } }],
        $or: [{ trainNumber: regex }, { trainName: regex }],
      };
      const trainsByNumber = await Train.find(query);
      return res.status(200).json({ success: true, count: trainsByNumber.length, trains: trainsByNumber });
    }

    const s = source ? source.toString().trim() : null;
    const d = destination ? destination.toString().trim() : null;

    const baseActive = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };

    if (s && d) {
      // match when stationFrom/stationTo exact match OR stationList contains source then destination in order
      const sCode = s.toUpperCase();
      const dCode = d.toUpperCase();
      const stationOrderRegex1 = new RegExp(`${sCode}[\\s\\S]*${dCode}`, 'i');
      const stationOrderRegex2 = new RegExp(`${dCode}[\\s\\S]*${sCode}`, 'i');

      query = {
        $and: [
          baseActive,
          {
            $or: [
              { $and: [{ stationFrom: sCode }, { stationTo: dCode }] },
              { stationList: { $regex: stationOrderRegex1 } },
              { stationList: { $regex: stationOrderRegex2 } },
              { $and: [{ 'routes.source.code': sCode }, { 'routes.destination.code': dCode }] },
            ],
          },
        ],
      };
    } else if (s) {
      const sCode = s.toUpperCase();
      query = {
        $and: [
          baseActive,
          {
            $or: [
              { 'routes.source.code': sCode },
              { stationFrom: { $regex: new RegExp(s, 'i') } },
              { stationList: { $regex: new RegExp(sCode, 'i') } },
            ],
          },
        ],
      };
    } else if (d) {
      const dCode = d.toUpperCase();
      query = {
        $and: [
          baseActive,
          {
            $or: [
              { 'routes.destination.code': dCode },
              { stationTo: { $regex: new RegExp(d, 'i') } },
              { stationList: { $regex: new RegExp(dCode, 'i') } },
            ],
          },
        ],
      };
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

// @route GET /api/items/trains/stations
// @desc Get all unique train stations
exports.getTrainStations = async (req, res, next) => {
  try {
    // include documents where isActive is true OR field is missing (imported docs)
    const trains = await Train.find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
      .select('routes');

    const stationMap = new Map();
    trains.forEach((train) => {
      if (train.routes && train.routes.length > 0) {
        const route = train.routes[0];
        if (route.source?.name && route.source?.code) {
          stationMap.set(route.source.code, `${route.source.name} (${route.source.code})`);
        } else if (route.source?.name) {
          stationMap.set(route.source.name, route.source.name);
        }
        
        if (route.destination?.name && route.destination?.code) {
          stationMap.set(route.destination.code, `${route.destination.name} (${route.destination.code})`);
        } else if (route.destination?.name) {
          stationMap.set(route.destination.name, route.destination.name);
        }
        
        if (route.stops) {
          route.stops.forEach(stop => {
            if (stop.name && stop.code) {
              stationMap.set(stop.code, `${stop.name} (${stop.code})`);
            } else if (stop.name) {
              stationMap.set(stop.name, stop.name);
            }
          });
        }
      }
    });

    const stations = Array.from(stationMap.values()).sort();

    res.status(200).json({
      success: true,
      count: stations.length,
      stations,
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
      const srcRegex = new RegExp(source, 'i');
      query.$or = [
        { 'routes.source.code': srcRegex },
        { 'routes.source.name': srcRegex },
        { 'routes.stops.name': srcRegex }
      ];
    }
    
    if (destination) {
      const destRegex = new RegExp(destination, 'i');
      if (query.$or) {
        query.$and = [{ $or: query.$or }, {
          $or: [
            { 'routes.destination.code': destRegex },
            { 'routes.destination.name': destRegex },
            { 'routes.stops.name': destRegex }
          ]
        }];
        delete query.$or;
      } else {
        query.$or = [
          { 'routes.destination.code': destRegex },
          { 'routes.destination.name': destRegex },
          { 'routes.stops.name': destRegex }
        ];
      }
    }

    const flights = await Flight.find(query).limit(50);
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
    const seedImages = {
      movies: [
        'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/pathaan-et00323848-1674372556.jpg',
        'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/animal-et00311762-1673255152.jpg',
        'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/oppenheimer-et00347867-1689582103.jpg',
        'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/killers-of-the-flower-moon-et00359858-1698299839.jpg',
      ],
      events: [
        'https://media.architecturaldigest.com/content/dam/ad/public/2024/09/coldplay-india.jpg',
        'https://i.scdn.co/image/ab6761610000e5eb4257121b672728929bbcc205',
        'https://images.livemint.com/img/2023/05/06/600x338/CSK_vs_MI_1683344606709_1683344606869.jpg',
      ],
      buses: [
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85',
      ],
      flights: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=85',
        'https://images.unsplash.com/photo-1521727857535-28d2047314ac?auto=format&fit=crop&w=800&q=85',
      ],
      cars: [
        'https://stimg.cardekho.com/images/carexteriorimages/630x420/Toyota/Innova-Crysta/9612/1677057395905/front-left-side-47.jpg',
        'https://stimg.cardekho.com/images/carexteriorimages/630x420/Honda/City/9710/1677914238051/front-left-side-47.jpg',
        'https://stimg.cardekho.com/images/carexteriorimages/630x420/Hyundai/Creta/16788/1705389650392/front-left-side-47.jpg',
      ],
    };

    // Clear existing data
    await Movie.deleteMany({});
    await Event.deleteMany({});
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
        posterUrl: seedImages.movies[0],
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
        posterUrl: seedImages.movies[1],
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
        posterUrl: seedImages.movies[2],
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
        posterUrl: seedImages.movies[3],
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
    const concerts = await Event.insertMany([
      {
        name: 'Coldplay Live in India',
        artists: [
          { name: 'Coldplay', genre: 'Rock/Alternative' },
        ],
        date: new Date('2024-03-15'),
        venue: { name: 'DY Patil Stadium, Mumbai', city: 'Mumbai', capacity: 50000 },
        ticketCategories: [
          { name: 'Gold', price: 3500, totalSeats: 5000, bookedSeats: [] },
          { name: 'Premium', price: 5500, totalSeats: 3000, bookedSeats: [] },
          { name: 'Silver', price: 2000, totalSeats: 8000, bookedSeats: [] },
        ],
        posterUrl: seedImages.events[0],
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
          { name: 'Gold', price: 4000, totalSeats: 4000, bookedSeats: [] },
          { name: 'Premium', price: 6000, totalSeats: 2500, bookedSeats: [] },
          { name: 'Silver', price: 2500, totalSeats: 7000, bookedSeats: [] },
        ],
        posterUrl: seedImages.events[1],
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
          { name: 'Gold', price: 2500, totalSeats: 8000, bookedSeats: [] },
          { name: 'Premium', price: 4000, totalSeats: 5000, bookedSeats: [] },
          { name: 'Silver', price: 1500, totalSeats: 12000, bookedSeats: [] },
        ],
        posterUrl: seedImages.events[2],
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
        images: [seedImages.buses[0]],
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
        images: [seedImages.buses[1]],
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
        stationFrom: 'New Delhi',
        stationTo: 'Mumbai Central',
        runningDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
        coaches: [
          { coachNumber: 'A1', coachType: 'AC First', totalSeats: 72, bookedSeats: [] },
          { coachNumber: 'B1', coachType: 'AC 2-Tier', totalSeats: 96, bookedSeats: [] },
          { coachNumber: 'C1', coachType: 'AC 3-Tier', totalSeats: 120, bookedSeats: [] },
        ],
        routes: [
          {
            source: { name: 'New Delhi', code: 'NDLS' },
            destination: { name: 'Mumbai Central', code: 'BCT' },
            stops: [
              { name: 'Delhi Cantt', code: 'DEC', arrivalTime: '22:25', departureTime: '22:30' },
              { name: 'Mathura', code: 'MTJ', arrivalTime: '02:20', departureTime: '02:30' },
              { name: 'Gwalior', code: 'GWL', arrivalTime: '06:30', departureTime: '06:40' },
              { name: 'Bina Junction', code: 'BINA', arrivalTime: '09:05', departureTime: '09:15' },
            ],
            departureTime: '21:15',
            arrivalTime: '08:35',
            duration: '11h 20m',
            distance: 1449,
            fare: 1200
          },
          {
            source: { name: 'New Delhi', code: 'NDLS' },
            destination: { name: 'Agra', code: 'AGR' },
            stops: [
              { name: 'Delhi Cantt', code: 'DEC', arrivalTime: '22:25', departureTime: '22:30' },
              { name: 'Mathura', code: 'MTJ', arrivalTime: '02:20', departureTime: '02:30' },
            ],
            departureTime: '21:15',
            arrivalTime: '04:50',
            duration: '7h 35m',
            distance: 206,
            fare: 450
          },
          {
            source: { name: 'Mathura', code: 'MTJ' },
            destination: { name: 'Mumbai Central', code: 'BCT' },
            stops: [
              { name: 'Gwalior', code: 'GWL', arrivalTime: '06:30', departureTime: '06:40' },
              { name: 'Bina Junction', code: 'BINA', arrivalTime: '09:05', departureTime: '09:15' },
            ],
            departureTime: '02:30',
            arrivalTime: '08:35',
            duration: '6h 05m',
            distance: 1243,
            fare: 950
          },
        ],
        isActive: true,
      },
      {
        trainName: 'Shatabdi Express',
        trainNumber: '12001',
        stationFrom: 'New Delhi',
        stationTo: 'Jaipur',
        runningDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday', 'Sunday'],
        coaches: [
          { coachNumber: 'A2', coachType: 'General', totalSeats: 100, bookedSeats: [] },
          { coachNumber: 'B2', coachType: 'Sleeper', totalSeats: 80, bookedSeats: [] },
        ],
        routes: [
          {
            source: { name: 'New Delhi', code: 'NDLS' },
            destination: { name: 'Jaipur', code: 'JP' },
            stops: [
              { name: 'Gurgaon', code: 'GGN', arrivalTime: '07:35', departureTime: '07:40' },
              { name: 'Alwar', code: 'ALW', arrivalTime: '08:55', departureTime: '09:00' },
            ],
            departureTime: '06:55',
            arrivalTime: '10:20',
            duration: '3h 25m',
            distance: 240,
            fare: 350
          },
          {
            source: { name: 'New Delhi', code: 'NDLS' },
            destination: { name: 'Alwar', code: 'ALW' },
            stops: [
              { name: 'Gurgaon', code: 'GGN', arrivalTime: '07:35', departureTime: '07:40' },
            ],
            departureTime: '06:55',
            arrivalTime: '08:55',
            duration: '2h 00m',
            distance: 140,
            fare: 250
          },
          {
            source: { name: 'Gurgaon', code: 'GGN' },
            destination: { name: 'Jaipur', code: 'JP' },
            stops: [
              { name: 'Alwar', code: 'ALW', arrivalTime: '08:55', departureTime: '09:00' },
            ],
            departureTime: '07:40',
            arrivalTime: '10:20',
            duration: '2h 40m',
            distance: 140,
            fare: 300
          },
        ],
        isActive: true,
      },
    ]);

    // Add sample flights
    const flights = await Flight.insertMany([
      {
        flightNumber: 'AI201',
        airline: { name: 'Air India', code: 'AI', logoUrl: seedImages.flights[0] },
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
        airline: { name: 'SpiceJet', code: 'SG', logoUrl: seedImages.flights[1] },
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
        images: [seedImages.cars[0]],
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
        images: [seedImages.cars[1]],
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
        images: [seedImages.cars[2]],
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


exports.getFlightAirports = async (req, res, next) => {
  try {
    const Flight = require('../models/Flight');
    // Find distinct airport codes from source, destination, and stops
    const flights = await Flight.find().select('routes.source routes.destination routes.stops').lean();
    const airportsSet = new Set();

    flights.forEach(f => {
      if (f.routes) {
        f.routes.forEach(r => {
          if (r.source && r.source.code) airportsSet.add(r.source.name + ' (' + r.source.code + ')');
          if (r.destination && r.destination.code) airportsSet.add(r.destination.name + ' (' + r.destination.code + ')');
          if (r.stops) {
            r.stops.forEach(s => {
              if (s.code) airportsSet.add(s.name + ' (' + s.code + ')');
            });
          }
        });
      }
    });

    res.status(200).json({ success: true, count: airportsSet.size, airports: Array.from(airportsSet).sort() });
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ success: false, message: 'Server error fetching airports' });
  }
};
