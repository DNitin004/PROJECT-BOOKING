const connectDB = require('./config/database');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
require('dotenv').config();
const xlsx = require('xlsx');
const path = require('path');
const axios = require('axios');

const movieSeeds = [
  {
    name: 'Dacoit',
    genre: ['Action', 'Drama'],
    language: 'Telugu',
    rating: 8.4,
    duration: 152,
    description: 'An action drama about revenge, loyalty, and betrayal.',
  },
  {
    name: 'LIK: Love Insurance Kompany',
    genre: ['Romance', 'Comedy'],
    language: 'Telugu',
    rating: 7.7,
    duration: 146,
    description: 'A romantic comedy set around a quirky insurance setup.',
  },
  {
    name: 'Raakasa',
    genre: ['Thriller', 'Mystery'],
    language: 'Telugu',
    rating: 8.0,
    duration: 144,
    description: 'A suspense thriller where secrets unfold in dark twists.',
  },
  {
    name: 'Dhurandhar The Revenge',
    genre: ['Action', 'Crime'],
    language: 'Telugu',
    rating: 7.9,
    duration: 150,
    description: 'A revenge saga featuring an intense city underworld clash.',
  },
  {
    name: 'Biker',
    genre: ['Action', 'Sport'],
    language: 'Telugu',
    rating: 7.6,
    duration: 138,
    description: 'A high-adrenaline racing action drama.',
  },
  {
    name: 'Project Hail Mary',
    genre: ['Sci-Fi', 'Adventure'],
    language: 'English',
    rating: 8.5,
    duration: 142,
    description: 'A sci-fi survival story where one astronaut saves humanity.',
  },
  {
    name: 'Pushpa 2: The Rule',
    genre: ['Action', 'Thriller'],
    language: 'Telugu',
    rating: 8.8,
    duration: 180,
    description: 'Pushpa Raj returns in a high-stakes action thriller.',
  },
  {
    name: 'Kalki 2898 AD',
    genre: ['Sci-Fi', 'Action'],
    language: 'Telugu',
    rating: 8.5,
    duration: 181,
    description: 'A futuristic action epic based on mythology and science fiction.',
  },
];

const defaultShowSlots = ['11:00 AM', '02:00 PM', '06:00 PM', '09:00 PM'];

const posterFallbacks = {
  'Dacoit': 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/dacoit-et00418119-1730881881.jpg',
  'LIK: Love Insurance Kompany': 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/lik-love-insurance-kompany-et00405822-1721894451.jpg',
  'Raakasa': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
  'Dhurandhar The Revenge': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80',
  'Biker': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
  'Project Hail Mary': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
  'Pushpa 2: The Rule': 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/pushpa-2-the-rule-et00385136-1712643501.jpg',
  'Kalki 2898 AD': 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/kalki-2898-ad-et00352941-1718275859.jpg',
};

const pickRandom = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const readCell = (row, keys = []) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && `${row[key]}`.trim() !== '') {
      return `${row[key]}`.trim();
    }
  }
  return '';
};

const parseTheatresFromExcel = (rows) => {
  const theatreMap = new Map();
  let currentState = '';

  rows.forEach((row) => {
    const slNo = readCell(row, ['SL NO', 'Sl No', 'SLNO']);
    if (slNo && /^STATE\s*-\s*/i.test(slNo)) {
      currentState = slNo.replace(/^STATE\s*-\s*/i, '').trim();
      return;
    }

    const city = readCell(row, ['CITY', 'City']);
    const name = readCell(row, ['THEATRE NAME', 'THEATER NAME', 'THEATRE', 'THEATRE_NAME']);
    if (!city || !name) return;

    const district = readCell(row, ['DISTRICT', 'District']);
    const theatreCode = readCell(row, ['THEATRE CODE', 'THEATER CODE', 'THEATRE_CODE']);
    const seating = Number(readCell(row, ['SEATING', 'SEAT COUNT', 'SEATS'])) || 0;

    const dedupeKey = `${name.toLowerCase()}::${city.toLowerCase()}::${theatreCode.toLowerCase()}`;
    if (theatreMap.has(dedupeKey)) return;

    theatreMap.set(dedupeKey, {
      name,
      city,
      district,
      state: currentState,
      theatreCode,
      seatingCapacity: seating,
      isActive: true,
    });
  });

  return Array.from(theatreMap.values());
};

