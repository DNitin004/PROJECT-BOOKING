import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { applyImageFallback, getImage } from '../utils/imageFallbacks';
import './Movies.css';

function MovieListByCity() {
  const { city } = useParams();
  const cityName = decodeURIComponent(city || '');
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await itemsAPI.getMovies();
        const list = res.data?.movies || [];
        const filtered = list.filter((movie) =>
          (movie.shows || []).some((show) => (show.city || '').toLowerCase() === cityName.toLowerCase())
        );
        setMovies(filtered);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cityName]);

  const searched = useMemo(() => {
    if (!query.trim()) return movies;
    return movies.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));
  }, [movies, query]);

  return (
    <div className="movies-screen">
      <div className="movies-city-row">
        <h1 className="movies-title">Movies in {cityName}</h1>
        <button className="movies-city-btn" onClick={() => navigate('/movies')}>Change City</button>
      </div>

      <div className="movies-top-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movie"
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

      {loading && <div className="movies-empty">Loading movies...</div>}
      {!loading && searched.length === 0 && <div className="movies-empty">No movies available in this city.</div>}

      {!loading && searched.length > 0 && (
        <div className="movies-grid">
          {searched.map((movie) => (
            <div
              className="movie-card"
              key={movie._id}
              onClick={() => navigate(`/movies/city/${encodeURIComponent(cityName)}/movie/${movie._id}/theatres`)}
            >
              <img
                className="movie-poster"
                src={getImage(movie.posterUrl, 'moviePoster')}
                alt={movie.name}
                onError={(event) => applyImageFallback(event, 'moviePoster')}
              />
              <div className="movie-meta">
                <h3 className="movie-name">{movie.name}</h3>
                <div className="movie-sub">{movie.language}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieListByCity;
