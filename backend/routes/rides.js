const express = require('express');
const router = express.Router();
const { Ride, User, DriverDetail, Message } = require('../models');
const { protect } = require('../middleware/auth');

// @desc    Calculate ride fare estimation
// @route   POST /api/rides/estimate
// @access  Private
router.post('/estimate', protect, async (req, res) => {
  const { distance, duration, rideType } = req.body;

  if (distance === undefined || duration === undefined) {
    return res.status(400).json({ message: 'Distance and duration are required' });
  }

  try {
    const baseFare = parseFloat(process.env.BASE_FARE || '500');
    const ratePerUnit = parseFloat(process.env.PER_UNIT_FARE || '1.75');
    const driverAllowance = parseFloat(process.env.DRIVER_ALLOWANCE || '250');

    // Outstation pricing: single side (one-way) is costly and charged at 2X of the normal trip distance rate.
    // Round trip is charged at 1.75X of the single side rate, which is a 3.5X multiplier overall.
    const multiplier = rideType === 'both' ? 3.5 : 2.0;
    const distanceFare = distance * ratePerUnit * multiplier;
    
    // Driver allowance only applies for dual side (round trip) overnight coverage
    const allowance = rideType === 'both' ? driverAllowance : 0;

    const totalFare = Math.round(baseFare + distanceFare + allowance);

    res.json({
      baseFare,
      distanceFare,
      allowance,
      totalFare,
      ratePerUnit,
      distance,
      duration,
      rideType
    });
  } catch (error) {
    console.error('Estimate error:', error);
    res.status(500).json({ message: 'Server error during estimation', error: error.message });
  }
});

// @desc    Get user ride history
// @route   GET /api/rides/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    let rides;
    if (req.user.role === 'rider') {
      rides = await Ride.findAll({
        where: { riderId: req.user.id },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'driver',
            attributes: ['id', 'name', 'email'],
            include: [{ model: DriverDetail, as: 'driverDetail' }]
          }
        ]
      });
    } else {
      rides = await Ride.findAll({
        where: { driverId: req.user.id },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'rider',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    }

    res.json({ rides });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ message: 'Server error fetching ride history', error: error.message });
  }
});

// @desc    Get single ride details
// @route   GET /api/rides/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'rider',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'email'],
          include: [{ model: DriverDetail, as: 'driverDetail' }]
        },
        {
          model: Message,
          as: 'messages',
          order: [['createdAt', 'ASC']],
          include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check authorization: user must be rider or driver of the ride
    if (ride.riderId !== req.user.id && ride.driverId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this ride' });
    }

    res.json({ ride });
  } catch (error) {
    console.error('Fetch ride error:', error);
    res.status(500).json({ message: 'Server error fetching ride details', error: error.message });
  }
});

module.exports = router;
