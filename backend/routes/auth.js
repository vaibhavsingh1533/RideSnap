const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, DriverDetail } = require('../models');
const { protect } = require('../middleware/auth');

// Generate JWT Helper
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'supersecretjwtkeyforridesnap',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (rider or driver)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, carName, carModel, carNumber, carType, licenseNumber } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create base user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'rider'
    });

    // If driver, create driver details
    if (role === 'driver') {
      if (!carName || !carModel || !carNumber || !licenseNumber) {
        // Rollback user creation if driver details missing
        await user.destroy();
        return res.status(400).json({ message: 'Driver registration requires vehicle details (carName, carModel, carNumber, licenseNumber)' });
      }

      await DriverDetail.create({
        userId: user.id,
        carName,
        carModel,
        carNumber,
        carType: carType || 'sedan',
        licenseNumber,
        isOnline: false
      });
    }

    // Get user with details for response
    const registeredUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: role === 'driver' ? [{ model: DriverDetail, as: 'driverDetail' }] : []
    });

    res.status(201).json({
      token: generateToken(user.id, user.role),
      user: registeredUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: DriverDetail, as: 'driverDetail', required: false }]
    });

    if (user && (await user.comparePassword(password))) {
      // Create response user without password
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json({
        token: generateToken(user.id, user.role),
        user: userResponse
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
