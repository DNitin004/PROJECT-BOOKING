const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Event = require('../models/Event');
const Bus = require('../models/Bus');
const Train = require('../models/Train');
const Flight = require('../models/Flight');
const Car = require('../models/Car');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { sendBookingConfirmation, sendReminderEmail } = require('../utils/emailService');

// Generate unique booking ID
const generateBookingId = () => {
  return 'BK' + Date.now() + Math.random().toString(36).substr(2, 9);
};

// @route POST /api/bookings/movie
// @desc Create movie ticket booking
exports.bookMovie = async (req, res, next) => {
  try {
    const { movieId, showId, seats, travelerDetails } = req.body;
    const userId = req.user.id;

    if (!movieId || !showId || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const show = movie.shows.find((s) => 
      s._id.toString() === showId || s._id.toString() === showId?.toString()
    );
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // Check seat availability
    const bookedSeats = show.bookedSeats || [];
    const unavailableSeats = seats.filter((seat) => bookedSeats.includes(seat));
    
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are already booked`,
      });
    }

    if (seats.length + bookedSeats.length > show.totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available',
      });
    }

    // Book seats
    show.bookedSeats = [...bookedSeats, ...seats];
    const totalAmount = show.price * seats.length;

    // Create booking
    const bookingId = generateBookingId();
    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Movie',
      itemId: movieId,
      seats,
      selectedSeatsCount: seats.length,
      pricePerSeat: show.price,
      totalAmount,
      bookingDate: new Date(),
      journeyDate: new Date(),
      departureLocation: show.theater,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      travelerDetails: travelerDetails?.passengers && Array.isArray(travelerDetails.passengers) ? travelerDetails.passengers : (Array.isArray(travelerDetails) ? travelerDetails : (travelerDetails ? [travelerDetails] : [])),
      itemSnapshot: {
        title: movie.name,
        subtitle: `${movie.language || 'Movie'}${movie.duration ? ` • ${movie.duration} min` : ''}`,
        posterUrl: movie.posterUrl,
        venue: show.theater,
        city: show.city,
        showTime: show.time,
        theatreCode: show.theatreCode,
        seatingCapacity: show.seatingCapacity || show.totalSeats,
        template: 'movie',
      },
    });

    await booking.save();
    await movie.save();

    // Add booking to user
    const user = await User.findById(userId);
    user.bookings.push(booking._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Movie booking successful!',
      booking: {
        bookingId,
        totalAmount,
        seats,
        movieName: movie.name,
        theater: show.theater,
        time: show.time,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/bookings/concert
// @desc Create concert booking
exports.bookConcert = async (req, res, next) => {
  try {
    const { concertId, category, seats, travelerDetails } = req.body;
    const userId = req.user.id;

    if (!concertId || !category || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const concert = await Event.findById(concertId);
    if (!concert) {
      return res.status(404).json({
        success: false,
        message: 'Concert not found',
      });
    }

    const ticketCategory = concert.ticketCategories.find((tc) => tc.name === category);
    if (!ticketCategory) {
      return res.status(404).json({
        success: false,
        message: 'Ticket category not found',
      });
    }

    const availableSeats = ticketCategory.totalSeats - ticketCategory.bookedSeats;
    if (seats.length > availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableSeats} seats available for ${category}`,
      });
    }

    const bookedSeatIds = ticketCategory.bookedSeatIds || [];
    const unavailableSeats = seats.filter((seat) => bookedSeatIds.includes(seat));
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are already booked`,
      });
    }

    // Update booking count
    ticketCategory.bookedSeats += seats.length;
    ticketCategory.bookedSeatIds = [...bookedSeatIds, ...seats];
    const totalAmount = ticketCategory.price * seats.length;

    // Create booking
    const bookingId = generateBookingId();
    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Concert',
      itemId: concertId,
      seats,
      selectedSeatsCount: seats.length,
      pricePerSeat: ticketCategory.price,
      totalAmount,
      bookingDate: new Date(),
      journeyDate: concert.date,
      departureLocation: concert.venue?.name,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      travelerDetails: travelerDetails?.passengers && Array.isArray(travelerDetails.passengers) ? travelerDetails.passengers : (Array.isArray(travelerDetails) ? travelerDetails : (travelerDetails ? [travelerDetails] : [])),
      itemSnapshot: {
        title: concert.name,
        subtitle: concert.eventType || 'Event',
        posterUrl: concert.posterUrl,
        venue: concert.venue?.name,
        city: concert.venue?.city,
        category,
        eventDate: concert.date,
        template: 'event',
      },
    });

    await booking.save();
    await concert.save();

    const user = await User.findById(userId);
    user.bookings.push(booking._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Concert booking successful!',
      booking: {
        bookingId,
        totalAmount,
        seats,
        concertName: concert.name,
        category,
        venue: concert.venue?.name,
        date: concert.date,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/bookings/bus
// @desc Create bus ticket booking
exports.bookBus = async (req, res, next) => {
  try {
    const { busId, routeId, seats, travelerDetails, source, destination } = req.body;
    const userId = req.user.id;

    if (!busId || !routeId || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    const route = bus.routes.find((r) => r._id.toString() === routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    const bookedSeats = route.bookedSeats || [];
    const unavailableSeats = seats.filter((seat) => bookedSeats.includes(seat));
    
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are already booked`,
      });
    }

    if (seats.length + bookedSeats.length > bus.totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available',
      });
    }

    route.bookedSeats = [...bookedSeats, ...seats];
    const totalAmount = route.fare * seats.length;

    const departureLocation = source || route.source.name;
    const arrivalLocation = destination || route.destination.name;

    const bookingId = generateBookingId();
    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Bus',
      itemId: busId,
      seats,
      selectedSeatsCount: seats.length,
      pricePerSeat: route.fare,
      totalAmount,
      bookingDate: new Date(),
      journeyDate: route.date,
      departureTime: route.departureTime,
      departureLocation,
      arrivalLocation,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      travelerDetails: travelerDetails?.passengers && Array.isArray(travelerDetails.passengers) ? travelerDetails.passengers : (Array.isArray(travelerDetails) ? travelerDetails : (travelerDetails ? [travelerDetails] : [])),
      itemSnapshot: {
        title: bus.operatorName || bus.busName,
        subtitle: `${bus.busName || 'Bus'} ${bus.busNumber ? `• ${bus.busNumber}` : ''}`,
        posterUrl: bus.images?.[0] || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
        busType: bus.busType,
        route: `${departureLocation} → ${arrivalLocation}`,
        template: 'bus',
      },
    });

    await booking.save();
    await bus.save();

    const user = await User.findById(userId);
    user.bookings.push(booking._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Bus booking successful!',
      booking: {
        bookingId,
        totalAmount,
        seats,
        busName: bus.busName,
        from: departureLocation,
        to: arrivalLocation,
        departureTime: route.departureTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/bookings/train
// @desc Create train ticket booking
exports.bookTrain = async (req, res, next) => {
  try {
    const { trainId, journeyDate, seats, travelerDetails, source, destination, coachNumber } = req.body;
    // allow unauthenticated bookings in development by falling back to null user
    const userId = req.user?.id || null;

    if (!trainId || !journeyDate || !seats || seats.length === 0 || !coachNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including coachNumber',
      });
    }

    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Train not found',
      });
    }

    const bookingId = generateBookingId();

    // Parse the updated train dataset rules
    let departureLocation = source || train.stationFrom;
    let arrivalLocation = destination || train.stationTo;
    let routeFare = train.routeFare || 1000; 

    // Find the chosen coach out of the train compositions
    const coach = train.coaches && train.coaches.find(c => c.coachNumber === coachNumber);
    if (!coach) {
      return res.status(400).json({
        success: false,
        message: 'Coach information not available',
      });
    }

    // Check seat availability
    const bookedSeats = coach.bookedSeats || [];
    const unavailableSeats = seats.filter((seat) => bookedSeats.includes(seat));

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are already booked`,     
      });
    }

    // Mark seats as booked
    coach.bookedSeats = [...bookedSeats, ...seats];

    const modifier = coach.priceModifier || 1.0;
    const totalAmount = Math.round(routeFare * modifier * seats.length);

    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Train',
      itemId: trainId,
      seats,
      selectedSeatsCount: seats.length,
      pricePerSeat: routeFare,
      totalAmount,
      bookingDate: new Date(),
      journeyDate: new Date(journeyDate),
      departureLocation,
      arrivalLocation,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      travelerDetails: travelerDetails?.passengers && Array.isArray(travelerDetails.passengers) ? travelerDetails.passengers : (travelerDetails ? [travelerDetails] : []),
      itemSnapshot: {
        title: train.trainName,
        subtitle: `Train #${train.trainNumber}`,
        posterUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
        coachNumber,
        coachType: coach.coachType,
        route: `${departureLocation} → ${arrivalLocation}`,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        template: 'train',
      },
    });

    await booking.save();
    await train.save();

    // attach booking to user if authenticated
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.bookings.push(booking._id);
        await user.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Train booking created successfully!',
      booking: {
        bookingId,
        _id: booking._id,
        totalAmount,
        seats,
        pricePerSeat: routeFare,
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        departureLocation: departureLocation,
        arrivalLocation: arrivalLocation,
        source: source || train.stationFrom,
        destination: destination || train.stationTo,
        departureTime: train.departureTime || 'N/A',
        arrivalTime: train.arrivalTime || 'N/A',
        duration: train.duration || 'N/A',
        distance: train.distance || 'N/A',
        journeyDate,
        coachNumber: coach?.coachNumber || 'A1',
        travelerDetails: travelerDetails?.passengers && Array.isArray(travelerDetails.passengers) ? travelerDetails.passengers : (travelerDetails ? [travelerDetails] : []),
      },
    });
  } catch (error) {
    console.error("TRAIN BOOKING ERROR: ", error);
    next(error);
  }
};

