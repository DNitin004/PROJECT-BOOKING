# NA-NI TICKETS - System Architecture & Data Flow

Complete technical documentation of the platform architecture, data models, and system design.

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                   (React Frontend on :3000)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST + WebSocket
                           │ (Axios)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                 EXPRESS.JS API SERVER (:5000)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Auth Routes  │  │ Booking      │  │ Item Routes  │           │
│  │              │  │ Routes       │  │              │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ Controllers  │  │ Controllers  │  │ Controllers  │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ Middleware   │  │ Validation   │  │ Stripe API   │           │
│  │ (JWT, Auth)  │  │ Error Handle │  │ Nodemailer   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐  ┌──────────────┐  ┌──────────────┐
    │ MongoDB  │  │ Stripe API   │  │ Gmail SMTP   │
    │ Database │  │ (Payments)   │  │ (Email)      │
    └──────────┘  └──────────────┘  └──────────────┘
```

## 🗂️ Project Structure

```
na-ni-tickets/
│
├── backend/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js                  # User accounts (10 fields)
│   │   ├── OTP.js                   # One-time passwords (10 min expiry)
│   │   ├── Movie.js                 # Movie listings
│   │   ├── Concert.js               # Concert bookings
│   │   ├── Bus.js                   # Bus routes
│   │   ├── Train.js                 # Train journeys
│   │   ├── Flight.js                # Flight routes
│   │   ├── Car.js                   # Car rentals (geospatial indexed)
│   │   ├── Booking.js               # Booking records
│   │   └── Payment.js               # Payment transactions
│   │
│   ├── controllers/
│   │   ├── authController.js        # signup, login, OTP, reset password
│   │   ├── bookingController.js     # All 6 booking types + CRUD
│   │   ├── itemController.js        # Fetch items, filtering
│   │   └── paymentController.js     # Stripe integration, refunds
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # /auth/* endpoints
│   │   ├── bookingRoutes.js         # /bookings/* endpoints
│   │   ├── itemRoutes.js            # /items/* endpoints
│   │   └── paymentRoutes.js         # /payments/* endpoints
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT verification, error handling
│   │
│   ├── utils/
│   │   └── emailService.js          # Email templates & sending
│   │
│   ├── .env                         # Environment configuration
│   ├── server.js                    # Express app setup
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html               # HTML template
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js            # Navigation bar
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.js    # Route protection wrapper
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.js              # Landing page
│   │   │   ├── Home.css
│   │   │   ├── Login.js             # Authentication pages
│   │   │   ├── Signup.js
│   │   │   ├── ForgotPassword.js
│   │   │   ├── VerifyEmail.js
│   │   │   ├── ResetPassword.js
│   │   │   ├── Auth.css
│   │   │   │
│   │   │   ├── Movies.js            # Booking pages
│   │   │   ├── Concerts.js
│   │   │   ├── Buses.js
│   │   │   ├── Trains.js
│   │   │   ├── Flights.js
│   │   │   ├── Cars.js
│   │   │   ├── Items.css
│   │   │   │
│   │   │   ├── MovieDetails.js      # Detail pages
│   │   │   ├── ConcertDetails.js
│   │   │   ├── BookingPage.js
│   │   │   ├── PaymentPage.js
│   │   │   ├── BookingConfirmation.js
│   │   │   ├── MyBookings.js
│   │   │   ├── BookingDetails.js
│   │   │   └── Booking.css
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Axios instance, API calls
│   │   │
│   │   ├── store/
│   │   │   └── store.js             # Zustand stores (auth, booking, items)
│   │   │
│   │   ├── App.js                   # React Router setup
│   │   ├── App.css
│   │   ├── index.js                 # Entry point
│   │   ├── index.css                # Global styles
│   │   └── .env
│   │
│   └── package.json
│
├── docker-compose.yml               # Multi-container orchestration
├── .gitignore                       # Git ignore rules
├── README.md                        # Main documentation
├── QUICK_START.md                   # 5-minute setup
├── SETUP_COMPLETE.md                # Post-setup guide
├── VERIFICATION_CHECKLIST.md        # Installation checklist
├── COMMANDS.md                      # Command reference
└── ARCHITECTURE.md                  # This file
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. SIGNUP
   ┌──────────────┐
   │ User enters: │
   │ - FirstName  │
   │ - LastName   │
   │ - Email      │
   │ - Phone      │
   │ - Password   │
   └──────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Validate input       │
   │ Check duplicate email│
   │ Hash password        │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Create User record   │
   │ emailVerified: false │
   │ Generate random OTP  │
   │ Create OTP record    │
   │ (10 min expiry)      │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Send OTP via email   │
   │ (using Nodemailer)   │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Response: OTP sent   │
   │ Redirect to verify   │
   └──────────────────────┘

