const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theatre name'],
      trim: true,
    },
    theatreCode: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    seatingCapacity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

theatreSchema.index({ name: 1, city: 1, theatreCode: 1 }, { unique: true });

theatreSchema.index({ city: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
