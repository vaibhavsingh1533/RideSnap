const User = require('./User');
const DriverDetail = require('./DriverDetail');
const Ride = require('./Ride');
const Message = require('./Message');
const { sequelize } = require('../config/database');

// User <-> DriverDetail (One-to-One)
User.hasOne(DriverDetail, { foreignKey: 'userId', as: 'driverDetail', onDelete: 'CASCADE' });
DriverDetail.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Ride (One-to-Many, as Rider)
User.hasMany(Ride, { foreignKey: 'riderId', as: 'riderRides', onDelete: 'CASCADE' });
Ride.belongsTo(User, { foreignKey: 'riderId', as: 'rider' });

// User <-> Ride (One-to-Many, as Driver)
User.hasMany(Ride, { foreignKey: 'driverId', as: 'driverRides', onDelete: 'SET NULL' });
Ride.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// Ride <-> Message (One-to-Many)
Ride.hasMany(Message, { foreignKey: 'rideId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });

// User <-> Message (One-to-Many, as Sender)
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

module.exports = {
  sequelize,
  User,
  DriverDetail,
  Ride,
  Message
};
