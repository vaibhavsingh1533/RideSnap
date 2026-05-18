const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pickupLocation: {
      type: String,
      required: true
    },

    dropLocation: {
      type: String,
      required: true
    },

    fare: {
      type: Number,
      required: true
    },

    distance: {
      type: Number,
      default: 0
    },

    driverName: {
      type: String,
      default: ""
    },

    vehicleNumber: {
      type: String,
      default: ""
    },

    cabType: {
      type: String,
      default: "Sedan"
    },

    otp: {
      type: String,
      default: ""
    },

    otpVerified: {
      type: Boolean,
      default: false
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    review: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "ongoing",
        "completed",
        "cancelled"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Ride", rideSchema);