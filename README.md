# NA-NI TICKETS - Multi-Purpose Ticket Booking Platform

A comprehensive full-stack ticket booking platform for movies, concerts, buses, trains, flights, and car bookings.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contact](#contact)

## ✨ Features

### Authentication & Security
- ✅ User registration with email verification
- ✅ Login with password
- ✅ Forgot password with OTP verification
- ✅ Phone number support
- ✅ JWT token-based authentication
- ✅ Email OTP verification for signup and password reset

### Booking Features
- ✅ **Movie Tickets**: Mini theatre version with seat selection
- ✅ **Concert Tickets**: Ticket categories (Gold, Premium, Silver)
- ✅ **Bus Tickets**: Red Bus style layout with seat mapping
- ✅ **Train Tickets**: IRCTC-style booking
- ✅ **Flight Tickets**: Airline booking interface
- ✅ **Car Booking**: Uber/Ola style car selection (up to 20 cars)

### Payment & Booking Management
- ✅ Secure Stripe payment integration
- ✅ Multiple payment methods
- ✅ Booking history and details
- ✅ Cancellation with refund (80% refund policy)
- ✅ Email ticket delivery
- ✅ 10-minute reminder emails before event

### User Account
- ✅ User dashboard with booking history
- ✅ View booking details and tickets
- ✅ Download/Print tickets
- ✅ Manage cancellations

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Stripe for payment processing
- Nodemailer for email services

**Frontend:**
- React.js
- React Router for navigation
- Axios for API calls
- Zustand for state management
- React Toastify for notifications

## 💻 System Requirements

- Node.js 14.0 or higher
- MongoDB 4.4 or higher
- npm or yarn package manager
- Git

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd na-ni-tickets
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already created, update with your values)
# Edit .env file with your configurations
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (already created)
# Edit .env file with your API URL
```

## ⚙️ Configuration

### Backend Configuration (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nani-tickets

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dogiparthynitindatta@gmail.com
SMTP_PASS=your_app_password_here
SENDER_EMAIL=nanitickets@gmail.com
SENDER_NAME=NA-NI TICKETS

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Frontend
FRONTEND_URL=http://localhost:3000

# OTP
OTP_EXPIRY=10
```

### Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

### Setting Up Email Service

1. **Gmail Setup:**
   - Enable 2-factor authentication on your Google account
   - Create an App Password: https://myaccount.google.com/apppasswords
   - Use the generated 16-character password in `SMTP_PASS`

### Setting Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the dashboard
3. Add them to your .env file

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option 2: MongoDB Atlas (Cloud)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nani-tickets
```

## 🚀 Running the Application

### Start MongoDB (if local)

```bash
mongod
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
na-ni-tickets/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Concert.js
│   │   ├── Bus.js
│   │   ├── Train.js
│   │   ├── Flight.js
│   │   ├── Car.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   └── OTP.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── itemController.js
│   │   └── paymentController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── itemRoutes.js
│   │   └── paymentRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── emailService.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Home.css
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Auth.css
│   │   │   ├── ForgotPassword.js
│   │   │   ├── ResetPassword.js
│   │   │   ├── VerifyEmail.js
│   │   │   ├── Movies.js
│   │   │   ├── Concerts.js
│   │   │   ├── Items.css
│   │   │   ├── BookingPage.js
│   │   │   ├── PaymentPage.js
│   │   │   ├── BookingConfirmation.js
│   │   │   ├── MyBookings.js
│   │   │   ├── BookingDetails.js
│   │   │   └── Booking.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── store.js
│   │   ├── styles/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   └── package.json
│
└── README.md
```

## 📚 API Documentation

### Authentication Endpoints

**POST /api/auth/signup**
- Register a new user
- Body: `{ firstName, lastName, email, phoneNumber, password, confirmPassword }`

**POST /api/auth/login**
- Login user
- Body: `{ email, password }`

**POST /api/auth/verify-otp**
- Verify OTP
- Body: `{ email, otp, type }`

**POST /api/auth/forgot-password**
- Request password reset
- Body: `{ email }` or `{ phoneNumber }`

**POST /api/auth/reset-password**
- Reset password
- Body: `{ resetToken, newPassword, confirmPassword }`

### Booking Endpoints

**POST /api/bookings/movie**
- Book movie tickets
- Headers: `Authorization: Bearer <token>`
- Body: `{ movieId, showId, seats, travelerDetails }`

**POST /api/bookings/concert**
- Book concert tickets
- Headers: `Authorization: Bearer <token>`
- Body: `{ concertId, category, seats, travelerDetails }`

**GET /api/bookings**
- Get user's bookings
- Headers: `Authorization: Bearer <token>`

**POST /api/bookings/:bookingId/cancel**
- Cancel booking
- Headers: `Authorization: Bearer <token>`
- Body: `{ reason }`

### Items Endpoints

**GET /api/items/movies**
- Get all movies

**GET /api/items/concerts**
- Get all concerts

**GET /api/items/buses**
- Get all buses
- Query: `?source=city&destination=city`

**GET /api/items/flights**
- Get all flights
- Query: `?source=code&destination=code`

### Payment Endpoints

**POST /api/payments/create-intent**
- Create Stripe payment intent
- Headers: `Authorization: Bearer <token>`
- Body: `{ bookingId, amount }`

**POST /api/payments/confirm**
- Confirm payment
- Headers: `Authorization: Bearer <token>`
- Body: `{ bookingId, paymentMethod, paymentIntentId }`

## 🔐 Security Features

- Password encryption with bcryptjs
- JWT token authentication
- CORS protection
- Email verification for signup
- OTP-based password reset
- Input validation on frontend and backend
- Secure payment processing with Stripe

## 📩 Email Features

- OTP verification emails
- Booking confirmation with ticket details
- 10-minute reminder emails before event
- Refund confirmation emails
- Professional HTML email templates

## 🎫 Booking Workflow

1. User logs in with email/phone and password
2. Selects booking type (Movie, Concert, Bus, etc.)
3. Selects items and preferred seats/dates
4. Enters traveler details
5. Makes payment through Stripe
6. Receives booking confirmation via email
7. Gets reminder email 10 minutes before event
8. Can view/manage bookings in account

## 💳 Payment Methods Supported

- Credit Card
- Debit Card
- UPI
- Net Banking
- Digital Wallets (via Stripe)

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
Solution: Start MongoDB service or check connection string
```

### Email Not Sending
```
Solution: Check SMTP credentials and enable Less Secure App Access in Gmail settings
```

### CORS Error
```
Solution: Ensure backend FRONTEND_URL is correctly set in .env
```

### Payment Fails
```
Solution: Check Stripe API keys and use test card: 4242 4242 4242 4242
```

## 📝 License

© 2026 NA-NI TICKETS. All rights reserved.

## 📧 Contact

**Email:** dogiparthynitindatta@gmail.com

For support and inquiries, please reach out to the email above.

## 🙏 Thank You

Thank you for using NA-NI TICKETS! We hope you enjoy booking your tickets with us.

---

**Version:** 1.0.0  
**Last Updated:** February 2026
