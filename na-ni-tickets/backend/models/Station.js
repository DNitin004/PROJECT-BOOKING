const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String },
  zone: { type: String },
  address: { type: String }
});

module.exports = mongoose.model('Station', stationSchema);
