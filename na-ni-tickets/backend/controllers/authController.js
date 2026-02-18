const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendEmailOTP } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route POST /api/auth/signup
// @desc Register a new user
exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });

    await user.save();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = new OTP({
      email,
      otp,
      type: 'signup',
    });

    await otpRecord.save();

    // Send OTP email (continue even if it fails)
    try {
      await sendEmailOTP(email, otp, 'signup');
    } catch (emailError) {
      console.log('⚠️ Email failed, but OTP saved.');
    }

    res.status(201).json({
      success: true,
      message: 'Signup successful! OTP has been generated.',
      email,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-otp
// @desc Verify OTP for signup or password reset
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and type are required',
      });
    }

    const otpRecord = await OTP.findOne({
      email,
      otp,
      type,
      isUsed: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    if (type === 'signup') {
      // Mark user as verified
      const user = await User.findOne({ email });
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully!',
        token,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      });
    }

    if (type === 'forgotPassword') {
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      return res.status(200).json({
        success: true,
        message: 'OTP verified. You can now reset your password',
        resetToken,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
// @desc Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isEmailVerified) {
      // Resend OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpRecord = new OTP({
        email,
        otp,
        type: 'signup',
      });
      await otpRecord.save();
      
      // Send email (continue even if it fails)
      try {
        await sendEmailOTP(email, otp, 'signup');
      } catch (emailError) {
        console.log('⚠️ Email failed, but OTP saved.');
      }

      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. OTP sent to your email',
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/forgot-password
// @desc Send OTP for password reset
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number',
      });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = new OTP({
      email: user.email,
      otp,
      type: 'forgotPassword',
    });

    await otpRecord.save();
    
    // Send email (continue even if it fails)
    try {
      await sendEmailOTP(user.email, otp, 'forgotPassword');
    } catch (emailError) {
      console.log('⚠️ Email failed, but OTP saved.');
    }

    res.status(200).json({
      success: true,
      message: 'OTP has been generated.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/reset-password
// @desc Reset password with reset token
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully!',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired',
      });
    }
    next(error);
  }
};

// @route POST /api/auth/resend-otp
// @desc Resend OTP for signup or password reset
exports.resendOTP = async (req, res, next) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email and type are required',
      });
    }

    // Delete old OTP
    await OTP.deleteMany({ email, type });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = new OTP({
      email,
      otp,
      type,
    });

    await otpRecord.save();

    // Send OTP email (continue even if it fails)
    try {
      await sendEmailOTP(email, otp, type);
    } catch (emailError) {
      console.log('⚠️ Email failed, but OTP saved.');
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully!',
      email,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
// @desc Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('bookings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