const fetchMovieMetadataFromWikipedia = async (title) => {
  const candidates = [title, `${title} film`].map((t) => t.replace(/\s+/g, '_'));

  for (const query of candidates) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const { data } = await axios.get(url, { timeout: 7000 });
      if (data && !data.type?.includes('disambiguation')) {
        return {
          posterUrl: data.thumbnail?.source || '',
          description: data.extract || '',
        };
      }
    } catch (error) {
      continue;
    }
  }

  return null;
};

const fetchMovieMetadataFromITunes = async (title) => {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=movie&limit=1`;
    const { data } = await axios.get(url, { timeout: 7000 });
    const first = data?.results?.[0];
    if (!first) return null;

    const posterUrl = first.artworkUrl100 ? first.artworkUrl100.replace('100x100', '600x600') : '';
    const duration = first.trackTimeMillis ? Math.max(90, Math.round(first.trackTimeMillis / 60000)) : null;

    return {
      name: first.trackName || title,
      posterUrl,
      description: first.longDescription || first.shortDescription || '',
      genre: first.primaryGenreName ? [first.primaryGenreName] : null,
      releaseDate: first.releaseDate ? new Date(first.releaseDate) : null,
      duration,
    };
  } catch (error) {
    return null;
  }
};

const buildShowsForMovie = (theatresByCity) => {
  const shows = [];
  Object.keys(theatresByCity).forEach((city) => {
    const cityTheatres = theatresByCity[city] || [];
    const selectedTheatres = cityTheatres;

    selectedTheatres.forEach((theatre) => {
      const showSlots = [...defaultShowSlots];
      showSlots.forEach((time) => {
        shows.push({
          time,
          theater: theatre.name,
          city: theatre.city,
          state: theatre.state,
          district: theatre.district,
          theatreCode: theatre.theatreCode,
          seatingCapacity: theatre.seatingCapacity,
          price: rand(84, 295),
          totalSeats: theatre.seatingCapacity || 120,
          bookedSeats: [],
        });
      });
    });
  });

  return shows;
};

const run = async () => {
  try {
    await connectDB();

    const excelPath = path.join(__dirname, '../data/movie theatres.xlsx');
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const theatreList = parseTheatresFromExcel(rows);
    const theatresByCity = theatreList.reduce((acc, theatre) => {
      if (!acc[theatre.city]) acc[theatre.city] = [];
      acc[theatre.city].push(theatre);
      return acc;
    }, {});

    console.log(`Parsed ${theatreList.length} theatres across ${Object.keys(theatresByCity).length} cities.`);

    await Theatre.deleteMany({});
    if (theatreList.length > 0) {
      await Theatre.insertMany(theatreList, { ordered: false });
    }
    console.log(`Stored ${theatreList.length} records in theatre master collection.`);

    await Movie.deleteMany({});

    let totalShows = 0;
    for (const seed of movieSeeds) {
      const wikiMeta = await fetchMovieMetadataFromWikipedia(seed.name);
      const itunesMeta = await fetchMovieMetadataFromITunes(seed.name);

      const mergedDescription = wikiMeta?.description || itunesMeta?.description || seed.description;
      const mergedPoster = wikiMeta?.posterUrl || itunesMeta?.posterUrl || '';
      const mergedDuration = itunesMeta?.duration || seed.duration;
      const mergedReleaseDate = itunesMeta?.releaseDate || new Date();
      const mergedGenre = (seed.genre && seed.genre.length > 0) ? seed.genre : (itunesMeta?.genre || ['Drama']);

      const movie = new Movie({
        ...seed,
        genre: mergedGenre,
        duration: mergedDuration,
        posterUrl: mergedPoster || posterFallbacks[seed.name] || '',
        description: mergedDescription,
        releaseDate: mergedReleaseDate,
        shows: buildShowsForMovie(theatresByCity),
      });
      totalShows += movie.shows.length;
      await movie.save();
      console.log(`Saved movie ${movie.name} with ${movie.shows.length} shows.`);
    }

    console.log(`Inserted ${movieSeeds.length} movies with ${totalShows} total theatre-wise showtimes.`);
    process.exit(0);
  } catch (error) {
    console.error('Error while importing theatres/movies:', error);
    process.exit(1);
  }
};

run();