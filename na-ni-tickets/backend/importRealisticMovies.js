const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Movie = require('./models/Movie');
require('dotenv').config();

const realMovies = [
  { name: 'Pushpa 2: The Rule', genre: ['Action', 'Thriller'], language: 'Telugu (Pan-India)', rating: 9.1, duration: 180, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/11/Pushpa_2-_The_Rule.jpg', description: 'The clash between Pushpa Raj and Bhanwar Singh Shekhawat continues.' },
  { name: 'Kalki 2898 AD', genre: ['Sci-Fi', 'Action'], language: 'Telugu (Pan-India)', rating: 8.5, duration: 181, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD_poster.jpg', description: 'A modern-day avatar of Vishnu descends to Earth to protect the world.' },
  { name: 'Singham Again', genre: ['Action', 'Crime'], language: 'Hindi', rating: 8.2, duration: 160, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Singham_Again_poster.jpg', description: 'Bajirao Singham returns to battle terrorism.' },
  { name: 'Devara: Part 1', genre: ['Action', 'Drama'], language: 'Telugu', rating: 8.4, duration: 175, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6a/Devara_Part_1.jpg', description: 'An epic action saga set against coastal lands.' },
  { name: 'Stree 2', genre: ['Horror', 'Comedy'], language: 'Hindi', rating: 8.8, duration: 145, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/52/Stree_2.jpg', description: 'The town of Chanderi is haunted again.' },
  { name: 'Kanguva', genre: ['Action', 'Fantasy'], language: 'Tamil', rating: 8.7, duration: 170, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/36/Kanguva_poster.jpg', description: 'A warriors journey spanning centuries.' },
  { name: 'Fighter', genre: ['Action', 'Thriller'], language: 'Hindi', rating: 7.9, duration: 166, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Fighter_2024_film_poster.jpg', description: 'Top IAF aviators come together in the face of imminent danger.' },
  { name: 'Manjummel Boys', genre: ['Comedy', 'Survival'], language: 'Malayalam', rating: 8.9, duration: 135, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Manjummel_Boys_poster.jpg', description: 'A group of friends gets trapped in the Guna Caves.' },
  { name: 'Amaran', genre: ['Action', 'Biopic'], language: 'Tamil', rating: 8.6, duration: 160, posterUrl: 'https://upload.wikimedia.org/wikipedia/en/0/00/Amaran_poster.jpg', description: 'The life of Major Mukund Varadarajan.' }
];

const generateShowtimes = () => {
    const defaultTimes = ['09:30 AM', '12:45 PM', '04:00 PM', '07:15 PM', '10:30 PM'];
    const showCount = Math.floor(Math.random() * 3) + 3;
    return defaultTimes.slice(0, showCount);
};

const run = async () => {
  try {
    await connectDB();
    console.log('Clearing old movie data...');
    await Movie.deleteMany({});

    console.log('Loading real theater data from OpenStreetMap...');
    const dataRaw = fs.readFileSync('../data/cinemas.json', 'utf8');
    const geojsonData = JSON.parse(dataRaw);
    
    const theatersByCity = {};
    geojsonData.features.forEach(feature => {
      const props = feature.properties;
      if (props && props.amenity === 'cinema' && props.name) {
        const loc = props['addr:city'] || props['addr:town'] || props['addr:village'] || props['addr:district'];
        if (loc) {
            const city = loc.trim();
            const name = props.name.trim();
            if (!theatersByCity[city]) theatersByCity[city] = [];
            if (!theatersByCity[city].includes(name)) theatersByCity[city].push(name);
        }
      }
    });

    const cities = Object.keys(theatersByCity);
    console.log('Found ' + cities.length + ' unique cities/towns/villages in India with active theaters.');

    let totalShows = 0;
    
    for (let movieData of realMovies) {
      const movie = new Movie(movieData);
      movie.shows = [];

      const playingCities = cities.filter(() => Math.random() > 0.4);

      for (const city of playingCities) {
        const theatersInCity = theatersByCity[city];
        
        const selectedTheaters = theatersInCity.sort(() => 0.5 - Math.random()).slice(0, 4);

        for (const theater of selectedTheaters) {
            const showtimes = generateShowtimes();
            for (const time of showtimes) {
                movie.shows.push({
                    time: time,
                    theater: theater,
                    city: city,
                    price: 150 + Math.floor(Math.random() * 200),
                    totalSeats: 150,
                    bookedSeats: []
                });
                totalShows++;
            }
        }
      }
      
      console.log('Saving movie: ' + movie.name + ' with ' + movie.shows.length + ' shows across India...');
      await movie.save();
    }

    console.log('\nSuccessfully populated MongoDB!');
    console.log('Added ' + realMovies.length + ' real movies.');
    console.log('Added ' + totalShows + ' total showtimes across real theaters in India!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during realistic seeding:', error);
    process.exit(1);
  }
};

run();