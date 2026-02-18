import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Items.css';
import { FaFilm, FaClock, FaStar } from 'react-icons/fa';

function Movies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const response = await itemsAPI.getMovies();
      setMovies(response.data.movies || []);
    } catch (error) {
      toast.error('Failed to fetch movies');
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      const response = await api.post('/items/seed-all');
      toast.success(`Database seeded! Added ${response.data.data.moviesAdded} movies, ${response.data.data.concertsAdded} concerts, and more!`);
      fetchMovies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="items-page">
      <div className="page-header">
        <h1><FaFilm /> Movie Tickets</h1>
        <p>Select your movie and show timing, then book in mini theatre view</p>
      </div>

      <div className="container">
        {movies.length === 0 && !isLoading && (
          <div style={{ marginBottom: 16 }}>
            <button 
              className="btn-primary" 
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              style={{ padding: '10px 20px', fontSize: '16px' }}
            >
              {isSeeding ? 'Seeding...' : '📥 Seed Database with Sample Data'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading movies...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="items-grid">
            {movies.map((movie) => (
              <div key={movie._id} className="item-card movie-card">
                <div className="item-image" style={{ backgroundColor: '#e0e0e0', backgroundImage: `url(${movie.posterUrl || 'about:blank'})` }}>
                  <img src={movie.posterUrl} alt={movie.name} style={movie.posterUrl ? {} : { display: 'none' }} />
                  {!movie.posterUrl && <div className="placeholder-text">{movie.name}</div>}
                  <div className="overlay">
                    <button className="btn-book" onClick={() => navigate(`/movies/${movie._id}`)}>View Shows</button>
                  </div>
                </div>
                <div className="item-info">
                  <h3>{movie.name}</h3>
                  <div className="movie-meta">
                    <span className="rating">
                      <FaStar /> {movie.rating || 'NA'}
                    </span>
                    <span className="language">{movie.language}</span>
                  </div>
                  <div className="shows">
                    {movie.shows && movie.shows.slice(0, 4).map((show) => (
                      <button key={show._id || show.time} className="show-time" onClick={() => navigate(`/movies/${movie._id}`)}>
                        <FaClock /> {show.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>No movies available at the moment</p>
            <button 
              className="btn-primary"
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              style={{ marginTop: '16px', padding: '10px 20px', fontSize: '16px' }}
            >
              {isSeeding ? 'Seeding...' : '📥 Load Sample Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;
