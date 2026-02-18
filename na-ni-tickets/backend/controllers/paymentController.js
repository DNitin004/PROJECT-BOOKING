const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendBookingConfirmation } = require('../utils/emailService');

// Generate transaction ID
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 10000);
};

// @route POST /api/payments/create-intent
// @desc Create Stripe payment intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required',
      });
    }

    // allow either booking._id or booking.bookingId (human ref)
    let booking = null
    try{
      booking = await Booking.findOne({ _id: bookingId, userId: req.user.id })
    }catch(e){}
    if(!booking){
      booking = await Booking.findOne({ bookingId, userId: req.user.id })
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: 'inr',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/confirm
// @desc Confirm payment
exports.confirmPayment = async (req, res, next) => {
  try {
    // Accept either: { bookingId, paymentMethod, paymentIntentId }
    // or simulated: { bookingId, transactionId, method }
    const { bookingId, paymentMethod, paymentIntentId, transactionId, method } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    // find by _id or bookingId
    let booking = null
    try{ booking = await Booking.findOne({ _id: bookingId, userId }) }catch(e){}
    if(!booking) booking = await Booking.findOne({ bookingId, userId })

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const txn = transactionId || generateTransactionId();
    const pm = paymentMethod || (method === 'card' ? 'Credit Card' : method || 'Credit Card');

    // Create payment record
    const payment = new Payment({
      bookingId: booking._id,
      userId,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentMethod: pm,
      stripePaymentId: paymentIntentId || null,
      transactionId: txn,
      status: 'Completed',
      paymentDetails: {
        cardLast4: '****',
        cardBrand: 'Unknown',
      },
    });

    await payment.save();

    // Update booking
    booking.paymentId = payment._id;
    booking.paymentStatus = 'Completed';
    booking.status = 'Confirmed';
    await booking.save();

    // Send booking confirmation email
    const user = await User.findById(userId);
    const bookingDetails = {
      userName: `${user.firstName} ${user.lastName}`,
      bookingId: booking.bookingId,
      bookingType: booking.bookingType,
      date: booking.journeyDate,
      seats: (booking.seats || []).join(', '),
      totalAmount: booking.totalAmount,
      venue: booking.departureLocation,
    };

    if (typeof sendBookingConfirmation === 'function') {
      await sendBookingConfirmation(user.email, bookingDetails);
    }

    res.status(200).json({
      success: true,
      message: 'Payment successful!',
      payment: {
        transactionId: txn,
        amount: booking.totalAmount,
        bookingId: booking.bookingId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/refund
// @desc Refund payment
exports.refundPayment = async (req, res, next) => {
  try {
    const { bookingId, reason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const payment = await Payment.findById(booking.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    if (payment.status === 'Refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded',
      });
    }

    // Process refund with Stripe
    if (payment.stripePaymentId) {
      const refund = await stripe.refunds.create({
        charge: payment.stripePaymentId,
      });

      payment.refundDetails = {
        refundId: refund.id,
        refundAmount: refund.amount / 100, // Convert from cents
        refundReason: reason,
        refundDate: new Date(),
        refundStatus: 'Completed',
      };
    }

    payment.status = 'Refunded';
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refundAmount: payment.amount,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/payments/:bookingId
// @desc Get payment details
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const payment = await Payment.findById(booking.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
