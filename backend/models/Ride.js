const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ride = sequelize.define('Ride', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pickupAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dropoffAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pickupLat: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: false
  },
  pickupLng: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: false
  },
  dropoffLat: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: false
  },
  dropoffLng: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: false
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  duration: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  rideType: {
    type: DataTypes.ENUM('single', 'both'),
    allowNull: false,
    defaultValue: 'single'
  },
  baseFare: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  distanceFare: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  allowance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  totalFare: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'requested'
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid'),
    defaultValue: 'pending'
  }
});

module.exports = Ride;
