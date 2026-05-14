const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Flight = require('./models/Flight');

const flightsData = [
  {
    flightNumber: 'AI-101',
    airline: { name: 'Air India', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/g5s14oioo9ndx8j7o069' },
    aircraftType: 'Boeing 777-300ER',
    amenities: ['In-flight Entertainment', 'Meals', 'WiFi', 'Power Outlets'],
    classes: [
      { className: 'First Class', price: 35000, totalSeats: 16, availableSeats: 16, layout: '1-2-1', rows: { start: 1, end: 4 } },
      { className: 'Business', price: 15000, totalSeats: 24, availableSeats: 24, layout: '2-2-2', rows: { start: 5, end: 8 } },
      { className: 'Economy', price: 5000, totalSeats: 260, availableSeats: 260, layout: '3-4-3', rows: { start: 10, end: 35 } }
    ],
    routes: [
      {
        source: { name: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport' },
        destination: { name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International Airport' },
        departureTime: '08:00',
        arrivalTime: '10:15',
        journeyDuration: '2h 15m',
        date: new Date('2026-04-10'),
        totalSeats: 300,
        totalAvailableSeats: 300,
        bookedSeats: ['1A', '10C', '12F']
      }
    ]
  },
  {
    flightNumber: 'EK-500',
    airline: { name: 'Emirates', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/a3w0u4y7d2p0n4g6k8l9' },
    aircraftType: 'Airbus A380-800',
    amenities: ['In-flight Entertainment', 'Premium Lounge', 'WiFi', 'Bar'],
    classes: [
      { className: 'First Class', price: 120000, totalSeats: 14, availableSeats: 14, layout: '1-2-1', rows: { start: 1, end: 4 } },
      { className: 'Business', price: 65000, totalSeats: 76, availableSeats: 76, layout: '1-2-1', rows: { start: 6, end: 24 } },
      { className: 'Economy', price: 22000, totalSeats: 427, availableSeats: 426, layout: '3-4-3', rows: { start: 40, end: 82 } }
    ],
    routes: [
      {
        source: { name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International Airport' },
        destination: { name: 'Dubai', code: 'DXB', airport: 'Dubai International Airport' },
        departureTime: '15:10',
        arrivalTime: '16:55',
        journeyDuration: '3h 15m',
        date: new Date('2026-04-12'),
        totalSeats: 517,
        totalAvailableSeats: 516,
        bookedSeats: ['42B']
      }
    ]
  },
  {
    flightNumber: '6E-786',
    airline: { name: 'IndiGo', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/d4v6f8x0c2a4h5n1b8m9' },
    aircraftType: 'Airbus A320neo',
    amenities: ['Snacks (Purchase)', 'Comfort Seats'],
    classes: [
      { className: 'Economy', price: 4200, totalSeats: 180, availableSeats: 180, layout: '3-3', rows: { start: 1, end: 30 } }
    ],
    routes: [
      {
        source: { name: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport' },
        destination: { name: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport' },
        departureTime: '06:05',
        arrivalTime: '08:50',
        journeyDuration: '2h 45m',
        date: new Date('2026-04-15'),
        totalSeats: 180,
        totalAvailableSeats: 180,
        bookedSeats: []
      }
    ]
  },
  {
    flightNumber: 'UK-820',
    airline: { name: 'Vistara', logoUrl: 'https://images.ixigo.com/image/upload/f_auto,q_auto/a8r5i2t0p6w3z9e7c5x1' },
    aircraftType: 'Boeing 787-9 Dreamliner',
    amenities: ['In-flight Entertainment', 'Hot Meals', 'WiFi'],
    classes: [
      { className: 'Business', price: 22000, totalSeats: 30, availableSeats: 30, layout: '1-2-1', rows: { start: 1, end: 8 } },
      { className: 'Economy', price: 6800, totalSeats: 269, availableSeats: 269, layout: '3-3-3', rows: { start: 10, end: 39 } }
    ],
    routes: [
      {
        source: { name: 'Chennai', code: 'MAA', airport: 'Chennai International Airport' },
        destination: { name: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport' },
        departureTime: '19:30',
        arrivalTime: '22:15',
        journeyDuration: '2h 45m',
        date: new Date('2026-04-16'),
        totalSeats: 299,
        totalAvailableSeats: 299,
        bookedSeats: []
      }
    ]
  }
];

async function seedFlights() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await Flight.deleteMany({});
    console.log('Cleared existing flights.');

    await Flight.insertMany(flightsData);
    console.log(`Successfully inserted ${flightsData.length} flights!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding flights data:', error);
    process.exit(1);
  }
}

seedFlights();
