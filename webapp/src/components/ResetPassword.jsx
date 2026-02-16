import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/auth.css";
import api from "../services/api";
import Loader from "./Loader";
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please try again.");
      setTimeout(() => navigate("/ForgotPassword"), 1200);
    }
  }, [email, navigate]);

  const isStrongPassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd);

  const handleReset = async () => {
    if (loading) return;
    setLoading(true);

    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanPassword || !cleanConfirm) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isStrongPassword(cleanPassword)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        email_id: email,
        password: cleanPassword,
      });

      setLoading(false);
      toast.success(res.data?.message || "Password reset successful.");

      setTimeout(() => navigate("/login"), 400);

    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <p>Create a new password</p>

<label>
  New Password <span className="required">*</span>
</label>
<div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="New password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <span
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
    style={{ cursor: 'pointer' }}
  >
    {showPassword ? (
      <EyeOff size={20} />
    ) : (
      <Eye size={20} />
    )}
  </span>
</div>

<label>
  Confirm Password <span className="required">*</span>
</label>
<div className="password-field">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
  />
  <span
    className="toggle-password"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    style={{ cursor: 'pointer' }}
  >
    {showConfirmPassword ? (
      <EyeOff size={20} />
    ) : (
      <Eye size={20} />
    )}
  </span>
</div>

          <button onClick={handleReset} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
