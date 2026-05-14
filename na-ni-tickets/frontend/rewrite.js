const fs = require('fs');

const moviesContent = `import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Items.css';
import { FaFilm, FaSearch, FaMapMarkerAlt, FaStar, FaClock } from 'react-icons/fa';

function Movies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure modal shows if no city is in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('preferredCity');
    if (saved) {
      setSelectedCity(saved);
    } else {
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const response = await itemsAPI.getMovies();
      const fetchedMovies = response.data.movies || [];
      setMovies(fetchedMovies);

      // Extract unique cities from all shows
      const citySet = new Set();
      fetchedMovies.forEach(movie => {
        if (movie.shows && Array.isArray(movie.shows)) {
          movie.shows.forEach(show => {
            let city = "";
            let t = (show.theater || "").replace(/PVR|INOX|Cinepolis|Carnival Cinemas/gi, '').trim();
            t = t.replace(/Central/gi, '').trim();
            city = show.city || t;
            if (city) citySet.add(city);
          });
        }
      });
      const citiesArray = Array.from(citySet).sort();
      setAvailableCities(citiesArray);
    } catch (error) {
      toast.error('Failed to fetch movies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('preferredCity', city);
    setIsModalOpen(false);
  };

  const filteredCities = availableCities.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredMovies = movies.filter(movie => {
    if (!selectedCity) return false; // if no city, don't show any, wait for modal
    if (!movie.shows || !Array.isArray(movie.shows)) return false;
    return movie.shows.some(show => {
      let t = (show.theater || "").replace(/PVR|INOX|Cinepolis|Carnival Cinemas/gi, '').trim();
      t = t.replace(/Central/gi, '').trim();
      return (show.city || t) === selectedCity;
    });
  });

  return (
    <div className="movies-page-modern">
      {/* LOCATION MODAL */}
      {isModalOpen && (
        <div className="location-modal-overlay">
          <div className="location-modal">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaMapMarkerAlt color="#f43f5e" /> Select Your City</h2>
            <p>Please select your city to check show timings.</p>
            <div className="search-bar" style={{ position: 'relative', marginTop: 20 }}>
              <FaSearch style={{ position: 'absolute', left: 15, top: 15, color: '#aaa' }} />
              <input 
                type="text"
                placeholder="Search for your city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '12px 12px 12px 40px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
              />
            </div>
            <div className="cities-suggest-list" style={{ marginTop: 20, maxHeight: '300px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {filteredCities.length > 0 ? (
                filteredCities.map(city => (
                  <button key={city} onClick={() => handleCitySelect(city)} style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
                    {city}
                  </button>
                ))
              ) : (
                <p>No cities matched your search.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="page-header dark-header" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1f2b', color: '#fff' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Recommended Movies {selectedCity ? `in ${selectedCity}` : ''}</h1>
        <button onClick={() => setIsModalOpen(true)} style={{ background: 'transparent', border: '1px solid #f43f5e', color: '#f43f5e', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          {selectedCity || 'Select Location'}
        </button>
      </div>

      <div className="container" style={{ padding: '20px' }}>
        {isLoading ? (
          <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading movies...</h2>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="item-card movie-card" onClick={() => navigate(\`/movies/\${movie._id}\`, { state: { selectedCity } })} style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ height: '320px', backgroundColor: '#e0e0e0', backgroundImage: \`url(\${movie.posterUrl || 'about:blank'})\`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                </div>
                <div style={{ padding: '15px', background: '#fff' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>{movie.name}</h3>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                    <span><FaStar color="#f5c518" /> {movie.rating || 'NA'}</span>
                  </div>
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    {movie.language} • {(movie.genre || []).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isModalOpen && (
            <div className="no-data" style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '8px' }}>
              <p>No movies available in {selectedCity}</p>
            </div>
          )
        )}
      </div>
      
      {/* Styles injected to ensure modal works beautifully */}
      <style dangerouslySetInnerHTML={{__html: \`
        .movies-page-modern { background-color: #f4f4f4; min-height: 100vh; }
        .location-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; alignItems: center; z-index: 1000; padding: 20px; }
        .location-modal { background: #fff; border-radius: 12px; padding: 30px; width: 100%; max-width: 600px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); margin: auto; }
        .cities-suggest-list::-webkit-scrollbar { width: 6px; }
        .cities-suggest-list::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 3px; }
        .cities-suggest-list button:hover { background-color: #f43f5e !important; color: #fff; border-color: #f43f5e !important; transition: 0.2s; }
      \`}} />
    </div>
  );
}

export default Movies;`;

