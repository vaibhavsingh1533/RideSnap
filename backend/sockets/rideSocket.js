const { User, DriverDetail, Ride, Message } = require('../models');

// Track online users and active drivers in-memory
const onlineUsers = new Map(); // userId -> socketId
const onlineDrivers = new Map(); // userId -> { socketId, lat, lng }

const rideSocket = (io) => {
  io.on('connection', (socket) => {
    // console.log('Client connected:', socket.id);

    // Register User
    socket.on('register_user', async ({ userId, role }) => {
      socket.userId = userId;
      socket.role = role;
      onlineUsers.set(userId, socket.id);
      
      if (role === 'driver') {
        try {
          // Fetch driver details to verify offline/online status
          const driver = await DriverDetail.findOne({ where: { userId } });
          if (driver && driver.isOnline) {
            onlineDrivers.set(userId, {
              socketId: socket.id,
              lat: driver.currentLat || 0,
              lng: driver.currentLng || 0
            });
          }
        } catch (err) {
          console.error('Error fetching driver on register:', err);
        }
      }
      
      // console.log(`User registered: ${userId} (${role})`);
    });

    // Driver toggles online status
    socket.on('toggle_online', async ({ userId, isOnline, lat, lng }) => {
      try {
        const driver = await DriverDetail.findOne({ where: { userId } });
        if (driver) {
          driver.isOnline = isOnline;
          if (isOnline) {
            driver.currentLat = lat;
            driver.currentLng = lng;
            await driver.save();
            onlineDrivers.set(userId, { socketId: socket.id, lat, lng });
          } else {
            await driver.save();
            onlineDrivers.delete(userId);
          }
          
          // Emit confirmation back
          socket.emit('online_toggled', { isOnline, lat, lng });
        }
      } catch (err) {
        console.error('Error toggling online status:', err);
        socket.emit('error', { message: 'Failed to update online status' });
      }
    });

    // Driver sends live location updates
    socket.on('driver_location_update', async ({ userId, lat, lng, activeRideId }) => {
      try {
        if (onlineDrivers.has(userId)) {
          const driverInfo = onlineDrivers.get(userId);
          driverInfo.lat = lat;
          driverInfo.lng = lng;
          onlineDrivers.set(userId, driverInfo);
        }

        // Update database occasionally (or every time for accuracy in demo)
        await DriverDetail.update(
          { currentLat: lat, currentLng: lng },
          { where: { userId } }
        );

        // If the driver is on an active ride, broadcast the position to the rider
        if (activeRideId) {
          io.to(`ride_${activeRideId}`).emit('driver_location_shared', { lat, lng });
        }
      } catch (err) {
        console.error('Error updating driver location:', err);
      }
    });

    // Rider requests a ride
    socket.on('request_ride', async (rideData) => {
      const {
        riderId,
        pickupAddress,
        dropoffAddress,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        distance,
        duration,
        rideType,
        baseFare,
        distanceFare,
        allowance,
        totalFare
      } = rideData;

      try {
        // Generate 4-digit trip OTP code
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Create the Ride record in the database
        const ride = await Ride.create({
          riderId,
          pickupAddress,
          dropoffAddress,
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          distance,
          duration,
          rideType,
          baseFare,
          distanceFare,
          allowance,
          totalFare,
          status: 'requested',
          otp: otpCode
        });

        // Fetch ride details along with Rider info to broadcast
        const fullRide = await Ride.findByPk(ride.id, {
          include: [{ model: User, as: 'rider', attributes: ['id', 'name'] }]
        });

        // Let the rider know the booking is created and searching
        socket.emit('ride_created', fullRide);

        // Find and notify all online drivers
        let notifiedDriversCount = 0;
        onlineDrivers.forEach((driverInfo, driverId) => {
          // Double check driver is online and not on active ride (simplification: send to all online drivers)
          const driverSocketId = driverInfo.socketId;
          if (driverSocketId) {
            io.to(driverSocketId).emit('ride_request_received', fullRide);
            notifiedDriversCount++;
          }
        });

        // console.log(`New outstation ride requested. Broadcasted to ${notifiedDriversCount} drivers.`);
      } catch (err) {
        console.error('Error requesting ride:', err);
        socket.emit('error', { message: 'Failed to create ride request' });
      }
    });

    // Driver accepts a ride
    socket.on('accept_ride', async ({ rideId, driverId }) => {
      try {
        const ride = await Ride.findByPk(rideId);
        if (!ride) {
          socket.emit('error', { message: 'Ride no longer exists' });
          return;
        }

        if (ride.status !== 'requested') {
          socket.emit('ride_already_taken', { message: 'This ride has already been accepted by another driver' });
          return;
        }

        // Assign driver and update status
        ride.driverId = driverId;
        ride.status = 'accepted';
        await ride.save();

        // Join driver to ride room
        socket.join(`ride_${rideId}`);

        // Fetch user rider socket to notify them
        const riderSocketId = onlineUsers.get(ride.riderId);
        
        // Fetch full ride info with driver details for notification
        const updatedRide = await Ride.findByPk(rideId, {
          include: [
            { model: User, as: 'rider', attributes: ['id', 'name'] },
            { 
              model: User, 
              as: 'driver', 
              attributes: ['id', 'name'],
              include: [{ model: DriverDetail, as: 'driverDetail' }]
            }
          ]
        });

        if (riderSocketId) {
          io.to(riderSocketId).emit('ride_accepted', updatedRide);
        }

        socket.emit('ride_accepted_confirmation', updatedRide);

        // Notify other drivers that ride is no longer available
        io.emit('ride_withdrawn', { rideId });

      } catch (err) {
        console.error('Error accepting ride:', err);
        socket.emit('error', { message: 'Failed to accept ride' });
      }
    });

    // Join ride socket room (for chat & tracking updates)
    socket.on('join_ride', ({ rideId }) => {
      socket.join(`ride_${rideId}`);
      // console.log(`Socket ${socket.id} joined room ride_${rideId}`);
    });

    // Leave ride room
    socket.on('leave_ride', ({ rideId }) => {
      socket.leave(`ride_${rideId}`);
      // console.log(`Socket ${socket.id} left room ride_${rideId}`);
    });

    // Update ride status (arrived, in_progress, completed)
    socket.on('update_ride_status', async ({ rideId, status }) => {
      try {
        const ride = await Ride.findByPk(rideId);
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        ride.status = status;
        await ride.save();

        // Broadcast status update to the room
        io.to(`ride_${rideId}`).emit('ride_status_updated', { rideId, status });

        // If completed, update driver stats
        if (status === 'completed' && ride.driverId) {
          const driverDetail = await DriverDetail.findOne({ where: { userId: ride.driverId } });
          if (driverDetail) {
            driverDetail.totalTrips += 1;
            driverDetail.totalEarnings += ride.totalFare;
            await driverDetail.save();
          }
        }
      } catch (err) {
        console.error('Error updating ride status:', err);
        socket.emit('error', { message: 'Failed to update ride status' });
      }
    });

    // Verify Ride Start OTP
    socket.on('verify_otp', async ({ rideId, otp }) => {
      try {
        const ride = await Ride.findByPk(rideId);
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        if (ride.otp === otp) {
          ride.status = 'in_progress';
          await ride.save();

          // Broadcast status update to the room
          io.to(`ride_${rideId}`).emit('ride_status_updated', { rideId, status: 'in_progress' });
          socket.emit('otp_verified', { success: true });
        } else {
          socket.emit('otp_verified', { success: false, message: 'Invalid OTP. Please double check with the Rider.' });
        }
      } catch (err) {
        console.error('Error verifying OTP:', err);
        socket.emit('error', { message: 'Failed to verify OTP' });
      }
    });

    // Live chat message exchange
    socket.on('send_message', async ({ rideId, senderId, content }) => {
      try {
        const message = await Message.create({
          rideId,
          senderId,
          content
        });

        const fullMessage = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
        });

        // Broadcast to the room (both rider and driver)
        io.to(`ride_${rideId}`).emit('message_received', fullMessage);
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Clean up maps
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        if (socket.role === 'driver') {
          onlineDrivers.delete(socket.userId);
        }
        // console.log(`User disconnected: ${socket.userId}`);
      }
    });
  });
};

module.exports = { rideSocket, onlineUsers, onlineDrivers };
