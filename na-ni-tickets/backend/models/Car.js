const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Please provide registration number'],
      unique: true,
      trim: true,
    },
    carModel: {
      type: String,
      required: [true, 'Please provide car model'],
      trim: true,
    },
    manufacturer: String,
    carType: {
      type: String,
      enum: ['Economy', 'Comfort', 'Premium', 'XL'],
      required: true,
    },
    seatingCapacity: {
      type: Number,
      required: true,
    },
    color: String,
    transmissionType: {
      type: String,
      enum: ['Automatic', 'Manual'],
    },
    airconditioned: Boolean,
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'CNG', 'Electric'],
    },
    pricePerKm: {
      type: Number,
      required: true,
    },
    minimumFare: {
      type: Number,
      default: 80,
    },
    images: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarOwner',
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarBooking',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
carSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Car', carSchema);
