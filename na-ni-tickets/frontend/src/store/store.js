import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export const useBookingStore = create((set) => ({
  bookings: [],
  selectedBooking: null,
  bookingType: null,
  selectedSeats: [],
  isLoading: false,

  setBookings: (bookings) => set({ bookings }),
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  setBookingType: (type) => set({ bookingType: type }),
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  addSeat: (seat) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.includes(seat)
        ? state.selectedSeats.filter((s) => s !== seat)
        : [...state.selectedSeats, seat],
    })),
  clearSeats: () => set({ selectedSeats: [] }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useItemStore = create((set) => ({
  movies: [],
  concerts: [],
  buses: [],
  trains: [],
  flights: [],
  cars: [],
  isLoading: false,

  setMovies: (movies) => set({ movies }),
  setConcerts: (concerts) => set({ concerts }),
  setBuses: (buses) => set({ buses }),
  setTrains: (trains) => set({ trains }),
  setFlights: (flights) => set({ flights }),
  setCars: (cars) => set({ cars }),
  setLoading: (isLoading) => set({ isLoading }),
}));
