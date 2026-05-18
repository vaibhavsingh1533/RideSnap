import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookRide from "./pages/BookRide";
import DriverDashboard from "./pages/DriverDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Receipt from "./pages/Receipt";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/home" element={<Home />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <BookRide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }
          />
          <Route
           path="/receipt"
            element={
    <ProtectedRoute>
      <Receipt />
    </ProtectedRoute>
  }
/>

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;