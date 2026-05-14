const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Flight = require('./models/Flight');

const airports = [
  { name: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport' },
  { name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International Airport' },
  { name: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport' },
  { name: 'Chennai', code: 'MAA', airport: 'Chennai International Airport' },
  { name: 'Kolkata', code: 'MAA', airport: 'Netaji Subhash Chandra Bose International Airport' }, // wait, code for Kolkata is CCU
  { name: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi International Airport' },
  { name: 'Ahmedabad', code: 'HYD', airport: 'Rajiv Gandhi International Airport' }, // AMD
  { name: 'Pune', code: 'PNQ', airport: 'Pune Airport' },
  { name: 'Dubai', code: 'DXB', airport: 'Dubai International Airport' },
  { name: 'London', code: 'LHR', airport: 'Heathrow Airport' },
  { name: 'Singapore', code: 'SIN', airport: 'Changi Airport' },
  { name: 'New York', code: 'JFK', airport: 'John F. Kennedy International Airport' },
  { name: 'Tokyo', code: 'HND', airport: 'Haneda Airport' }
];

// fix typos
airports[4] = { name: 'Kolkata', code: 'CCU', airport: 'Netaji Subhash Chandra Bose International Airport' };
airports[6] = { name: 'Ahmedabad', code: 'AMD', airport: 'Sardar Vallabhbhai Patel International Airport' };

const airlines = [
  { name: 'Air India', prefix: 'AI', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/g5s14oioo9ndx8j7o069' },
  { name: 'IndiGo', prefix: '6E', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/d4v6f8x0c2a4h5n1b8m9' },
  { name: 'Vistara', prefix: 'UK', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/a8r5i2t0p6w3z9e7c5x1' },
  { name: 'SpiceJet', prefix: 'SG', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/spicejet_logo' },
  { name: 'Emirates', prefix: 'EK', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/a3w0u4y7d2p0n4g6k8l9' },
  { name: 'Singapore Airlines', prefix: 'SQ', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/singapore_airlines_logo' },
  { name: 'British Airways', prefix: 'BA', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/british_airways_logo' }
];

const planeTypes = [ 'Boeing 777-300ER', 'Boeing 787-9 Dreamliner', 'Airbus A380-800', 'Airbus A320neo', 'Boeing 737 MAX' ];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const flightsData = [];
let flightIdCounter = 1000;

for (let i = 0; i < 150; i++) {
  const airline = airlines[randomInt(0, airlines.length - 1)];
  const aircraftType = planeTypes[randomInt(0, planeTypes.length - 1)];
  const flightNumber = `${airline.prefix}-${randomInt(100, 9999)}`;
  
  // Choose random route
  let sourceIdx = randomInt(0, airports.length - 1);
  let destIdx = randomInt(0, airports.length - 1);
  while(sourceIdx === destIdx) {
    destIdx = randomInt(0, airports.length - 1);
  }
  const source = airports[sourceIdx];
  const destination = airports[destIdx];
  
  // Decide if there's a stop (30% chance for domestic, 70% for international)
  const isIntl = (sourceIdx > 7 || destIdx > 7);
  const hasStop = isIntl ? (Math.random() > 0.3) : (Math.random() > 0.7);
  let stops = [];
  if (hasStop) {
    let stopIdx = randomInt(0, airports.length - 1);
    while(stopIdx === sourceIdx || stopIdx === destIdx) {
      stopIdx = randomInt(0, airports.length - 1);
    }
    const stopAirport = airports[stopIdx];
    // Create stop object
    stops.push({
      name: stopAirport.name,
      code: stopAirport.code,
      airport: stopAirport.airport,
      arrivalTime: `${randomInt(1, 12).toString().padStart(2, '0')}:00`,
      departureTime: `${randomInt(13, 23).toString().padStart(2, '0')}:30`
    });
  }

  // Generate random times
  const depH = randomInt(0, 23).toString().padStart(2, '0');
  const depM = randomInt(0, 59).toString().padStart(2, '0');
  const arrH = randomInt(0, 23).toString().padStart(2, '0');
  const arrM = randomInt(0, 59).toString().padStart(2, '0');
  
  const depTime = `${depH}:${depM}`;
  const arrTime = `${arrH}:${arrM}`;
  
  const durH = randomInt(1, 14);
  const durM = randomInt(0, 59);
  const duration = `${durH}h ${durM}m`;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + randomInt(1, 30));

  const classes = [];
  if (aircraftType.includes('A320') || aircraftType.includes('737')) {
    classes.push({ className: 'Economy', price: randomInt(3000, 8000), totalSeats: 180, availableSeats: 180, layout: '3-3', rows: { start: 1, end: 30 } });
  } else {
    classes.push({ className: 'First Class', price: randomInt(50000, 150000), totalSeats: 12, availableSeats: randomInt(2, 12), layout: '1-2-1', rows: { start: 1, end: 3 } });
    classes.push({ className: 'Business', price: randomInt(20000, 60000), totalSeats: 36, availableSeats: randomInt(10, 36), layout: '2-2-2', rows: { start: 4, end: 9 } });
    classes.push({ className: 'Economy', price: randomInt(5000, 15000), totalSeats: 250, availableSeats: randomInt(50, 250), layout: '3-4-3', rows: { start: 10, end: 40 } });
  }
  
  let totalSeats = 0;
  let totalAvailableSeats = 0;
  classes.forEach(c => {
    totalSeats += c.totalSeats;
    totalAvailableSeats += c.availableSeats;
  });

  flightsData.push({
    flightNumber,
    airline: { name: airline.name, logoUrl: airline.logoUrl },
    aircraftType,
    amenities: ['In-flight Entertainment', 'Meals', 'WiFi'],
    classes,
    routes: [
      {
        source: { name: source.name, code: source.code, airport: source.airport },
        destination: { name: destination.name, code: destination.code, airport: destination.airport },
        stops: stops,
        departureTime: depTime,
        arrivalTime: arrTime,
        journeyDuration: duration,
        date: targetDate,
        totalSeats,
        totalAvailableSeats,
        bookedSeats: []
      }
    ]
  });
}

async function seedLargeFlights() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await Flight.deleteMany({});
    console.log('Cleared existing flights.');

    await Flight.insertMany(flightsData);
    console.log(`Successfully generated and inserted ${flightsData.length} comprehensive flights!`);        

    process.exit(0);
  } catch (error) {
    console.error('Error seeding flights data:', error);
    process.exit(1);
  }
}

seedLargeFlights();
