const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      required: [true, 'Please provide train number'],
      unique: true,
      trim: true,
    },
    trainName: {
      type: String,
      required: [true, 'Please provide train name'],
      trim: true,
    },
    runningDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    routes: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        source: {
          name: String,
          code: String,
        },
        destination: {
          name: String,
          code: String,
        },
        departureTime: String,
        arrivalTime: String,
        journeyDuration: String,
        distance: Number,
      },
    ],
    coaches: [
      {
        coachNumber: String,
        coachType: {
          type: String,
          enum: ['AC First', 'AC 2-Tier', 'AC 3-Tier', 'Sleeper', 'General'],
          required: true,
        },
        totalSeats: Number,
        availableSeats: Number,
        fareBySeatType: {
          window: Number,
          middle: Number,
          aisle: Number,
        },
      },
    ],
    journeys: [
      {
        date: Date,
        totalAvailableSeats: Number,
        bookedSeats: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

module.exports = mongoose.model('Train', trainSchema);
