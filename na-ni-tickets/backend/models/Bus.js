const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Please provide bus number'],
      unique: true,
      trim: true,
    },
    busName: {
      type: String,
      required: true,
    },
    operatorName: {
      type: String,
      required: true,
    },
    busType: {
      type: String,
      enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'],
      required: true,
    },
    totalSeats: {
      type: Number,
      default: 42,
    },
    routes: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        source: {
          name: String,
          city: String,
        },
        destination: {
          name: String,
          city: String,
        },
        departureTime: String,
        arrivalTime: String,
        journeyDuration: String,
        fare: {
          type: Number,
          required: true,
        },
        bookedSeats: {
          type: [String],
          default: [],
        },
        date: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    amenities: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
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

module.exports = mongoose.model('Bus', busSchema);
