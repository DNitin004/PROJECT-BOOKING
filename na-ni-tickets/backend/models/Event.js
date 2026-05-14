const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide event name'],
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['Concert', 'Sports', 'Comedy', 'Other'],
      default: 'Concert'
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
        bookedSeatIds: {
          type: [String],
          default: [],
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

eventSchema.index({ isActive: 1 });

module.exports = mongoose.model('Event', eventSchema);
