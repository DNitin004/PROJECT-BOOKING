const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Flight = require('./models/Flight');
const connectDB = require('./config/database');

require('dotenv').config();

const CITIES = {
  'Delhi': { code: 'DEL', name: 'Delhi', airport: 'Indira Gandhi International Airport' },
  'Mumbai': { code: 'BOM', name: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl' },
  'Bangalore': { code: 'BLR', name: 'Bangalore', airport: 'Kempegowda Intl Airport' },
  'Bengaluru': { code: 'BLR', name: 'Bangalore', airport: 'Kempegowda Intl Airport' },
  'Kolkata': { code: 'CCU', name: 'Kolkata', airport: 'Netaji Subhas Chandra Bose Intl' },
  'Hyderabad': { code: 'HYD', name: 'Hyderabad', airport: 'Rajiv Gandhi Intl Airport' },
  'Chennai': { code: 'MAA', name: 'Chennai', airport: 'Chennai Intl Airport' },
  'Ahmedabad': { code: 'AMD', name: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel Intl' },
  'Pune': { code: 'PNQ', name: 'Pune', airport: 'Pune Airport' },
  'Jaipur': { code: 'JAI', name: 'Jaipur', airport: 'Jaipur Intl Airport' },
  'Goa': { code: 'GOI', name: 'Goa', airport: 'Dabolim Airport' },
  'Trivandrum': { code: 'TRV', name: 'Thiruvananthapuram', airport: 'Trivandrum Intl' }
};

// Realistic layover routing logic
const getRealisticLayover = (source, dest) => {
  const hubs = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU'];
  // Find a hub that isn't the source or dest
  const availableHubs = hubs.filter(h => h !== source.code && h !== dest.code);
  const randomHubCode = availableHubs[Math.floor(Math.random() * availableHubs.length)];
  const hubCity = Object.values(CITIES).find(c => c.code === randomHubCode);
  return hubCity;
};

// Generate realistic mock flight layout details based on class
const getLayout = (className) => {
  switch (className) {
    case 'First Class': return { layout: '1-1-1', rows: { start: 1, end: 4 }, totalSeats: 12 };
    case 'Business': return { layout: '2-2-2', rows: { start: 5, end: 12 }, totalSeats: 48 };
    case 'Economy': default: return { layout: '3-4-3', rows: { start: 13, end: 40 }, totalSeats: 280 };
  }
};

const mapStopsText = (stopsText, sourceInfo, destInfo) => {
  stopsText = String(stopsText).toLowerCase();
  
  if (stopsText.includes('zero') || stopsText === '0' || stopsText === 'non-stop') {
    return [];
  }
  
  const stopsCount = (stopsText.includes('two') || stopsText.includes('2')) ? 2 : 1;
  const generatedStops = [];
  
  let currentSource = sourceInfo;
  
  for (let i = 0; i < stopsCount; i++) {
    const hub = getRealisticLayover(currentSource, destInfo);
    generatedStops.push({
      name: hub.name,
      code: hub.code,
      airport: hub.airport,
      arrivalTime: '11:00 AM', // Simplified mockup for times
      departureTime: '12:30 PM'
    });
    currentSource = hub;
  }
  
  return generatedStops;
};

// Get standardized city object with fallback
const getCityInfo = (cityName) => {
  if (cityName && CITIES[cityName]) return CITIES[cityName];
  return {
    code: cityName.substring(0, 3).toUpperCase(),
    name: cityName,
    airport: `${cityName} International Airport`
  };
};

const importData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing Flight records to load new dataset...');
    await Flight.deleteMany({});
    
    const flightsMap = new Map();
    let rowsProcessed = 0;
    
    // We only want to load a finite distinct set (e.g. ~200 unique flights) to keep performance fast
    const LIMIT = 1500; // Increased sample limit to ensure rich dataset that populates frontend
    const csvPath = 'C:/Users/nithi/Downloads/airlines_flights_data.csv';
    const stream = fs.createReadStream(csvPath).pipe(csv());

    console.log(`Reading CSV from ${csvPath}...`);
    
    stream.on('data', (row) => {
        if (flightsMap.size >= LIMIT) {
           stream.destroy();
           return;
        }
        
        rowsProcessed++;
        const targetClass = typeof row.class === 'string' ? row.class : 'Economy';
        const price = parseInt(row.price) || 2500;
        
        const fKey = row.flight;
        if (!flightsMap.has(fKey)) {
          flightsMap.set(fKey, {
            flightNumber: row.flight,
            airline: { name: row.airline, logoUrl: `https://logo.clearbit.com/${row.airline.toLowerCase().replace(/\s/g, '')}.com` },
            aircraftType: 'Airbus A320neo',
            routes: [
              {
                source: getCityInfo(row.source_city),
                destination: getCityInfo(row.destination_city),
                departureTime: row.departure_time || '10:00 AM',
                arrivalTime: row.arrival_time || '1:30 PM',
                journeyDuration: `${row.duration || '2.5'} hrs`,
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                totalSeats: 340,
                totalAvailableSeats: 340,
                bookedSeats: [],
                _originalStops: row.stops
              }
            ],
            classes: [
              {
                className: 'Economy',
                price: price,
                ...getLayout('Economy'),
                availableSeats: getLayout('Economy').totalSeats
              }
            ],
            amenities: ['In-flight Entertainment', 'Meals Included', 'USB Power'],
            isActive: true,
          });
        } else {
          // Flight already created. If it's a different class (e.g., Business), add it!
          const existingFlight = flightsMap.get(fKey);
          const hasClass = existingFlight.classes.some(c => c.className === targetClass);
          if (!hasClass && (targetClass === 'Business' || targetClass === 'First Class')) {
             existingFlight.classes.push({
               className: targetClass,
               price: price,
               ...getLayout(targetClass),
               availableSeats: getLayout(targetClass).totalSeats
             });
          }
        }
      })
    const processFlights = async () => {
        console.log(`Processed CSV completely. Saving ${flightsMap.size} distinct realistic flights to database...`);
        
        const flightsArray = Array.from(flightsMap.values());
        
        flightsArray.forEach(flight => {
          flight.routes.forEach(r => {
             const stopsTxt = r._originalStops;
             // Helper logic inside mapStopsText generates the actual Stop objects
             const stopsCount = (stopsTxt && (stopsTxt.includes('two') || stopsTxt.includes('2'))) ? 2 : (stopsTxt && stopsTxt.includes('one')) ? 1 : 0;
             const generatedStops = [];
             let currentSource = r.source;
             
             for (let i = 0; i < stopsCount; i++) {
                const hubs = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU'];
                const availableHubs = hubs.filter(h => h !== currentSource.code && h !== r.destination.code);
                const randomHubCode = availableHubs[Math.floor(Math.random() * availableHubs.length)] || 'DEL';
                const hubObj = Object.values(CITIES).find(c => c.code === randomHubCode);
                
                if (hubObj) {
                  generatedStops.push({
                    name: hubObj.name,
                    code: hubObj.code,
                    airport: hubObj.airport,
                    arrivalTime: i === 0 ? '11:00 AM' : '2:00 PM', // simplified times
                    departureTime: i === 0 ? '12:30 PM' : '3:30 PM'
                  });
                  currentSource = hubObj;
                }
             }
             r.stops = generatedStops;
             delete r._originalStops;
          });
        });

        if (flightsArray.length > 0) {
           try {
             await Flight.insertMany(flightsArray);
             console.log(`✅ Successfully imported ${flightsArray.length} flights!`);
           } catch(e) {
             console.error('Mongo Error', e);
           }
        }
        
        mongoose.connection.close();
        process.exit();
    };

    stream.on('end', () => processFlights());
    stream.on('close', () => processFlights());
    stream.on('error', (err) => {
         console.error('Error reading the CSV:', err);
    });
      
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

importData();