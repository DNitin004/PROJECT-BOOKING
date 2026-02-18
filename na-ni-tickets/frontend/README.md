# NA-NI TICKETS Frontend

React.js frontend for the NA-NI TICKETS booking platform.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Configure Environment
Create/update `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Start Development Server
```bash
npm start
```

App runs on `http://localhost:3000`

## 📄 Pages

### Public Pages
- **Home** (`/`) - Landing page with categories
- **Login** (`/login`) - User login
- **Signup** (`/signup`) - User registration
- **Forgot Password** (`/forgot-password`) - Password reset request
- **Reset Password** (`/reset-password`) - Password reset form
- **Verify Email** (`/verify-email`) - Email verification with OTP

### Booking Pages
- **Movies** (`/movies`) - Movie listings
- **Movie Details** (`/movies/:id`) - Movie details
- **Concerts** (`/concerts`) - Concert listings
- **Concert Details** (`/concerts/:id`) - Concert details
- **Buses** (`/buses`) - Bus listings
- **Trains** (`/trains`) - Train listings
- **Flights** (`/flights`) - Flight listings
- **Cars** (`/cars`) - Car listings

### Protected Pages (Requires Login)
- **Book Movie** (`/book/movie`) - Movie booking
- **Book Concert** (`/book/concert`) - Concert booking
- **Book Bus** (`/book/bus`) - Bus booking
- **Book Train** (`/book/train`) - Train booking
- **Book Flight** (`/book/flight`) - Flight booking
- **Book Car** (`/book/car`) - Car booking
- **Payment** (`/payment`) - Payment page
- **Booking Confirmation** (`/booking-confirmation/:id`) - Confirmation page
- **My Bookings** (`/my-bookings`) - User's booking history
- **Booking Details** (`/booking/:id`) - Individual booking details

## 📦 Dependencies

- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **zustand** - State management
- **react-toastify** - Notifications
- **react-icons** - Icons
- **@stripe/react-stripe-js** - Stripe payment
- **date-fns** - Date formatting

## 🎨 Components

### Navbar
- Navigation with category links
- User menu with logout
- Responsive hamburger menu
- Professional styling

### ProtectedRoute
- Routes requiring authentication
- Redirects to login if not authenticated

## 🏪 State Management (Zustand Stores)

### useAuthStore
- `user` - Current user data
- `token` - JWT token
- `setUser()` - Update user
- `setToken()` - Update token
- `logout()` - Logout user

### useBookingStore
- `bookings` - User's bookings
- `selectedBooking` - Currently selected booking
- `bookingType` - Type of booking
- `selectedSeats` - Selected seats
- `addSeat()` - Add/remove seat
- `clearSeats()` - Clear all seats

### useItemStore
- `movies`, `concerts`, `buses`, `trains`, `flights`, `cars` - Items
- Setters for each item type

## 🎯 Features

✅ User authentication with JWT
✅ Email verification with OTP
✅ Multiple booking types
✅ Seat/category selection UI
✅ Shopping cart functionality
✅ Secure payment integration
✅ Booking history and management
✅ Responsive design
✅ Toast notifications
✅ Error handling

## 🎨 Styling

- **CSS Grid & Flexbox** for layouts
- **CSS Variables** for theming
- **Responsive Design** for all devices
- **Smooth Animations** and transitions
- Professional color scheme

## 📱 Responsive Breakpoints

- Desktop: > 768px
- Tablet: 600px - 768px
- Mobile: < 600px

## 🔗 API Integration

Uses `axios` instance with:
- Automatic token injection in headers
- Error handling and redirects
- Request/response interceptors

See `src/services/api.js` for all endpoints.

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API integration
│   ├── store/              # State management
│   ├── styles/             # Global styles
│   ├── App.js              # Main app component
│   ├── index.js            # Entry point
│   └── index.css           # Global CSS
├── .env                    # Environment variables
└── package.json
```

## 🚀 Building for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## 📝 License

© 2026 NA-NI TICKETS. All rights reserved.

## 🎓 Learning Resources

- React Hooks documentation
- React Router v6 documentation
- Zustand state management
- Stripe payment integration

---

**Version:** 1.0.0  
**Last Updated:** February 2026
