const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: [true, 'Please provide flight number'],
      unique: true,
      trim: true,
    },
    airline: {
      name: String,
      logoUrl: String,
    },
    aircraftType: String,
    routes: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        source: {
          name: String,
          code: String,
          airport: String,
        },
        destination: {
          name: String,
          code: String,
          airport: String,
        },
        departureTime: String,
        arrivalTime: String,
        journeyDuration: String,
        date: Date,
        totalSeats: Number,
        totalAvailableSeats: Number,
        bookedSeats: [String],
      },
    ],
    classes: [
      {
        className: {
          type: String,
          enum: ['Economy', 'Business', 'First Class'],
          required: true,
        },
        price: Number,
        totalSeats: Number,
        availableSeats: Number,
      },
    ],
    amenities: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
