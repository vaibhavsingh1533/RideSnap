import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Home() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: "⚡",
      title: "Instant Booking",
      desc: "Book rides in seconds with smart route calculation."
    },
    {
      icon: "🛡️",
      title: "OTP Protected",
      desc: "Secure driver verification before ride starts."
    },
    {
      icon: "📍",
      title: "Live Tracking",
      desc: "Real-time route visualization with smart maps."
    },
    {
      icon: "💳",
      title: "Transparent Fare",
      desc: "Know pricing before booking. No hidden charges."
    }
  ];

  const testimonials = [
    {
      name: "Aarav",
      text: "Smooth and premium experience. Feels like a real startup app."
    },
    {
      name: "Priya",
      text: "Loved OTP security and instant ride booking."
    },
    {
      name: "Rohan",
      text: "Beautiful UI with practical ride tracking features."
    }
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden px-10 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-pink-500/20 blur-3xl" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold mb-6 shadow-lg">
              Smart Mobility Platform
            </div>

            <h1 className="text-6xl font-bold leading-tight">
              Ride The Future with{" "}
              <span
                className={
                  darkMode ? "text-yellow-400" : "text-orange-500"
                }
              >
                RideSnap
              </span>
            </h1>

            <p
              className={`mt-6 text-xl leading-8 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Premium ride booking with secure OTP rides,
              smart maps, instant bookings, live route tracking,
              and digital receipts.
            </p>

            <div className="mt-10 flex gap-5">
              <Link
                to="/book"
                className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition shadow-lg"
              >
                Book Ride
              </Link>

              <Link
                to="/register"
                className={`px-8 py-4 rounded-2xl font-bold border transition hover:scale-105 ${
                  darkMode
                    ? "border-yellow-400 hover:bg-yellow-400 hover:text-black"
                    : "border-black hover:bg-black hover:text-white"
                }`}
              >
                Join as Driver
              </Link>
            </div>
          </motion.div>

          {/* CLICKABLE MOCK BOOKING CARD */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/book")}
            className={`relative rounded-3xl p-8 shadow-2xl backdrop-blur-xl cursor-pointer ${
              darkMode
                ? "bg-white/10 border border-white/10"
                : "bg-white border border-gray-300"
            }`}
          >
            <h3 className="text-2xl font-bold mb-6">
              Live Booking Preview
            </h3>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl ${
                  darkMode ? "bg-slate-800" : "bg-gray-100"
                }`}
              >
                📍 Pickup: Indore
              </div>

              <div
                className={`p-4 rounded-2xl ${
                  darkMode ? "bg-slate-800" : "bg-gray-100"
                }`}
              >
                🏁 Drop: Bhopal
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-2xl font-semibold ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                🚖 Distance: 190 km | Fare: ₹1850
                <div className="text-sm mt-1 text-yellow-400">
                  Click to Book
                </div>
              </motion.div>

              <div className="bg-green-500 text-white p-4 rounded-2xl font-bold shadow">
                Driver arriving in 4 mins
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3
              }}
              className="absolute -top-6 -right-6 bg-yellow-400 text-black px-6 py-4 rounded-2xl font-bold shadow-xl"
            >
              OTP Secured
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-10 py-20">
        <h2 className="text-5xl font-bold text-center mb-14">
          Premium Features
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className={`rounded-3xl p-8 shadow-xl ${
                darkMode
                  ? "bg-white/10"
                  : "bg-white border border-gray-300"
              }`}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold">
                {feature.title}
              </h3>
              <p
                className={`mt-3 ${
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-10 py-20">
        <h2 className="text-5xl font-bold text-center mb-16">
          What Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`rounded-3xl p-8 shadow-xl ${
                darkMode
                  ? "bg-white/10"
                  : "bg-white border border-gray-300"
              }`}
            >
              <p className="text-lg italic">"{t.text}"</p>
              <h4 className="mt-6 font-bold text-yellow-400">
                — {t.name}
              </h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MAP */}
      <section className="px-10 py-20">
        <h2 className="text-5xl font-bold text-center mb-12">
          Book Directly From Map
        </h2>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate("/book")}
          className="cursor-pointer rounded-3xl overflow-hidden shadow-2xl h-[500px]"
        >
          <MapContainer
            key="home-map-fixed"
            center={[22.7196, 75.8577]}
            zoom={12}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[22.7196, 75.8577]}>
              <Popup>Click to Book Ride</Popup>
            </Marker>
          </MapContainer>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-10 pb-20">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-black rounded-3xl p-14 text-center shadow-2xl"
        >
          <h2 className="text-5xl font-bold">
            Ready to Ride Smarter?
          </h2>

          <p className="mt-5 text-xl">
            Fast booking. Safe rides. Smart mobility.
          </p>

          <Link
            to="/book"
            className="inline-block mt-8 bg-black text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition"
          >
            Start Booking
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;