2. VERIFY OTP
   ┌──────────────┐
   │ User enters: │
   │ - OTP (6 dig)│
   └──────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Query OTP collection │
   │ Check if valid/match │
   │ Check if expired     │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ If valid:            │
   │ - Delete OTP record  │
   │ - Set verified: true │
   │ - Generate JWT token │
   │ - (7 day expiry)     │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Response:            │
   │ - Token              │
   │ - User data          │
   │ Redirect to home     │
   └──────────────────────┘

3. LOGIN
   ┌──────────────┐
   │ User enters: │
   │ - Email      │
   │ - Password   │
   └──────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Find User by email   │
   │ Check if verified    │
   │ Compare password hash│
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ If valid:            │
   │ Generate JWT token   │
   │ (7 day expiry)       │
   │ Store in localStorage│
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Response:            │
   │ - Token              │
   │ - User data          │
   │ Redirect to home     │
   └──────────────────────┘

4. FORGOT PASSWORD
   ┌──────────────┐
   │ User enters: │
   │ - Email/Phone│
   └──────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Find User            │
   │ Generate new OTP     │
   │ (type: password_reset)
   │ Store in OTP table   │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Send OTP via email   │
   │ Response: OTP sent   │
   │ Redirect to verify   │
   └──────────────────────┘

5. RESET PASSWORD
   ┌──────────────────────┐
   │ User enters:         │
   │ - OTP (verified)     │
   │ - New password       │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Hash new password    │
   │ Update User record   │
   │ Delete OTP record    │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Response: Success    │
   │ Redirect to login    │
   └──────────────────────┘
```

## 🎫 Booking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      BOOKING FLOW                               │
└─────────────────────────────────────────────────────────────────┘

MOVIES:          CONCERTS:        BUSES:           TRAINS:
1. Browse        1. Browse        1. Browse        1. Browse
2. Select show   2. Select event  2. Select route  2. Select journey
3. Pick seat/s   3. Pick category 3. Pick seats    3. Pick coach/type
4. Confirm       4. Confirm       4. Enter details 4. Enter details
5. Pay           5. Pay           5. Confirm       5. Confirm
6. Print/Email   6. Print/Email   6. Pay           6. Pay
                                  7. Print/Email   7. Print/Email

FLIGHTS:         CARS:
1. Browse        1. Browse
2. Select flight 2. Select car
3. Pick class    3. Select date/time
4. Confirm       4. Pick passengers
5. Pay           5. Confirm
6. Print/Email   6. Pay
                 7. Details sent

COMPLETE BOOKING PROCESS:

START
  │
  ▼
┌────────────────────────┐
│ Load item by ID        │
│ (Movie/Concert/etc)    │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ User selects:          │
│ - Seats/Class/Category │
│ - Travelers info       │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Validate selection:    │
│ ✓ Seats available     │
│ ✓ Price correct       │
│ ✓ Date valid          │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Create BOOKING record: │
│ - bookingId (unique)   │
│ - userId               │
│ - itemId               │
│ - itemType             │
│ - selectedSeats: []    │
│ - totalPrice           │
│ - status: Pending      │
│ - travelers: []        │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Update item:           │
│ - Decrement available  │
│ - Mark seats/class     │
│   as booked            │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Redirect to Payment    │
│ Pass bookingId         │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ PAYMENT PAGE           │
│ Display: Total Price   │
│ Select: Payment method │
│ Click: Pay Now         │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Create Stripe Intent   │
│ - amount (in cents)    │
│ - currency: USD        │
│ - bookingId metadata   │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Payment success?       │
└────────────────────────┘
  │         │
  NO        YES
  │         │
  │         ▼
  │    ┌────────────────────────┐
  │    │ Update Booking:        │
  │    │ - status: Confirmed    │
  │    │ - paymentId            │
  │    │ - paidAt (timestamp)   │
  │    └────────────────────────┘
  │         │
  │         ▼
  │    ┌────────────────────────┐
  │    │ Create Payment record   │
  │    │ - transactionId        │
  │    │ - method               │
  │    │ - status: Success      │
  │    └────────────────────────┘
  │         │
  │         ▼
  │    ┌────────────────────────┐
  │    │ Send confirmation email│
  │    │ - Booking details      │
  │    │ - Ticket info          │
  │    │ - Unique ref number    │
  │    └────────────────────────┘
  │         │
  │         ▼
  │    ┌────────────────────────┐
  │    │ Redirect to:           │
  │    │ BookingConfirmation    │
  │    │ Display:               │
  │    │ - Booking ID           │
  │    │ - Tickets              │
  │    │ - Confirmation #       │
  │    │ - Print option         │
  │    └────────────────────────┘
  │         │
  │         ▼
  │    ┌────────────────────────┐
  │    │ Set reminder email      │
  │    │ (10 min before event)  │
  │    └────────────────────────┘
  │         │
  │         ▼
  │      SUCCESS
  │
  └─────→┌────────────────────────┐
         │ Show error message     │
         │ Preserve seat selection│
         │ Allow retry            │
         └────────────────────────┘

CANCELLATION FLOW:
  │
  ▼
Start
  │
  ▼
┌────────────────────────┐
│ Get Booking by ID      │
│ Check status:          │
│ - Can cancel if        │
│   Confirmed            │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Check cancellation fee │
│ - 80% refund allowed   │
│ - 20% platform fee     │
│ - Calculate amount     │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Initiate Stripe refund │
│ - Use transactionId    │
│ - Amount: 80%          │
│ - Add reason/note      │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Update Booking:        │
│ - status: Cancelled    │
│ - cancelledAt          │
│ - refundAmount         │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Free up seats/slots    │
│ Update item availability
│                        │
└────────────────────────┘
  │
  ▼
┌────────────────────────┐
│ Send cancellation      │
│ email with refund info │
│                        │
└────────────────────────┘
  │
  ▼
  SUCCESS
```

