import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import socket from "../socket/socket";

function DriverDashboard() {
  const [rides, setRides] = useState([]);
  const [enteredOtp, setEnteredOtp] = useState({});
  const [selectedRide, setSelectedRide] = useState(null);
  const { darkMode } = useTheme();

  const watchIdRef = useRef(null);
  const driver = JSON.parse(localStorage.getItem("user"));

  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/rides/all", {
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

    if (driver?._id) {
      socket.emit("join", driver._id);
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startLiveTracking = (ride) => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("Sending location:", lat, lng);

        socket.emit("driverLocationUpdate", {
          userId: ride.user._id,
          lat,
          lng
        });
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  const acceptRide = async (ride) => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/rides/accept",
        { rideId: ride._id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      startLiveTracking(ride);

      fetchRides();

    } catch (error) {
      console.log(error);
    }
  };

  const completeRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/rides/complete",
        {
          rideId,
          otp: enteredOtp[rideId]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      fetchRides();
      setSelectedRide(null);

    } catch (error) {
      alert(
        error.response?.data?.message || "OTP verification failed"
      );
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
        <h1 className="text-4xl font-bold mb-10">
          Driver Dashboard
        </h1>

        {rides.length === 0 ? (
          <div className="bg-white/10 p-8 rounded-2xl text-center">
            No rides available
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
                  Ride Request
                </h3>

                <p><span className="text-yellow-400">User:</span> {ride.user?.name}</p>
                <p><span className="text-yellow-400">Pickup:</span> {ride.pickupLocation}</p>
                <p><span className="text-yellow-400">Drop:</span> {ride.dropLocation}</p>
                <p><span className="text-yellow-400">Distance:</span> {ride.distance || 0} km</p>
                <p><span className="text-yellow-400">Status:</span> {ride.status}</p>

                <button
                  onClick={() => setSelectedRide(ride)}
                  className="w-full mt-3 bg-blue-500 text-white py-3 rounded-xl font-bold"
                >
                  View Details
                </button>

                {ride.status === "pending" && (
                  <button
                    onClick={() => acceptRide(ride)}
                    className="w-full mt-3 bg-yellow-400 text-black py-3 rounded-xl font-bold"
                  >
                    Accept Ride
                  </button>
                )}

                {ride.status === "accepted" && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={enteredOtp[ride._id] || ""}
                      onChange={(e) =>
                        setEnteredOtp({
                          ...enteredOtp,
                          [ride._id]: e.target.value
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white mt-3"
                    />

                    <button
                      onClick={() => completeRide(ride._id)}
                      className="w-full mt-3 bg-green-500 py-3 rounded-xl font-bold"
                    >
                      Complete Ride
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;