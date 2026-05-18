const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User joined room: ${userId}`);
    });

    // Ride accepted
    socket.on("rideAccepted", ({ userId, ride }) => {
      io.to(userId).emit("rideStatusUpdate", {
        message: "Driver accepted your ride",
        ride
      });
    });

    // LIVE DRIVER LOCATION
    socket.on("driverLocationUpdate", (data) => {
      io.to(data.userId).emit("liveLocation", {
        lat: data.lat,
        lng: data.lng
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;