## 💾 Database Schema

### User Model

```
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (unique, lowercase),
  phone: String (10 digits validation),
  password: String (hashed, min 6 chars),
  emailVerified: Boolean (default: false),
  profilePicture: String (URL),
  bookings: [ObjectId] (refs to Booking),
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model

```
{
  _id: ObjectId,
  email: String,
  otp: String (6 digits),
  type: String (enum: ['signup', 'password_reset']),
  expiresAt: Date (TTL: 10 minutes),
  createdAt: Date
}
```

### Movie Model

```
{
  _id: ObjectId,
  title: String,
  description: String,
  genre: [String],
  language: String,
  rating: Number (0-10),
  posterUrl: String,
  duration: Number (minutes),
  shows: [{
    showId: ObjectId,
    time: String (HH:MM),
    theater: String,
    price: Number,
    totalSeats: Number (default: 120),
    bookedSeats: [Number]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Concert Model

```
{
  _id: ObjectId,
  title: String,
  artists: [String],
  description: String,
  venue: String,
  date: Date,
  thumbnail: String,
  categories: [{
    name: String (Gold/Premium/Silver),
    price: Number,
    available: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model

```
{
  _id: ObjectId,
  bookingId: String (unique, ref number),
  userId: ObjectId (ref to User),
  itemId: ObjectId (ref to item),
  itemType: String (enum: [movie, concert, bus, train, flight, car]),
  selectedItems: {
    seats: [String/Number],
    category: String,
    date: Date,
    time: String
  },
  travelers: [{
    name: String,
    email: String,
    phone: String,
    age: Number
  }],
  totalPrice: Number,
  status: String (enum: [Pending, Confirmed, Cancelled]),
  paymentId: ObjectId (ref to Payment),
  paidAt: Date,
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model

```
{
  _id: ObjectId,
  bookingId: ObjectId (ref to Booking),
  transactionId: String (Stripe),
  amount: Number,
  currency: String (USD),
  method: String (card, wallet, etc),
  status: String (enum: [Success, Failed, Pending]),
  refundId: String,
  refundAmount: Number,
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication (POST)

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password

GET /api/auth/me (Protected)
```

### Items (GET)

```
GET /api/items/movies
GET /api/items/movies/:id
GET /api/items/concerts
GET /api/items/concerts/:id
GET /api/items/buses
GET /api/items/buses/:id
GET /api/items/trains
GET /api/items/trains/:id
GET /api/items/flights
GET /api/items/flights/:id
GET /api/items/cars
GET /api/items/cars/:id

(Admin POST endpoints available)
```

### Bookings (Protected)

```
POST /api/bookings/movie
POST /api/bookings/concert
POST /api/bookings/bus
POST /api/bookings/train
POST /api/bookings/flight
POST /api/bookings/car

GET /api/bookings (all user bookings)
GET /api/bookings/:bookingId
POST /api/bookings/:bookingId/cancel
```

### Payments (Protected)

```
POST /api/payments/create-intent
POST /api/payments/confirm
POST /api/payments/refund

GET /api/payments/:bookingId
```

## 📱 Frontend Component Hierarchy

```
App
├── Navbar
│   ├── Logo
│   ├── NavLinks (Movies, Concerts, Buses, Trains, Flights, Cars)
│   └── UserMenu (Profile, My Bookings, Logout)
│
├── Routes (React Router)
│   ├── Public Routes
│   │   ├── Home
│   │   ├── Login
│   │   ├── Signup
│   │   ├── ForgotPassword
│   │   ├── VerifyEmail
│   │   └── ResetPassword
│   │
│   ├── Item List Routes (Public)
│   │   ├── Movies
│   │   ├── Concerts
│   │   ├── Buses
│   │   ├── Trains
│   │   ├── Flights
│   │   └── Cars
│   │
│   ├── Item Detail Routes
│   │   ├── MovieDetails
│   │   └── ConcertDetails
│   │
│   └── Protected Routes (ProtectedRoute wrapper)
│       ├── BookingPage
│       ├── PaymentPage
│       ├── BookingConfirmation
│       ├── MyBookings
│       │   └── BookingDetails (nested)
│       └── ProfilePage
```

## 🔄 State Management (Zustand)

### useAuthStore

```javascript
{
  user: {
    _id, firstName, lastName, email, 
    phone, profilePicture, bookings
  },
  token: "JWT_TOKEN",
  
  // Actions
  setUser(userData),
  setToken(jwtToken),
  logout(),
  isAuthenticated: computed boolean
}
```

### useBookingStore

```javascript
{
  selectedSeats: [],
  selectedCategory: null,
  bookingType: "movie", // enum
  travelers: [],
  
  // Actions
  addSeat(seatId),
  removeSeat(seatId),
  toggleSeat(seatId),
  clearSelection(),
  addTraveler(travelerData),
  setBookingType(type)
}
```

### useItemStore

```javascript
{
  movies: [],
  concerts: [],
  buses: [],
  trains: [],
  flights: [],
  cars: [],
  
  // Actions
  setMovies(data),
  setConcerts(data),
  // ... similar for all types
  getMovieById(id): computed
}
```

## 🔐 Security Features

1. **Password Security**
   - Bcryptjs hashing with salt rounds
   - Min 6 characters validation
   - Never stored in plain text

2. **Authentication**
   - JWT tokens with 7-day expiry
   - Automatic token injection in API calls
   - Auto-logout on token expiry (401)

3. **Email Verification**
   - OTP with 10-minute expiry
   - Auto-delete expired OTPs
   - Type-based templates (signup vs password_reset)

4. **API Security**
   - CORS middleware configured
   - Helmet headers (recommended)
   - Input validation on all endpoints
   - Error handling hides sensitive info

5. **Payment Security**
   - Stripe PCI compliance
   - No card storage in DB
   - Transaction IDs for tracking
   - Refund processing with audit trail

6. **Data Protection**
   - Phone number regex validation
   - Email format validation
   - SQL injection prevention (MongoDB native)
   - XSS protection through React escaping

## 📊 Database Indexes

Recommended MongoDB indexes for performance:

```javascript
// User
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 })

// OTP (with TTL)
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Booking
db.bookings.createIndex({ userId: 1, createdAt: -1 })
db.bookings.createIndex({ bookingId: 1 })
db.bookings.createIndex({ status: 1 })

// Car (geospatial)
db.cars.createIndex({ location: "2dsphere" })

// Payment
db.payments.createIndex({ bookingId: 1 })
db.payments.createIndex({ transactionId: 1 })
```

## 🌐 Environment Configuration

### Backend .env

- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Token signing key
- `JWT_EXPIRE` - Token lifespan (7d)
- `PORT` - Server port (5000)
- `FRONTEND_URL` - CORS origin
- `SMTP_*` - Email service credentials
- `STRIPE_*` - Payment API keys
- `OTP_EXPIRY` - OTP validity (10 min)

### Frontend .env

- `REACT_APP_API_URL` - Backend base URL
- `REACT_APP_STRIPE_PUBLIC_KEY` - Stripe publishable key

## 🚀 Deployment Architecture

### Development

```
localhost:3000 (React Dev Server)
     ↓
localhost:5000 (Express Server)
     ↓
MongoDB (Local or Atlas)
```

### Production (Docker)

```
Docker Container: React (Serve)
     ↓
Docker Container: Express
     ↓
Docker Container: MongoDB
```

## 📈 Scaling Considerations

1. **Database**: Use MongoDB Atlas for cloud scaling
2. **Caching**: Redis for session/token caching
3. **CDN**: Serve static assets via CDN
4. **Load Balancer**: Use Nginx for multiple backend instances
5. **Monitoring**: Implement logging (Winston/Morgan)
6. **Analytics**: Track booking metrics

## ✅ Testing Strategy

1. **Unit Tests**: Controller functions
2. **Integration Tests**: API endpoints
3. **E2E Tests**: Complete user workflows
4. **Load Testing**: Concurrent bookings
5. **Security Testing**: SQL injection, XSS, CSRF

## 📞 Key Contacts

- **Admin Email**: <dogiparthynitindatta@gmail.com>
- **Project**: NA-NI TICKETS
- **Support**: See README.md for troubleshooting

---

This architecture ensures:
✅ Scalability through clean separation
✅ Security through authentication and validation
✅ Maintainability through organized structure
✅ Performance through proper indexing
✅ Reliability through error handling

Last Updated: 2024
