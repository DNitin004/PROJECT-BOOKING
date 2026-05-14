// Script to import real train, station, and schedule data into MongoDB
// Place this file in na-ni-tickets/backend and run: node importRailwaysData.js

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Train = require('./models/Train');

const traininfoPath = path.join(__dirname, '../data/traininfo_insert_query.js');

function generateCoaches(trainName) {
  const name = (trainName || '').toUpperCase();
  const coaches = [];

  // Vande Bharat / Shatabdi / Tejas style (Chair Car)
  if (name.includes('VANDE BHARAT') || name.includes('SHATABDI') || name.includes('TEJAS')) {
    coaches.push({ coachNumber: 'E1', coachType: 'Exec Chair Car', totalSeats: 56, bookedSeats: [], priceModifier: 2.0 });
    for (let c = 1; c <= 8; c++) {
      coaches.push({ coachNumber: `C${c}`, coachType: 'AC Chair Car', totalSeats: 78, bookedSeats: [], priceModifier: 1.0 });
    }
  }
  // Rajdhani / Duronto style (Fully AC)
  else if (name.includes('RAJDHANI') || name.includes('DURONTO')) {
    coaches.push({ coachNumber: 'H1', coachType: 'AC First Class', totalSeats: 24, bookedSeats: [], priceModifier: 3.5 });
    for (let a = 1; a <= 3; a++) {
      coaches.push({ coachNumber: `A${a}`, coachType: 'AC 2-Tier', totalSeats: 48, bookedSeats: [], priceModifier: 2.0 });
    }
    for (let b = 1; b <= 7; b++) {
      coaches.push({ coachNumber: `B${b}`, coachType: 'AC 3-Tier', totalSeats: 64, bookedSeats: [], priceModifier: 1.5 });
    }
  }
  // Standard Express / Mail / Superfast (General, Sleeper, 3A, 2A)
  else {
    // 2 Unreserved
    for (let g = 1; g <= 2; g++) {
      coaches.push({ coachNumber: `GEN${g}`, coachType: 'General', totalSeats: 90, bookedSeats: [], priceModifier: 0.3 });
    }
    // 6 Sleeper
    for (let s = 1; s <= 6; s++) {
      coaches.push({ coachNumber: `S${s}`, coachType: 'Sleeper', totalSeats: 72, bookedSeats: [], priceModifier: 0.8 });
    }
    // 3 AC 3-Tier
    for (let b = 1; b <= 3; b++) {
      coaches.push({ coachNumber: `B${b}`, coachType: 'AC 3-Tier', totalSeats: 64, bookedSeats: [], priceModifier: 1.5 });
    }
    // 1 AC 2-Tier
    coaches.push({ coachNumber: 'A1', coachType: 'AC 2-Tier', totalSeats: 48, bookedSeats: [], priceModifier: 2.0 });
  }
  
  return coaches;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Read and parse data from traininfo_insert_query.js
  const fileContent = fs.readFileSync(traininfoPath, 'utf-8');
  const jsonContent = fileContent
    .replace('db.trains.insertMany(', '')
    .trim()
    .replace(/\);[\s\S]*$/, '');
  const traininfoData = JSON.parse(jsonContent);

  // Remove old trains
  await Train.deleteMany({});
  
  // Insert new trains
  const trainsToInsert = [];

  for (const t of traininfoData) {
    let routes = [];
    if (t.stops && t.stops.length >= 2) {
      const sourceSt = t.stops[0];
      const destSt = t.stops[t.stops.length - 1];
      const routeStops = t.stops.slice(1, -1).map(s => ({
        name: s.station_name,
        code: s.station_code,
        arrivalTime: s.arrival_time,
        departureTime: s.departure_time
      }));
      routes = [{
        source: { name: sourceSt.station_name, code: sourceSt.station_code },
        destination: { name: destSt.station_name, code: destSt.station_code },
        stops: routeStops,
        fare: t.stops.length * 25 // dynamic base fare based roughly on stops
      }];
    }
    
    const generatedCoaches = generateCoaches(t.train_name);
    
    trainsToInsert.push({
      trainNumber: String(t.train_no || `TRN-${Date.now()}-${Math.random()}`),
      trainName: t.train_name || `Train ${t.train_no || 'Unknown'}`,
      stationFrom: t.starts || 'UNKNOWN',
      stationTo: t.ends || 'UNKNOWN',
      trainRunsOnMon: 'Y',
      trainRunsOnTue: 'Y',
      trainRunsOnWed: 'Y',
      trainRunsOnThu: 'Y',
      trainRunsOnFri: 'Y',
      trainRunsOnSat: 'Y',
      trainRunsOnSun: 'Y',
      stationList: JSON.stringify(t.stops || []),
      routes: routes,
      coaches: generatedCoaches,
      isActive: true
    });
  }
  
  // Group into unique trains by trainNumber
  const uniqueTrainsMap = new Map();
  trainsToInsert.forEach(t => {
    if(!uniqueTrainsMap.has(t.trainNumber)) {
        uniqueTrainsMap.set(t.trainNumber, t);
    }
  });

  const uniqueTrains = Array.from(uniqueTrainsMap.values());
  console.log(`Prepared ${uniqueTrains.length} unique trains for insertion.`);

  // Insert in batches
  const batchSize = 1000;
  for (let i = 0; i < uniqueTrains.length; i += batchSize) {
    const batch = uniqueTrains.slice(i, i + batchSize);
    await Train.insertMany(batch);
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
  }
  
  console.log(`Inserted ${uniqueTrains.length} trains total.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
