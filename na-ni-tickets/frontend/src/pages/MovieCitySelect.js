import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { itemsAPI } from '../services/api';
import './Movies.css';

function MovieCitySelect() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getMovieCities();
        setCities(res.data?.cities || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = cities.filter((city) => city.toLowerCase().includes(query.toLowerCase()));

  const selectCity = (city) => {
    localStorage.setItem('preferredCity', city);
    navigate(`/movies/city/${encodeURIComponent(city)}`);
  };

  return (
    <div className="movies-screen">
      <h1 className="movies-title" style={{ marginBottom: 8 }}>Select City</h1>
      <div className="movies-top-search">
        <FaSearch />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            width: '100%',
            outline: 'none',
            fontSize: 16,
          }}
        />
      </div>

      {loading && <div className="movies-empty">Loading cities...</div>}

      {!loading && (
        <div className="city-list" style={{ marginTop: 12 }}>
          {filtered.map((city) => (
            <div className="city-row" key={city} onClick={() => selectCity(city)}>
              <div>
                <div className="city-name">{city}</div>
                <div className="city-state">Browse movies and theatres</div>
              </div>
              <FaMapMarkerAlt />
            </div>
          ))}
          {filtered.length === 0 && <div className="movies-empty">No city found</div>}
        </div>
      )}
    </div>
  );
}

export default MovieCitySelect;
