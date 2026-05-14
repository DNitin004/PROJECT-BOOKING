const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, unique: true },
    trainName: { type: String, required: true },
    stationFrom: String,
    stationTo: String,
    
    // Running days as per your JSON keys
    trainRunsOnMon: { type: String, default: 'N' },
    trainRunsOnTue: { type: String, default: 'N' },
    trainRunsOnWed: { type: String, default: 'N' },
    trainRunsOnThu: { type: String, default: 'N' },
    trainRunsOnFri: { type: String, default: 'N' },
    trainRunsOnSat: { type: String, default: 'N' },
    trainRunsOnSun: { type: String, default: 'N' },

    // The JSON contains the station list as a stringified array
    stationList: { type: String, default: "[]" },

    // Routes with stops (source, intermediate stops, destination)
    routes: [
      {
        source: {
          name: String,
          code: String
        },
        destination: {
          name: String,
          code: String
        },
        stops: [  // intermediate stops between source and destination
          {
            name: String,
            code: String,
            arrivalTime: String,
            departureTime: String
          }
        ],
        departureTime: String,
        arrivalTime: String,
        duration: String,  // e.g., "12h 30m"
        distance: Number,  // in km
        fare: Number       // base fare for this route
      }
    ],

    // Booking related fields
    coaches: [
      {
        coachNumber: String,
        coachType: String,
        totalSeats: Number,
        bookedSeats: [String],
        priceModifier: { type: Number, default: 1 } // Allows frontend to adjust real ticket price by coach multiplier
      }
    ],
    isActive: { type: Boolean, default: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to convert individual "Y"/"N" fields into an array like the UI expects
trainSchema.virtual('runningDays').get(function () {
  const days = [];
  if (this.trainRunsOnMon === 'Y') days.push('Monday');
  if (this.trainRunsOnTue === 'Y') days.push('Tuesday');
  if (this.trainRunsOnWed === 'Y') days.push('Wednesday');
  if (this.trainRunsOnThu === 'Y') days.push('Thursday');
  if (this.trainRunsOnFri === 'Y') days.push('Friday');
  if (this.trainRunsOnSat === 'Y') days.push('Saturday');
  if (this.trainRunsOnSun === 'Y') days.push('Sunday');
  return days;
});

module.exports = mongoose.model('Train', trainSchema);
