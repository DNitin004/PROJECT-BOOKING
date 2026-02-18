import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaMusic, FaBus, FaTrain, FaPlane, FaCar, FaArrowRight } from 'react-icons/fa';
import './Home.css';

function Home() {
  const categories = [
    {
      icon: <FaFilm />,
      title: 'Movie Tickets',
      description: 'Book movie tickets from your favorite theaters',
      link: '/movies',
      color: '#ff6b35',
    },
    {
      icon: <FaMusic />,
      title: 'Concert Tickets',
      description: 'Get tickets to amazing concerts and events',
      link: '/concerts',
      color: '#004e89',
    },
    {
      icon: <FaBus />,
      title: 'Bus Tickets',
      description: 'Travel comfortably with bus bookings',
      link: '/buses',
      color: '#ff6b35',
    },
    {
      icon: <FaTrain />,
      title: 'Train Tickets',
      description: 'IRCTC-style train booking platform',
      link: '/trains',
      color: '#004e89',
    },
    {
      icon: <FaPlane />,
      title: 'Flight Tickets',
      description: 'Book domestic and international flights',
      link: '/flights',
      color: '#ff6b35',
    },
    {
      icon: <FaCar />,
      title: 'Car Booking',
      description: 'Uber and Ola style car booking',
      link: '/cars',
      color: '#004e89',
    },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to NA-NI TICKETS</h1>
          <p>Your one-stop platform for all your booking needs</p>
          <p className="subtitle">Book Movies • Concerts • Buses • Trains • Flights • Cars</p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories container">
        <h2 className="section-title">What would you like to book today?</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link key={index} to={category.link} className="category-card">
              <div className="icon-wrapper" style={{ backgroundColor: category.color }}>
                {category.icon}
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <span className="btn-link">
                Book Now <FaArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title text-center">Why Choose NA-NI TICKETS?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h4>🔒 Secure Payment</h4>
              <p>100% secure payment gateways with encrypted transactions</p>
            </div>
            <div className="feature-item">
              <h4>⚡ Fast Booking</h4>
              <p>Quick and easy booking process in just a few clicks</p>
            </div>
            <div className="feature-item">
              <h4>📧 Email Tickets</h4>
              <p>Instant ticket delivery to your email with reminders</p>
            </div>
            <div className="feature-item">
              <h4>💰 Best Prices</h4>
              <p>Competitive prices and exclusive deals on all bookings</p>
            </div>
            <div className="feature-item">
              <h4>🎫 Easy Cancellation</h4>
              <p>Hassle-free cancellation policy with refunds</p>
            </div>
            <div className="feature-item">
              <h4>📱 Mobile Friendly</h4>
              <p>Book on the go with our responsive mobile interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 NA-NI TICKETS. All rights reserved.</p>
          <p>Contact: dogiparthynitindatta@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
