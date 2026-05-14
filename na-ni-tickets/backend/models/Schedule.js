const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  train_number: { type: String, required: true },
  train_name: { type: String },
  station_code: { type: String, required: true },
  station_name: { type: String },
  day: { type: Number },
  arrival: { type: String },
  departure: { type: String },
  sequence_id: { type: Number }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
