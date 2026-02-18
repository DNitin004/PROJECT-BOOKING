import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaFilm, FaMusic, FaBus, FaTrain, FaPlane, FaCar, FaTicketAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuthStore } from '../store/store';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <FaTicketAlt /> NA-NI TICKETS
        </Link>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            <FaHome /> Home
          </Link>
          <Link to="/movies" className="nav-link">
            <FaFilm /> Movies
          </Link>
          <Link to="/concerts" className="nav-link">
            <FaMusic /> Concerts
          </Link>
          <Link to="/buses" className="nav-link">
            <FaBus /> Buses
          </Link>
          <Link to="/trains" className="nav-link">
            <FaTrain /> Trains
          </Link>
          <Link to="/flights" className="nav-link">
            <FaPlane /> Flights
          </Link>
          <Link to="/cars" className="nav-link">
            <FaCar /> Cars
          </Link>
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <FaUser /> {user.name || user.firstName}
              </div>
              <div className="dropdown-menu">
                <Link to="/my-bookings">My Bookings</Link>
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-auth login">
                Login
              </Link>
              <Link to="/signup" className="btn-auth signup">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
