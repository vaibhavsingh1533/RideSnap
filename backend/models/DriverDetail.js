const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DriverDetail = sequelize.define('DriverDetail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  carName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  carModel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  carNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  carType: {
    type: DataTypes.ENUM('hatchback', 'sedan', 'suv'),
    allowNull: false,
    defaultValue: 'sedan'
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  currentLat: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: true
  },
  currentLng: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0
  },
  totalTrips: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalEarnings: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  }
});

module.exports = DriverDetail;
