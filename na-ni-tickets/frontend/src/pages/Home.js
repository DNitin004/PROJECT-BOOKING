import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBolt,
  FaBus,
  FaCar,
  FaEnvelopeOpenText,
  FaFilm,
  FaLock,
  FaMobileAlt,
  FaMusic,
  FaPlane,
  FaTags,
  FaTrain,
  FaUndoAlt,
} from 'react-icons/fa';
import './Home.css';

function Home() {
  const heroSlides = [
    { title: 'Cinema Nights', meta: 'Premium seats and instant QR tickets', icon: <FaFilm /> },
    { title: 'Smart Travel', meta: 'Buses, trains, flights, and cabs in one flow', icon: <FaPlane /> },
    { title: 'Live Events', meta: 'Concert passes with fast checkout', icon: <FaMusic /> },
  ];

  const categories = [
    {
      icon: <FaFilm />,
      title: 'Movie Tickets',
      description: 'Book movie tickets from your favorite theaters',
      link: '/movies',
      color: '#f43f5e',
    },
    {
      icon: <FaMusic />,
      title: 'Concert Tickets',
      description: 'Get tickets to amazing concerts and events',
      link: '/concerts',
      color: '#7c3aed',
    },
    {
      icon: <FaBus />,
      title: 'Bus Tickets',
      description: 'Travel comfortably with bus bookings',
      link: '/buses',
      color: '#0ea5e9',
    },
    {
      icon: <FaTrain />,
      title: 'Train Tickets',
      description: 'IRCTC-style train booking platform',
      link: '/trains',
      color: '#10b981',
    },
    {
      icon: <FaPlane />,
      title: 'Flight Tickets',
      description: 'Book domestic and international flights',
      link: '/flights',
      color: '#f59e0b',
    },
    {
      icon: <FaCar />,
      title: 'Car Booking',
      description: 'Uber and Ola style car booking',
      link: '/cars',
      color: '#2563eb',
    },
  ];

  const features = [
    { icon: <FaLock />, title: 'Secure Payment', text: 'Encrypted checkout with clear fare summaries before you pay.' },
    { icon: <FaBolt />, title: 'Fast Booking', text: 'Search, compare, select, and confirm in a clean step-by-step flow.' },
    { icon: <FaEnvelopeOpenText />, title: 'Email Tickets', text: 'Instant ticket delivery with booking details ready when you need them.' },
    { icon: <FaTags />, title: 'Best Prices', text: 'Transparent pricing and useful options across every booking category.' },
    { icon: <FaUndoAlt />, title: 'Easy Cancellation', text: 'Simple booking records and cancellation-friendly account screens.' },
    { icon: <FaMobileAlt />, title: 'Mobile Friendly', text: 'Responsive pages designed for quick decisions on smaller screens.' },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-backdrop" aria-hidden="true"></div>
        <div className="hero-content">
          <span className="hero-kicker">Bookings that feel effortless</span>
          <h1>NA-NI TICKETS</h1>
          <p>Your premium one-stop platform for movies, concerts, buses, trains, flights, and cars.</p>
          <div className="hero-actions">
            <Link to="/movies" className="btn btn-primary">
              Start Booking <FaArrowRight />
            </Link>
            <Link to="/my-bookings" className="btn btn-ghost">
              View Tickets
            </Link>
          </div>
          <div className="hero-service-strip" aria-label="Available booking services">
            <span><FaFilm /> Movies</span>
            <span><FaMusic /> Events</span>
            <span><FaBus /> Buses</span>
            <span><FaTrain /> Trains</span>
            <span><FaPlane /> Flights</span>
            <span><FaCar /> Cars</span>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Featured booking slideshow">
          <div className="showcase-phone">
            <div className="showcase-topbar"></div>
            <div className="slide-stack">
              {heroSlides.map((slide, index) => (
                <div className={`hero-slide hero-slide-${index + 1}`} key={slide.title}>
                  <div className="slide-icon">{slide.icon}</div>
                  <div>
                    <strong>{slide.title}</strong>
                    <span>{slide.meta}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="showcase-ticket">
              <span>Today</span>
              <strong>4 Active Deals</strong>
            </div>
          </div>
          <div className="floating-card card-one">Live seat map</div>
          <div className="floating-card card-two">Instant receipt</div>
        </div>
      </section>

      <section className="categories container">
        <h2 className="section-title">What would you like to book today?</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link key={category.title} to={category.link} className="category-card">
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

      <section className="features">
        <div className="container">
          <h2 className="section-title text-center">Why Choose NA-NI TICKETS?</h2>
          <div className="features-grid">
            {features.map((feature) => (
              <div className="feature-item" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
