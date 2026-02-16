import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/auth.css";
import Loader from "./Loader";
import { Eye, EyeOff } from 'lucide-react';


const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email_id: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStrongPassword = (password) => {
  if (password.length < 8) {
    return {
      isStrong: false,
      message: "Password must be at least 8 characters"
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one uppercase letter (A-Z)"
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one lowercase letter (a-z)"
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one number (0-9)"
    };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};:'",.<>/?\\|]/.test(password)) {
    return {
      isStrong: false,
      message: "Password must contain at least one special character (!@#$%^&*)"
    };
  }

  return {
    isStrong: true,
    message: "Password is strong"
  };
};

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone) =>
    /^[6-9]\d{9}$/.test(phone);

  const handleSignup = async () => {
    if (loading) return;
    setLoading(true);

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone_number: form.phone_number.trim(),
      email_id: form.email_id.trim().toLowerCase(),
      password: form.password.trim(),
    };

    if (Object.values(payload).some((v) => !v)) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    if (!isValidEmail(payload.email_id)) {
      toast.error("Enter a valid email address");
      setLoading(false);
      return;
    }

    if (!isValidPhone(payload.phone_number)) {
      toast.error("Enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    const passwordValidation = isStrongPassword(payload.password);
     if (!passwordValidation.isStrong) {
     toast.error(passwordValidation.message);
     setLoading(false);
    return;
    }

    try {
      const res = await api.post("/auth/register", payload);
      setLoading(false);
      toast.success(res.data?.message || "Registration successful");

      setTimeout(() => {
        navigate("/verify", {
          state: { email: payload.email_id, first_time: true },
        });
      }, 400);

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p>Join the Hire-a-Helper community</p>

          <div className="two-col">
            <div className="input-group">
              <label>First Name <span className="required">*</span></label>
              <input
                name="first_name"
                type="text"
                maxLength={50}
                autoComplete="given-name"
                placeholder="First Name"
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Last Name <span className="required">*</span></label>
              <input
                name="last_name"
                type="text"
                maxLength={50}
                autoComplete="family-name"
                placeholder="Last Name"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number <span className="required">*</span></label>
            <input
              name="phone_number"
              maxLength={10}
              autoComplete="tel"
              placeholder="Phone Number"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Email Address <span className="required">*</span></label>
            <input
              name="email_id"
              type="email"
              maxLength={100}
              autoComplete="email"
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
  <label>Password <span className="required">*</span></label>
  <div className="password-field">
    <input
      name="password"
      type={showPassword ? "text" : "password"}
      maxLength={100}
      autoComplete="new-password"
      placeholder="Create your password"
      onChange={handleChange}
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
</div>

          <button className="primary-btn" onClick={handleSignup} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
