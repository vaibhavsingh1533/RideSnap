const Ride = require("../models/Ride");

const bookRide = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropLocation,
      fare,
      distance
    } = req.body;

    const generatedOtp = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    const ride = await Ride.create({
      user: req.user.id,
      pickupLocation,
      dropLocation,
      fare,
      distance: Number(distance),
      otp: generatedOtp
    });

    res.status(201).json({
      message: "Ride booked successfully",
      ride
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      user: req.user.id
    }).populate("user", "name email");

    res.status(200).json(rides);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    ride.status = "accepted";
    ride.driverName = "Rahul Sharma";
    ride.vehicleNumber = "MP09AB1234";
    ride.cabType = "Sedan";

    await ride.save();

    res.status(200).json({
      message: "Ride accepted",
      ride
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const completeRide = async (req, res) => {
  try {
    const { rideId, otp } = req.body;

    const ride = await Ride.findById(rideId).populate(
      "user",
      "name email"
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    if (ride.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    ride.otpVerified = true;
    ride.status = "completed";

    await ride.save();

    const io = req.app.get("io");

    if (io && ride.user?._id) {
      io.to(ride.user._id.toString()).emit(
        "rideStatusUpdate",
        {
          message: "Ride completed successfully",
          ride
        }
      );
    }

    res.status(200).json({
      message: "Ride completed",
      ride
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(rides);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    if (ride.status === "completed") {
      return res.status(400).json({
        message: "Completed ride cannot be cancelled"
      });
    }

    ride.status = "cancelled";

    await ride.save();

    res.status(200).json({
      message: "Ride cancelled successfully",
      ride
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const submitReview = async (req, res) => {
  try {
    const { rideId, rating, review } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found"
      });
    }

    if (ride.status !== "completed") {
      return res.status(400).json({
        message: "Only completed rides can be reviewed"
      });
    }

    ride.rating = rating;
    ride.review = review;

    await ride.save();

    res.status(200).json({
      message: "Review submitted successfully",
      ride
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  bookRide,
  getUserRides,
  acceptRide,
  getAllRides,
  completeRide,
  cancelRide,
  submitReview
};