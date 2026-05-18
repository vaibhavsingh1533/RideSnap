import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

function Register() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", formData);

      alert("Registration successful");
      navigate("/");

    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
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

      <div className="flex justify-center items-center h-[85vh] px-4">
        <div
          className={`backdrop-blur-lg border p-10 rounded-3xl shadow-2xl w-full max-w-md ${
            darkMode
              ? "bg-white/10 border-white/20"
              : "bg-white border-gray-300"
          }`}
        >
          <h1
            className={`text-4xl font-bold text-center ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            Ride
            <span
              className={
                darkMode ? "text-yellow-400" : "text-orange-500"
              }
            >
              Snap
            </span>
          </h1>

          <p
            className={`text-center mt-3 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Create your RideSnap account
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                  : "bg-gray-100 border-gray-300 text-black placeholder-gray-500"
              }`}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                  : "bg-gray-100 border-gray-300 text-black placeholder-gray-500"
              }`}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                  : "bg-gray-100 border-gray-300 text-black placeholder-gray-500"
              }`}
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-gray-100 border-gray-300 text-black"
              }`}
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </select>

            <button
              type="submit"
              className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-300 transition"
            >
              Register
            </button>
          </form>

          <p
            className={`text-center mt-6 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Already have an account?{" "}
            <Link
              to="/"
              className={`font-semibold ${
                darkMode ? "text-yellow-400" : "text-orange-500"
              }`}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;