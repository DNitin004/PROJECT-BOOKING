const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['Movie', 'Concert', 'Bus', 'Train', 'Flight', 'Car'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Can reference Movie, Concert, Bus, Train, Flight, or Car
    },
    travelerDetails: [
      {
        name: String,
        age: Number,
        gender: String,
        phoneNumber: String,
      },
    ],
    seats: [String],
    selectedSeatsCount: {
      type: Number,
      required: true,
    },
    pricePerSeat: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingDate: Date,
    journeyDate: Date,
    departureTime: String,
    departureLocation: String,
    arrivalLocation: String,
    status: {
      type: String,
      enum: ['Confirmed', 'Pending', 'Cancelled'],
      default: 'Pending',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    cancellationReason: String,
    cancellationDate: Date,
    refundAmount: Number,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: Date,
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
