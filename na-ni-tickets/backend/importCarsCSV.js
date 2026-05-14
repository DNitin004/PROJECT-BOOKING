
require('dotenv').config();

const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const Car = require('./models/Car');
const connectDB = require('./config/database');

async function importCars() {
  await connectDB();
  console.log('Connected to DB');

  const fileStream = fs.createReadStream('C:\\\\Users\\\\nithi\\\\Downloads\\\\cars.csv');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isHeader = true;
  const carsToInsert = [];
  let regCounter = 1000;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const cols = line.split(',');
    if (cols.length < 20) continue; 

    const make = cols[0];
    const model = cols[1];
    const variant = cols[2];
    const fuelTypeStr = cols[13] || 'Petrol';
    const bodyType = cols[17] || 'Sedan';
    const seatingCap = parseInt(cols[44]) || 5;
    const transmission = cols[46] === 'Automatic' ? 'Automatic' : 'Manual';     

    let img = 'https://imgd.aeplcdn.com/664x374/n/cw/ec/40087/tata-tiago-right-front-three-quarter0.jpeg?q=80';
    if(make.toLowerCase().includes('maruti')) img='https://stimg.cardekho.com/images/carexteriorimages/630x420/Maruti/Swift/9327/1698305018617/front-left-side-47.jpg?imwidth=420&impolicy=resize';
    if(bodyType.toLowerCase().includes('suv')) img='https://stimg.cardekho.com/images/carexteriorimages/630x420/Mahindra/Scorpio-N/10817/1690351800434/front-left-side-47.jpg?impolicy=resize&imwidth=420';
    
    // ola style car types
    let carType = 'Economy';
    if (bodyType.includes('Sedan')) carType = 'Comfort';
    if (bodyType.includes('SUV')) carType = 'XL';
    if (make.includes('Audi') || make.includes('BMW') || make.includes('Mercedes')) carType = 'Premium';

    let fuelType = 'Petrol';
    if (fuelTypeStr.includes('Diesel')) fuelType = 'Diesel';
    if (fuelTypeStr.includes('CNG')) fuelType = 'CNG';
    if (fuelTypeStr.includes('Electric')) fuelType = 'Electric';

    let baseFare = Math.floor(Math.random() * (20 - 10) + 10);
    if(carType === 'Premium') baseFare = 40;
    if(carType === 'XL') baseFare = 20;

    carsToInsert.push({
      registrationNumber: make.substring(0,3).toUpperCase() + '-' + regCounter++,
      carModel: make + ' ' + model + ' ' + variant,
      manufacturer: make,
      carType,
      seatingCapacity: seatingCap,
      transmissionType: transmission,
      fuelType,
      pricePerKm: baseFare,
      minimumFare: baseFare * 10,
      airconditioned: true,
      images: [img], currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] }
    });
  }

  try {
    await Car.deleteMany({});
    console.log('Cleared existing cars');

    const BATCH_SIZE = 100;
    let total = 0;
    for(let i = 0; i < carsToInsert.length; i += BATCH_SIZE) {
        await Car.insertMany(carsToInsert.slice(i, i+BATCH_SIZE));
        total += BATCH_SIZE;
        console.log('Inserted ' + Math.min(total, carsToInsert.length) + '...');
    }

    console.log('Successfully inserted ' + carsToInsert.length + ' cars!');
  } catch (error) {
    console.error('Error inserting:', error);
  } finally {
    mongoose.connection.close();
  }
}

importCars();

