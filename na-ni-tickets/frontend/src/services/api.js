import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Items API
export const itemsAPI = {
  getMovies: () => api.get('/items/movies'),
  getMovieDetails: (id) => api.get(`/items/movies/${id}`),
  getConcerts: () => api.get('/items/concerts'),
  getConcertDetails: (id) => api.get(`/items/concerts/${id}`),
  getBuses: (params) => api.get('/items/buses', { params }),
  getBusDetails: (id) => api.get(`/items/buses/${id}`),
  getTrains: (params) => api.get('/items/trains', { params }),
  getTrainDetails: (id) => api.get(`/items/trains/${id}`),
  getFlights: (params) => api.get('/items/flights', { params }),
  getFlightDetails: (id) => api.get(`/items/flights/${id}`),
  getCars: () => api.get('/items/cars'),
  getNearByCars: (params) => api.get('/items/cars/nearby', { params }),
  getCarDetails: (id) => api.get(`/items/cars/${id}`),
};

// Bookings API
export const bookingsAPI = {
  bookMovie: (data) => api.post('/bookings/movie', data),
  bookConcert: (data) => api.post('/bookings/concert', data),
  bookBus: (data) => api.post('/bookings/bus', data),
  bookTrain: (data) => api.post('/bookings/train', data),
  bookFlight: (data) => api.post('/bookings/flight', data),
  bookCar: (data) => api.post('/bookings/car', data),
  getUserBookings: () => api.get('/bookings'),
  getBookingDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  cancelBooking: (bookingId, data) => api.post(`/bookings/${bookingId}/cancel`, data),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  refundPayment: (data) => api.post('/payments/refund', data),
  getPaymentDetails: (bookingId) => api.get(`/payments/${bookingId}`),
};

export default api;
