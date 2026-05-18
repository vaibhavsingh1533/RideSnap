const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  bookRide,
  getUserRides,
  acceptRide,
  getAllRides,
  completeRide,
  cancelRide,
  submitReview
} = require("../controllers/rideController");

router.post("/book", authMiddleware, bookRide);

router.get("/myrides", authMiddleware, getUserRides);

router.post("/accept", authMiddleware, acceptRide);

router.get("/all", authMiddleware, getAllRides);

router.post("/complete", authMiddleware, completeRide);

router.post("/cancel", authMiddleware, cancelRide);

router.post("/review", authMiddleware, submitReview);

module.exports = router;