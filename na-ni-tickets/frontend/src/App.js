import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuthStore } from './store/store';
import { authAPI } from './services/api';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import MovieDetails from './pages/MovieDetails';
import MovieCitySelect from './pages/MovieCitySelect';
import MovieListByCity from './pages/MovieListByCity';
import MovieTheatresPage from './pages/MovieTheatresPage';
import MovieTicketsPage from './pages/MovieTicketsPage';
import Concerts from './pages/Concerts';
import ConcertDetails from './pages/ConcertDetails';
import EventTicketsPage from './pages/EventTicketsPage';
import Buses from './pages/Buses';
import BusDetails from './pages/BusDetails';
import Trains from './pages/Trains';
import TrainDetails from './pages/TrainDetails';
import TrainPassengers from './pages/TrainPassengers';
import TrainSummary from './pages/TrainSummary';
import TrainBookingStart from './pages/TrainBookingStart';
import Flights from './pages/Flights';
import FlightDetails from './pages/FlightDetails';
import FlightPassengers from './pages/FlightPassengers';
import FlightSummary from './pages/FlightSummary';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';

import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ReceiptPage from './pages/ReceiptPage';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';

import './index.css';

function RouteExperience({ children }) {
  const location = useLocation();
  const [refreshing, setRefreshing] = React.useState(true);

  React.useEffect(() => {
    setRefreshing(true);
    const timer = window.setTimeout(() => setRefreshing(false), 780);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <div className={`route-refresh ${refreshing ? 'is-active' : ''}`} aria-hidden="true">
        <div className="refresh-ring"></div>
        <div className="refresh-orbit"></div>
      </div>
      <main key={location.pathname} className="route-stage">
        {children}
      </main>
    </>
  );
}

function App() {
  const { setUser, setToken, token } = useAuthStore();

  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      const verifyToken = async () => {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      };
      verifyToken();
    }
  }, [setUser, setToken]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <RouteExperience>
        <Routes>
          <Route path="/train/bookings" element={<TrainBookingStart />} />
          <Route path="/train/book/:trainNo" element={<TrainDetails />} />
          <Route path="/train/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/train/receipt/:bookingId" element={<ReceiptPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/movies" element={<MovieCitySelect />} />
        <Route path="/movies/city/:city" element={<MovieListByCity />} />
        <Route path="/movies/city/:city/movie/:id/theatres" element={<MovieTheatresPage />} />
        <Route
          path="/movies/city/:city/movie/:id/tickets"
          element={
            <ProtectedRoute>
              <MovieTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route
          path="/book/movie"
          element={
            <ProtectedRoute>
              <BookingPage type="movie" />
            </ProtectedRoute>
          }
        />

        <Route path="/concerts" element={<Concerts />} />
        <Route path="/concerts/:id" element={<ConcertDetails />} />
        <Route
          path="/concerts/:id/tickets"
          element={
            <ProtectedRoute>
              <EventTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/concert"
          element={
            <ProtectedRoute>
              <BookingPage type="concert" />
            </ProtectedRoute>
          }
        />

        <Route path="/buses" element={<Buses />} />
        <Route
          path="/buses/:id"
          element={
            <ProtectedRoute>
              <BusDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/bus"
          element={
            <ProtectedRoute>
              <BookingPage type="bus" />
            </ProtectedRoute>
          }
        />

        <Route path="/trains" element={<Trains />} />
        <Route
          path="/trains/:id"
          element={
            <ProtectedRoute>
              <TrainDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trains/:id/passengers"
          element={
            <ProtectedRoute>
              <TrainPassengers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trains/:id/review"
          element={
            <ProtectedRoute>
              <TrainSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/train"
          element={
            <ProtectedRoute>
              <BookingPage type="train" />
            </ProtectedRoute>
          }
        />

        <Route path="/flights" element={<Flights />} />
        <Route
          path="/flights/:id"
          element={
            <ProtectedRoute>
              <FlightDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flights/:id/passengers"
          element={
            <ProtectedRoute>
              <FlightPassengers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flights/:id/review"
          element={
            <ProtectedRoute>
              <FlightSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/flight"
          element={
            <ProtectedRoute>
              <BookingPage type="flight" />
            </ProtectedRoute>
          }
        />

        <Route path="/cars" element={<Cars />} />
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/car"
          element={
            <ProtectedRoute>
              <BookingPage type="car" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipt"
          element={
            <ProtectedRoute>
              <ReceiptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-confirmation/:bookingId"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:bookingId"
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </RouteExperience>
    </BrowserRouter>
  );
}

export default App;
