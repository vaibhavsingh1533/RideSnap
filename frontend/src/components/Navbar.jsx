import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav
      className={`px-8 py-4 flex justify-between items-center shadow-lg transition-all duration-300 ${
        darkMode
          ? "bg-black text-white"
          : "bg-white text-black border-b border-gray-300"
      }`}
    >
      <h1
        className={`text-3xl font-bold ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Ride<span className="text-yellow-400">Snap</span>
      </h1>

      <div className="flex items-center gap-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold hover:bg-yellow-300 transition"
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>

        <Link
          to="/home"
          className={`hover:text-yellow-400 transition ${
            darkMode ? "text-white" : "text-black"
          }`}
        >
          Home
        </Link>

        {user?.role === "user" && (
          <>
            <Link
              to="/dashboard"
              className={`hover:text-yellow-400 transition ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              My Rides
            </Link>

            <Link
              to="/book"
              className={`hover:text-yellow-400 transition ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Book Ride
            </Link>
          </>
        )}

        {user?.role === "driver" && (
          <Link
            to="/driver"
            className={`hover:text-yellow-400 transition ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            Driver Panel
          </Link>
        )}

        {!user ? (
          <>
            <Link
              to="/"
              className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`px-5 py-2 rounded-lg transition border ${
                darkMode
                  ? "border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  : "border-black hover:bg-black hover:text-white"
              }`}
            >
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;