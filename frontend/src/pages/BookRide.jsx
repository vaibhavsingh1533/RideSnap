import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import { useTheme } from "../context/ThemeContext";
import RoutingMap from "../components/RoutingMap";
import "leaflet/dist/leaflet.css";

function BookRide() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropLocation: ""
  });

  const [pickupCoords, setPickupCoords] = useState([22.7196, 75.8577]);
  const [dropCoords, setDropCoords] = useState(null);
  const [distance, setDistance] = useState(0);
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);

  const calculateFare = (distanceKm) => {
    const baseFare = 50;
    const perKmRate = 12;
    return Math.round(baseFare + distanceKm * perKmRate);
  };

  const getCoordinates = async (place) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place + ", India"
        )}`
      );

      const data = await res.json();

      if (data.length > 0) {
        return [
          parseFloat(data[0].lat),
          parseFloat(data[0].lon)
        ];
      }

      return null;

    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;

        setPickupCoords([lat, lng]);

        setFormData((prev) => ({
          ...prev,
          pickupLocation: "Current Location"
        }));
      },
      () => {
        alert("Location access denied");
      }
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTrip = async () => {
    if (
      !formData.pickupLocation.trim() ||
      !formData.dropLocation.trim()
    ) {
      alert("Enter both pickup and drop locations");
      return;
    }

    setLoading(true);

    const pickup =
      formData.pickupLocation === "Current Location"
        ? pickupCoords
        : await getCoordinates(formData.pickupLocation);

    const drop = await getCoordinates(formData.dropLocation);

    if (!pickup || !drop) {
      alert("Invalid locations");
      setLoading(false);
      return;
    }

    setPickupCoords(pickup);
    setDropCoords(drop);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (distance <= 0) {
      alert("Please calculate trip first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/rides/book",
        {
          pickupLocation: formData.pickupLocation,
          dropLocation: formData.dropLocation,
          fare,
          distance
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Ride booked successfully");
      navigate("/dashboard");

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Booking failed");
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

      <div className="grid lg:grid-cols-2 min-h-[88vh]">
        {/* LEFT PANEL */}
        <div className="flex items-center justify-center px-8 py-10">
          <div
            className={`rounded-3xl shadow-2xl w-full max-w-lg p-10 border ${
              darkMode
                ? "bg-white/10 border-white/10"
                : "bg-white border-gray-300"
            }`}
          >
            <h1 className="text-4xl font-bold mb-6">
              Book Your Ride
            </h1>

            <button
              onClick={getCurrentLocation}
              className="w-full mb-5 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-400 transition"
            >
              Use My Current Location
            </button>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="pickupLocation"
                placeholder="Enter Pickup Location"
                value={formData.pickupLocation}
                onChange={handleChange}
                className={`w-full px-4 py-4 rounded-xl border outline-none ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-gray-100 border-gray-300 text-black"
                }`}
              />

              <input
                type="text"
                name="dropLocation"
                placeholder="Enter Drop Location"
                value={formData.dropLocation}
                onChange={handleChange}
                className={`w-full px-4 py-4 rounded-xl border outline-none ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-gray-100 border-gray-300 text-black"
                }`}
              />

              <button
                type="button"
                onClick={calculateTrip}
                disabled={loading}
                className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-400 transition"
              >
                {loading ? "Calculating..." : "Calculate Trip"}
              </button>

              <div
                className={`p-5 rounded-2xl ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-gray-100"
                }`}
              >
                <p className="font-medium">Distance</p>
                <h2 className="text-2xl font-bold text-green-500">
                  {distance} km
                </h2>
              </div>

              <div
                className={`p-5 rounded-2xl ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-gray-100"
                }`}
              >
                <p className="font-medium">Estimated Fare</p>
                <h2 className="text-3xl font-bold text-yellow-500">
                  ₹{fare}
                </h2>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold hover:bg-yellow-300 transition"
              >
                Confirm Ride
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT MAP */}
        <div className="hidden lg:block p-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl h-full">
            <MapContainer
              center={pickupCoords}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              key={pickupCoords.join(",")}
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={pickupCoords}>
                <Popup>Pickup Location</Popup>
              </Marker>

              {dropCoords && (
                <>
                  <Marker position={dropCoords}>
                    <Popup>Drop Location</Popup>
                  </Marker>

                  <RoutingMap
                    pickupCoords={pickupCoords}
                    dropCoords={dropCoords}
                    setDistance={(dist) => {
                      setDistance(dist);
                      setFare(calculateFare(dist));
                    }}
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookRide;