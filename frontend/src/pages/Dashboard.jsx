import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Dashboard() {
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [reviewRide, setReviewRide] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [driverLocation, setDriverLocation] = useState(null);

  const { darkMode } = useTheme();

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/rides/myrides", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRides(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRides();

    if (user?._id) {
      socket.emit("join", user._id);
    }

    socket.on("rideStatusUpdate", (data) => {
      alert(data.message);
      fetchRides();
    });

    socket.on("liveLocation", (data) => {
      setDriverLocation({
        lat: data.lat,
        lng: data.lng
      });
    });

    return () => {
      socket.off("rideStatusUpdate");
      socket.off("liveLocation");
    };
  }, []);

  const cancelRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/rides/cancel",
        { rideId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Ride cancelled");
      fetchRides();

    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel ride");
    }
  };

  const submitReview = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/rides/review",
        {
          rideId: reviewRide._id,
          rating,
          review
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Review submitted successfully");

      setReviewRide(null);
      setRating(5);
      setReview("");

      fetchRides();

    } catch (error) {
      alert(error.response?.data?.message || "Review failed");
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <Navbar />

      <div className="px-8 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome, {user?.name}
            </h1>

            <p className="text-gray-400 mt-2">
              Track your rides in real-time
            </p>
          </div>

          <button
            onClick={() => navigate("/book")}
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition"
          >
            Book Ride
          </button>
        </div>

        {/* LIVE MAP */}
        {driverLocation && (
          <div className="mb-10 rounded-3xl overflow-hidden shadow-2xl h-[400px]">
            <MapContainer
              center={[driverLocation.lat, driverLocation.lng]}
              zoom={15}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  driverLocation.lat,
                  driverLocation.lng
                ]}
              >
                <Popup>Driver Live Location 🚖</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6">
          My Rides
        </h2>

        {rides.length === 0 ? (
          <div className="bg-white/10 p-8 rounded-2xl text-center">
            No rides booked yet
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <div
                key={ride._id}
                className={`backdrop-blur-lg rounded-2xl p-6 shadow-xl border ${
                  darkMode
                    ? "bg-white/10 border-white/10"
                    : "bg-white border-gray-300"
                }`}
              >
                <h3 className="text-xl font-bold mb-4">
                  Ride Details
                </h3>

                <p>
                  <span className="text-yellow-400">Pickup:</span>{" "}
                  {ride.pickupLocation}
                </p>

                <p>
                  <span className="text-yellow-400">Drop:</span>{" "}
                  {ride.dropLocation}
                </p>

                <p>
                  <span className="text-yellow-400">Fare:</span> ₹
                  {ride.fare}
                </p>

                <p>
                  <span className="text-yellow-400">Distance:</span>{" "}
                  {ride.distance || 0} km
                </p>

                <p>
                  <span className="text-yellow-400">Status:</span>{" "}
                  {ride.status}
                </p>

                <button
                  onClick={() => setSelectedRide(ride)}
                  className="w-full mt-3 bg-blue-500 text-white py-3 rounded-xl font-bold"
                >
                  View Details
                </button>

                {(ride.status === "pending" ||
                  ride.status === "accepted") && (
                  <button
                    onClick={() => cancelRide(ride._id)}
                    className="w-full mt-3 bg-red-500 py-3 rounded-xl font-bold"
                  >
                    Cancel Ride
                  </button>
                )}

               {ride.otp &&
  ride.status !== "completed" &&
  ride.status !== "cancelled" && (
    <div className="mt-4 bg-yellow-400 text-black p-4 rounded-xl text-center shadow-lg">
      <p className="font-semibold text-lg">
        Share OTP with Driver
      </p>

      <h2 className="text-4xl font-bold tracking-widest mt-2">
        {ride.otp}
      </h2>
    </div>
)}

                {ride.status === "completed" && (
                  <>
                    <button
                      onClick={() =>
                        navigate("/receipt", {
                          state: { ride }
                        })
                      }
                      className="w-full mt-3 bg-green-500 text-white py-3 rounded-xl font-bold"
                    >
                      View Receipt
                    </button>

                    {!ride.rating && (
                      <button
                        onClick={() => setReviewRide(ride)}
                        className="w-full mt-3 bg-purple-500 text-white py-3 rounded-xl font-bold"
                      >
                        Rate Driver
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4">
          <div className="bg-white text-black w-full max-w-2xl rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">
              Ride Details
            </h2>

            <div className="space-y-3">
              <p><strong>Ride ID:</strong> {selectedRide._id}</p>
              <p><strong>Passenger:</strong> {selectedRide.user?.name || user?.name}</p>
              <p><strong>Driver:</strong> {selectedRide.driverName || "Not Assigned"}</p>
              <p><strong>Cab:</strong> {selectedRide.cabType}</p>
              <p><strong>Vehicle:</strong> {selectedRide.vehicleNumber}</p>
              <p><strong>Pickup:</strong> {selectedRide.pickupLocation}</p>
              <p><strong>Drop:</strong> {selectedRide.dropLocation}</p>
              <p><strong>Fare:</strong> ₹{selectedRide.fare}</p>
              <p><strong>Status:</strong> {selectedRide.status}</p>
            </div>

            <button
              onClick={() => setSelectedRide(null)}
              className="w-full mt-8 bg-red-500 text-white py-3 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewRide && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4">
          <div className="bg-white text-black w-full max-w-lg rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">
              Rate Your Driver
            </h2>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full p-3 border rounded-xl mb-4"
            >
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>

            <textarea
              placeholder="Write your review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full p-4 border rounded-xl h-32"
            />

            <button
              onClick={submitReview}
              className="w-full mt-6 bg-purple-500 text-white py-3 rounded-xl font-bold"
            >
              Submit Review
            </button>

            <button
              onClick={() => setReviewRide(null)}
              className="w-full mt-3 bg-red-500 text-white py-3 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;