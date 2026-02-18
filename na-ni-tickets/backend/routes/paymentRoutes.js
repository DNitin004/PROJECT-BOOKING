const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getPaymentDetails,
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

// All payment routes require authentication
router.use(authMiddleware);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/refund', refundPayment);
router.get('/:bookingId', getPaymentDetails);

module.exports = router;
