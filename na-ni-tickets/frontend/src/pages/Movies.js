import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { itemsAPI } from '../services/api';
import { applyImageFallback, getImage } from '../utils/imageFallbacks';
import './Movies.css';

function Movies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCity = localStorage.getItem('preferredCity');
    if (savedCity) {
      setSelectedCity(savedCity);
    } else {
      setShowCityPicker(true);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [moviesRes, citiesRes] = await Promise.all([
          itemsAPI.getMovies(),
          itemsAPI.getMovieCities(),
        ]);

        const fetchedMovies = moviesRes.data?.movies || [];
        setMovies(fetchedMovies);

        const fetchedCities = citiesRes.data?.cities || [];
        if (fetchedCities.length > 0) {
          setAvailableCities(fetchedCities);
        } else {
          const citySet = new Set();
          fetchedMovies.forEach((movie) => {
            (movie.shows || []).forEach((show) => {
              if (show.city) citySet.add(show.city);
            });
          });
          setAvailableCities(Array.from(citySet).sort((a, b) => a.localeCompare(b)));
        }
      } catch (error) {
        setMovies([]);
        setAvailableCities([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredCities = useMemo(() => {
    return availableCities.filter((city) => city.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [availableCities, searchQuery]);

  const moviesInCity = useMemo(() => {
    if (!selectedCity) return [];
    return movies.filter((movie) =>
      (movie.shows || []).some(
        (show) => (show.city || '').toLowerCase() === selectedCity.toLowerCase()
      )
    );
  }, [movies, selectedCity]);

  const languageOptions = useMemo(() => {
    const langs = new Set();
    moviesInCity.forEach((movie) => {
      if (movie.language) langs.add(movie.language);
    });
    return ['All', ...Array.from(langs)];
  }, [moviesInCity]);

  const filteredMovies = useMemo(() => {
    if (selectedLanguage === 'All') return moviesInCity;
    return moviesInCity.filter((movie) => (movie.language || '') === selectedLanguage);
  }, [moviesInCity, selectedLanguage]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('preferredCity', city);
    setSearchQuery('');
    setShowCityPicker(false);
  };

  return (
    <div className="movies-screen">
      <div className="movies-top-search">
        <FaSearch />
        <span>Search for a movie</span>
      </div>

      <div className="movies-city-row">
        <h1 className="movies-title">Only in Theatres</h1>
        <button className="movies-city-btn" onClick={() => setShowCityPicker(true)}>
          <FaMapMarkerAlt style={{ marginRight: 6 }} />
          {selectedCity || 'Select city'}
        </button>
      </div>

      <div className="movies-chip-row">
        {languageOptions.map((lang) => (
          <button
            key={lang}
            className="movies-chip"
            style={selectedLanguage === lang ? { borderColor: '#ffffff' } : undefined}
            onClick={() => setSelectedLanguage(lang)}
          >
            {lang}
          </button>
        ))}
      </div>

      {loading && <div className="movies-empty">Loading movies...</div>}

      {!loading && filteredMovies.length === 0 && (
        <div className="movies-empty">
          No movies are available for this city right now.
        </div>
      )}

      {!loading && filteredMovies.length > 0 && (
        <div className="movies-grid">
          {filteredMovies.map((movie) => (
            <div
              className="movie-card"
              key={movie._id}
              onClick={() => navigate(`/movies/${movie._id}`, { state: { selectedCity } })}
            >
              <img
                className="movie-poster"
                src={getImage(movie.posterUrl, 'moviePoster')}
                alt={movie.name}
                onError={(event) => applyImageFallback(event, 'moviePoster')}
              />
              <div className="movie-meta">
                <h3 className="movie-name">{movie.name}</h3>
                <div className="movie-sub">UA13+ | {movie.language}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCityPicker && (
        <div className="city-overlay">
          <div className="city-sheet">
            <h2>Location</h2>
            <input
              className="city-search"
              placeholder="Search city, area or locality"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="city-list">
              {filteredCities.map((city) => (
                <div key={city} className="city-row" onClick={() => handleCitySelect(city)}>
                  <div>
                    <div className="city-name">{city}</div>
                    <div className="city-state">Tap to browse theatres and movies</div>
                  </div>
                  <div>{'>'}</div>
                </div>
              ))}

              {filteredCities.length === 0 && (
                <div className="city-row">
                  <div>No city found</div>
                </div>
              )}
            </div>

            <button
              className="movies-city-btn"
              style={{ marginTop: 14 }}
              onClick={() => setShowCityPicker(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Movies;
