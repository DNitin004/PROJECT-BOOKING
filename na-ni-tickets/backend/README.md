# NA-NI TICKETS Backend

Express.js backend for the NA-NI TICKETS booking platform.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Configure Environment
Create/update `.env` file with your configurations (see main README.md)

### Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 📚 API Routes

### Authentication
```
POST   /api/auth/signup           - Register new user
POST   /api/auth/login            - Login user  
POST   /api/auth/verify-otp       - Verify OTP
POST   /api/auth/forgot-password  - Request password reset
POST   /api/auth/reset-password   - Reset password
GET    /api/auth/me               - Get current user (protected)
```

### Bookings
```
POST   /api/bookings/movie        - Book movie (protected)
POST   /api/bookings/concert      - Book concert (protected)
POST   /api/bookings/bus          - Book bus (protected)
POST   /api/bookings/train        - Book train (protected)
POST   /api/bookings/flight       - Book flight (protected)
POST   /api/bookings/car          - Book car (protected)
GET    /api/bookings              - Get user bookings (protected)
GET    /api/bookings/:id          - Get booking details (protected)
POST   /api/bookings/:id/cancel   - Cancel booking (protected)
```

### Items
```
GET    /api/items/movies          - Get all movies
GET    /api/items/movies/:id      - Get movie details
GET    /api/items/concerts        - Get all concerts
GET    /api/items/concerts/:id    - Get concert details
GET    /api/items/buses           - Get buses
GET    /api/items/buses/:id       - Get bus details
GET    /api/items/trains          - Get trains
GET    /api/items/trains/:id      - Get train details
GET    /api/items/flights         - Get flights
GET    /api/items/flights/:id     - Get flight details
GET    /api/items/cars            - Get cars
GET    /api/items/cars/nearby     - Get nearby cars
GET    /api/items/cars/:id        - Get car details
```

### Payments
```
POST   /api/payments/create-intent - Create payment intent (protected)
POST   /api/payments/confirm       - Confirm payment (protected)
POST   /api/payments/refund        - Process refund (protected)
GET    /api/payments/:booking_id  - Get payment details (protected)
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **stripe** - Payment processing
- **cors** - CORS middleware
- **express-validator** - Input validation
- **dotenv** - Environment variables

## 🗄️ Database Models

- **User** - User accounts with profile
- **OTP** - One-time passwords for verification
- **Movie** - Movie listings with shows
- **Concert** - Concert listings with ticket categories
- **Bus** - Bus routes and availability
- **Train** - Train journeys and coaches
- **Flight** - Flight routes and classes
- **Car** - Car listings with location
- **Booking** - Booking records
- **Payment** - Payment transactions

## 🔒 Middleware

- **authMiddleware** - Validates JWT tokens
- **errorHandler** - Global error handling

## 📧 Email Service

Sends:
- OTP emails for signup/password reset
- Booking confirmations
- Event reminder emails (10 minutes before)

## 💳 Payment Processing

Integrated with Stripe for:
- Payment intent creation
- Payment confirmation
- Refund processing

## 🗂️ Project Structure

```
backend/
├── config/
│   └── database.js              # MongoDB connection
├── models/                       # Mongoose schemas
├── controllers/                  # Business logic
├── routes/                       # API routes
├── middleware/                   # Custom middleware
├── utils/                        # Utility functions (emailService)
├── .env                          # Environment variables
├── server.js                     # Main server file
└── package.json
```

## 🧪 Testing

Use Postman or similar tools to test API endpoints.

Test with sample data:
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "phoneNumber": "9876543210",
  "password": "Test@123"
}
```

## 📝 License

© 2026 NA-NI TICKETS. All rights reserved.