fs.writeFileSync('C:/Users/nithi/OneDrive/Desktop/PROJECT-BOOKING/na-ni-tickets/frontend/src/pages/Movies.js', moviesContent, 'utf8');

const movieDetailsContent = `import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import MiniTheater from '../components/MiniTheater';
import { itemsAPI, bookingsAPI } from '../services/api';
import { useAuthStore } from '../store/store';
import './Booking.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

export default function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const passedCity = location.state?.selectedCity || localStorage.getItem('preferredCity') || '';

  const [movie, setMovie] = useState(null);
  const [selectedCity, setSelectedCity] = useState(passedCity);
  const [availableCities, setAvailableCities] = useState([]);
  
  // Shows grouped by theater name
  const [groupedShows, setGroupedShows] = useState({});
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowIdx, setSelectedShowIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to extract city from theater string
  const getCityFromTheater = (show) => { 
      if (show.city) return show.city; 
      const theater = show.theater;
      if (!theater) return "Unknown";
      let t = theater.replace(/PVR|INOX|Cinepolis|Carnival Cinemas/gi, '').trim();
      t = t.replace(/Central/gi, '').trim();
      return t;
  };

  const getTheaterName = (show) => {
      if (show.theaterName) return show.theaterName;
      if (show.theater) return show.theater;
      return "Unknown Theater";
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getMovieDetails(id);
        const movieData = res.data.movie;
        setMovie(movieData);
        
        if (movieData?.shows?.length) {
          // Extract unique cities
          const citiesSet = new Set();
          movieData.shows.forEach(show => {
              citiesSet.add(getCityFromTheater(show));
          });
          const sortedCities = Array.from(citiesSet).sort();
          setAvailableCities(sortedCities);
          
          let defaultCity = passedCity || (sortedCities.includes('Delhi') ? 'Delhi' : sortedCities[0]);
          if (passedCity && !sortedCities.includes(passedCity)) {
              defaultCity = sortedCities[0];
          }
          setSelectedCity(defaultCity);
          
          groupAndSetShows(movieData.shows, defaultCity, movieData.shows);
        }
      } catch (err) {
        toast.error('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, passedCity]);

  const groupAndSetShows = (allShows, city, originalShowsArray) => {
    const fShows = allShows.filter(s => getCityFromTheater(s) === city);
    
    // Group by theater
    const grouped = {};
    fShows.forEach(s => {
       const tName = getTheaterName(s);
       if(!grouped[tName]) grouped[tName] = [];
       // Attach the global index so we can book it easily
       grouped[tName].push({ ...s, _globalIndex: originalShowsArray.indexOf(s) });
    });
    setGroupedShows(grouped);
    
    if (fShows.length > 0) {
        setSelectedShow(fShows[0]);
        setSelectedShowIdx(originalShowsArray.indexOf(fShows[0]));
    } else {
        setSelectedShow(null);
        setSelectedShowIdx(-1);
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    localStorage.setItem('preferredCity', city);
    if (movie?.shows) {
       groupAndSetShows(movie.shows, city, movie.shows);
    }
  };

  const handleShowSelect = (showObj) => {
    setSelectedShow(showObj);
    setSelectedShowIdx(showObj._globalIndex);
    
    // Scroll to theater visually
    setTimeout(() => {
       window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleConfirm = async (seats) => {
    if (!movie?.shows || selectedShowIdx < 0 || selectedShowIdx >= movie.shows.length) {
      toast.warn('Please select a show timing');
      return;
    }

    const showToBook = movie.shows[selectedShowIdx];
    const showId = showToBook._id;
    if (!showId) {
      toast.warn('Show timing data is incomplete. Please refresh and try again.');
      return;
    }

    try {
      const payload = {
        movieId: id,
        showId: showId,
        seats,
        travelerDetails: [{ name: user?.firstName || user?.name || 'Guest' }],
      };

      const res = await bookingsAPI.bookMovie(payload);
      if (res.data.success) {
        toast.success('Movie seats reserved!');
        navigate('/payment', {
          state: {
            bookingId: res.data.booking.bookingId,
            amount: res.data.booking.totalAmount,
            booking: res.data.booking,
          },
        });
      } else {
        toast.error(res.data.message || 'Booking failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to reserve seats');
    }
  };

  if (loading) return <div className="booking-page"><div className="container" style={{padding: '50px', textAlign: 'center'}}><h2>Loading movie...</h2></div></div>;
  if (!movie) return <div className="booking-page"><div className="container" style={{padding: '50px', textAlign: 'center'}}><h2>Movie not found</h2></div></div>;

  return (
    <div className="movie-details-modern" style={{ background: '#f4f4f4', minHeight: '100vh', paddingBottom: '50px' }}>
      {/* HEADER HERO */}
      <div style={{ background: '#1a1f2b', padding: '40px 20px', color: '#fff', display: 'flex', gap: '30px', alignItems: 'center' }}>
          <img src={movie.posterUrl || 'about:blank'} alt={movie.name} style={{ width: '200px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} />
          <div>
              <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>{movie.name}</h1>
              <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '15px' }}>
                  <FaMapMarkerAlt /> {selectedCity} • {movie.genre?.join(', ')} • {movie.language} • {movie.duration} mins
              </p>
              <p style={{ fontSize: '16px', background: '#333', display: 'inline-block', padding: '5px 10px', borderRadius: '6px' }}>⭐ {movie.rating || 'NA'}/10</p>
          </div>
      </div>

      <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: 0 }}>Timings in {selectedCity}</h2>
            <select 
              value={selectedCity} 
              onChange={handleCityChange}
              style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', background: '#fafafa', fontSize: '16px'
              }}
            >
                {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
        </div>

        {Object.keys(groupedShows).length === 0 ? (
           <div style={{ background: '#fff', padding: '50px', textAlign: 'center', borderRadius: '8px' }}>
               <h3 style={{ color: '#666' }}>No shows available in {selectedCity}</h3>
           </div>
        ) : (
           <div className="theater-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {Object.entries(groupedShows).map(([theaterName, showsList]) => (
                   <div key={theaterName} style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                       <div style={{ flex: '0 0 250px', paddingRight: '20px' }}>
                           <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{theaterName}</h3>
                       </div>
                       <div style={{ flex: '1', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                           {showsList.map(show => {
                               const isSelected = selectedShowIdx === show._globalIndex;
                               const tSeats = show.totalSeats || 120;
                               const bSeats = show.bookedSeats?.length || 0;
                               const available = tSeats - bSeats;
                               const fillStatus = available < 10 ? (available === 0 ? 'Sold Out' : 'Fast Filling') : 'Available';
                               const isSoldOut = available === 0;

                               return (
                                   <div key={show._id || show.time} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                       <button
                                           onClick={() => !isSoldOut && handleShowSelect(show)}
                                           disabled={isSoldOut}
                                           style={{
                                               background: isSelected ? '#f43f5e' : 'transparent',
                                               color: isSelected ? '#fff' : (isSoldOut ? '#aaa' : '#4ade80'),
                                               border: \`1px solid \${isSoldOut ? '#aaa' : (isSelected ? '#f43f5e' : '#4ade80')}\`,
                                               padding: '8px 20px',
                                               borderRadius: '6px',
                                               fontSize: '16px',
                                               fontWeight: 'bold',
                                               cursor: isSoldOut ? 'not-allowed' : 'pointer',
                                               transition: 'all 0.2s ease',
                                               marginBottom: '4px'
                                           }}
                                       >
                                           {show.time}
                                       </button>
                                       <span style={{ fontSize: '12px', color: isSoldOut ? 'red' : (available < 20 ? 'orange' : 'green') }}>
                                           {fillStatus} ({available} seats)
                                       </span>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
               ))}
           </div>
        )}

        {selectedShow && (
          <div style={{ marginTop: '40px', padding: '30px', background: '#333', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Select Seats for {selectedShow.time}</h3>
            <MiniTheater 
              rows={6} 
              cols={12} 
              booked={selectedShow.bookedSeats || []} 
              price={selectedShow.price || 150} 
              onConfirm={handleConfirm} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('C:/Users/nithi/OneDrive/Desktop/PROJECT-BOOKING/na-ni-tickets/frontend/src/pages/MovieDetails.js', movieDetailsContent, 'utf8');
console.log('MovieDetails.js updated!');
