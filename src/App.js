import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";
import Loader from "./components/Loader";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 DIRECTLY OPEN DASHBOARD */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* OPTIONAL ROUTES (kept for future use) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/loader" element={<Loader />} />

        {/* ✅ DASHBOARD WITHOUT LOGIN */}
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;