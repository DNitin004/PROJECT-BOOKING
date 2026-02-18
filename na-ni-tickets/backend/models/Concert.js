const mongoose = require('mongoose');

const concertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide concert name'],
      trim: true,
    },
    artists: [
      {
        name: {
          type: String,
          required: true,
        },
        image: String,
      },
    ],
    description: String,
    date: {
      type: Date,
      required: true,
    },
    venue: {
      name: {
        type: String,
        required: true,
      },
      address: String,
      city: String,
    },
    posterUrl: String,
    totalCapacity: {
      type: Number,
      default: 3000,
    },
    ticketCategories: [
      {
        name: {
          type: String,
          enum: ['Gold', 'Premium', 'Silver'],
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        totalSeats: {
          type: Number,
          required: true,
        },
        bookedSeats: {
          type: Number,
          default: 0,
        },
        seatLayout: [String], // Array of seat IDs
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

module.exports = mongoose.model('Concert', concertSchema);
