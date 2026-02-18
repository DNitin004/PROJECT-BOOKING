const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide movie name'],
      trim: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    description: String,
    language: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    posterUrl: String,
    releaseDate: Date,
    duration: {
      type: Number,
      required: true, // in minutes
    },
    shows: [
      {
        time: String,
        theater: String,
        price: {
          type: Number,
          required: true,
        },
        totalSeats: {
          type: Number,
          default: 120,
        },
        bookedSeats: {
          type: [String],
          default: [],
        },
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

module.exports = mongoose.model('Movie', movieSchema);