// @route POST /api/bookings/flight
// @desc Create flight booking
exports.bookFlight = async (req, res, next) => {
  try {
    const { flightId, routeId, classType, seats, travelerDetails, boardingPoint, dropPoint } = req.body;
    const userId = req.user.id;

    if (!flightId || !classType || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found',
      });
    }

    const route = routeId
      ? flight.routes.find((r) => r._id?.toString() === routeId?.toString())
      : flight.routes?.[0];
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    const flightClass = flight.classes.find((c) => c.className === classType);
    if (!flightClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const bookedSeats = route.bookedSeats || [];
    const unavailableSeats = seats.filter((seat) => bookedSeats.includes(seat));
    
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are already booked`,
      });
    }

    if (seats.length > flightClass.availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${flightClass.availableSeats} seats available in ${classType}`,
      });
    }

    route.bookedSeats = [...bookedSeats, ...seats];
    flightClass.availableSeats -= seats.length;
    const totalAmount = flightClass.price * seats.length;

    const bookingId = generateBookingId();
    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Flight',
      itemId: flightId,
      seats,
      selectedSeatsCount: seats.length,
      pricePerSeat: flightClass.price,
      totalAmount,
      bookingDate: new Date(),
      journeyDate: route.date,
      departureTime: route.departureTime,
      departureLocation: boardingPoint || route.source.name,
      arrivalLocation: dropPoint || route.destination.name,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      travelerDetails: travelerDetails?.passengers && Array.isArray(travelerDetails.passengers) ? travelerDetails.passengers : (Array.isArray(travelerDetails) ? travelerDetails : (travelerDetails ? [travelerDetails] : [])),
      itemSnapshot: {
        title: flight.airline?.name || 'Flight',
        subtitle: `${flight.flightNumber} • ${flight.aircraftType || classType}`,
        posterUrl: flight.airline?.logoUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
        classType,
        route: `${route.source?.code || route.source?.name} → ${route.destination?.code || route.destination?.name}`,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime,
        template: 'flight',
      },
    });

    await booking.save();
    await flight.save();

    const user = await User.findById(userId);
    user.bookings.push(booking._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Flight booking successful!',
      booking: {
        bookingId,
        totalAmount,
        seats,
        flightNumber: flight.flightNumber,
        from: route.source.name,
        to: route.destination.name,
        classType,
        departureTime: route.departureTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/bookings/car
// @desc Create car booking
exports.bookCar = async (req, res, next) => {
  try {
    const { carId, pickupLocation, dropLocation, pickupTime, dropTime, passengerCount } = req.body;
    const userId = req.user.id;

    if (!carId || !pickupLocation || !dropLocation || !pickupTime || !dropTime || !passengerCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

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
        message: `This car can accommodate maximum ${car.seatingCapacity} passengers`,
      });
    }

    // Calculate fare (simplified)
    const bookingId = generateBookingId();
    const fare = car.minimumFare || 80;
    const totalAmount = fare;

    const booking = new Booking({
      bookingId,
      userId,
      bookingType: 'Car',
      itemId: carId,
      selectedSeatsCount: passengerCount,
      pricePerSeat: fare,
      totalAmount,
      bookingDate: new Date(),
      journeyDate: new Date(pickupTime),
      departureTime: pickupTime,
      departureLocation: pickupLocation,
      arrivalLocation: dropLocation,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      itemSnapshot: {
        title: car.carModel,
        subtitle: `${car.manufacturer || 'Car'} • ${car.carType}`,
        posterUrl: car.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        registrationNumber: car.registrationNumber,
        seatingCapacity: car.seatingCapacity,
        fuelType: car.fuelType,
        transmissionType: car.transmissionType,
        color: car.color,
        template: 'car',
      },
    });

    await booking.save();
    car.bookings.push(booking._id);
    await car.save();

    const user = await User.findById(userId);
    user.bookings.push(booking._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Car booking successful!',
      booking: {
        bookingId,
        totalAmount,
        carModel: car.carModel,
        pickupLocation,
        dropLocation,
        pickupTime,
        dropTime,
        passengerCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings
// @desc Get all bookings for a user
exports.getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings/:bookingId
// @desc Get booking details
exports.getBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings/names/passengers
// @desc Get passenger names from user's bookings
exports.getPassengerNames = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's own name
    const user = await User.findById(userId).select('firstName lastName');
    const userNames = new Set();
    if (user) {
      userNames.add(`${user.firstName} ${user.lastName}`);
    }
    
    // Get all unique traveler names from user's bookings
    const bookings = await Booking.find({ userId }).select('travelerDetails');
    bookings.forEach(booking => {
      if (booking.travelerDetails && Array.isArray(booking.travelerDetails)) {
        booking.travelerDetails.forEach(traveler => {
          if (traveler.name) {
            userNames.add(traveler.name);
          }
        });
      }
    });
    
    return res.status(200).json({
      success: true,
      passengerNames: Array.from(userNames).sort()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch passenger names'
    });
  }
};

// @route POST /api/bookings/:bookingId/cancel
// @desc Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.status = 'Cancelled';
    booking.cancellationReason = reason;
    booking.cancellationDate = new Date();

    // Calculate refund (80% of total amount)
    booking.refundAmount = booking.totalAmount * 0.8;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount: booking.refundAmount,
    });
  } catch (error) {
    next(error);
  }
};
