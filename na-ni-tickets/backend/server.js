require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { authMiddleware, errorHandler } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const itemRoutes = require('./routes/itemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers - CSP with frame-ancestors (must be in headers, not meta tags)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:* ws://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http: https:; font-src 'self'; media-src 'self' data: blob: http: https:; frame-ancestors 'none';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NA-NI TICKETS API Server',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
    ========================================
    NA-NI TICKETS SERVER
    ========================================
    Server running on port: ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    Frontend URL: ${process.env.FRONTEND_URL}
    ========================================
  `);
});

module.exports = app;
// start background workers
try{
  const { startReminderWorker } = require('./utils/reminderWorker')
  startReminderWorker()
}catch(err){
  console.warn('Could not start reminder worker:', err.message)
}
