const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Movie = require('./models/Movie');
require('dotenv').config();

const importData = async () => {
  try {
    await connectDB();
    
    const dataRaw = fs.readFileSync('../data/cinemas.json', 'utf8');
    const geojsonData = JSON.parse(dataRaw);
    
    const theatersByCity = {};
    
    geojsonData.features.forEach(feature => {
      const props = feature.properties;
      if (props && props.amenity === 'cinema' && props.name) {
        const city = props['addr:city'] || props['addr:town'] || props['addr:village'] || props['addr:district'] || 'Unknown City';
        const name = props.name;
        if (!theatersByCity[city]) theatersByCity[city] = [];
        theatersByCity[city].push(name);
      }
    });
    
    const movies = await Movie.find({});
    if (movies.length === 0) {
      console.log('No movies found to add shows to!');
      process.exit();
    }
    
    let totalShowsAdded = 0;
    const times = ['09:00 AM', '12:30 PM', '04:00 PM', '07:30 PM', '10:30 PM'];
    
    for (let movie of movies) {
      let newShows = [];
      for (const [city, theaters] of Object.entries(theatersByCity)) {
        theaters.forEach((theaterName, idx) => {
          if (idx > 2) return; // limit to 3 theaters per city to avoid DB bloat
          times.forEach((t, i) => {
            if (Math.random() > 0.3) { // 70% chance to have a show
              newShows.push({
                time: t,
                theater: theaterName,
                city: city,
                price: 150 + Math.floor(Math.random() * 150),
                totalSeats: 150,
                bookedSeats: []
              });
            }
          });
        });
      }
      movie.shows.push(...newShows);
      await movie.save();
      totalShowsAdded += newShows.length;
    }
    
    console.log('Successfully added ' + totalShowsAdded + ' shows based on GeoJSON theaters!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();