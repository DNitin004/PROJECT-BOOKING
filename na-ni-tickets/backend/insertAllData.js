const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importAll() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB!');

    const db = mongoose.connection.db;

    // Drop indexes from trains to avoid the 'trainNumber_1' duplicate key error entirely
    // Our old mongoose schema created unique indexes on fields we no longer use in raw ingestion.
    try {
        await db.collection('trains').dropIndexes();
    } catch(e) {
        // ignore if drop fails or no indexes exist
    }

    // 1. Insert Trains
    console.log('Reading trains.json...');
    const trainsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/trains.json'), 'utf8'));
    const trains = trainsRaw.trains || trainsRaw; // Handle both wrapper styles
    if (trains.length > 0) {
      await db.collection('trains').deleteMany({});
      
      // Insert in batches to prevent memory limits
      const batchSize = 2000;
      for (let i = 0; i < trains.length; i += batchSize) {
        await db.collection('trains').insertMany(trains.slice(i, i + batchSize));
      }
      console.log(`✅ Successfully inserted ${trains.length} trains.`);
    }

    // 2. Insert Stations
    console.log('Reading stations.json...');
    const stationsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/stations.json'), 'utf8'));
    let stations = [];
    if (stationsRaw.features) {
      stations = stationsRaw.features.map(f => f.properties);
    } else if (Array.isArray(stationsRaw)) {
      stations = stationsRaw;
    }
    
    if (stations.length > 0) {
      await db.collection('stations').deleteMany({});
      const batchSize = 2000;
      for (let i = 0; i < stations.length; i += batchSize) {
        await db.collection('stations').insertMany(stations.slice(i, i + batchSize));
      }
      console.log(`✅ Successfully inserted ${stations.length} stations.`);
    }

    // 3. Insert Schedules
    console.log('Reading schedules.json...');
    const schedules = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/schedules.json'), 'utf8'));
    if (schedules.length > 0) {
      await db.collection('schedules').deleteMany({});
      const batchSize = 5000;
      for (let i = 0; i < schedules.length; i += batchSize) {
        await db.collection('schedules').insertMany(schedules.slice(i, i + batchSize));
      }
      console.log(`✅ Successfully inserted ${schedules.length} schedule records.`);
    }

    console.log('🎉 All dataset imports completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importAll();
