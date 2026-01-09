import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone) =>
    /^[6-9]\d{9}$/.test(phone); 

  const handleSignup = async () => {
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone_number: form.phone_number.trim(),
      email_id: form.email_id.trim().toLowerCase(),
      password: form.password.trim(),
    };

    if (Object.values(payload).some((v) => !v)) {
      alert("All fields are required");
      return;
    }

    if (!isValidEmail(payload.email_id)) {
      alert("Enter a valid email address");
      return;
    }

    if (!isValidPhone(payload.phone_number)) {
      alert("Enter a valid 10-digit phone number");
      return;
    }

    if (payload.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", payload);

      alert(res.data?.message || "Registration successful");
      navigate("/verify", {
        state: { email: payload.email_id, first_time: true },
      });

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join the Hire-a-Helper community</p>

        <div className="two-col">
          <div className="input-group">
            <label>First Name</label>
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
            <label>Last Name</label>
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
          <label>Phone Number</label>
          <input
            name="phone_number"
            maxLength={10}
            autoComplete="tel"
            placeholder="Phone Number"
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Email Address</label>
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
          <label>Password</label>
          <input
            name="password"
            type="password"
            maxLength={100}
            autoComplete="new-password"
            placeholder="Create your password"
            onChange={handleChange}
          />
        </div>

        <button className="primary-btn" onClick={handleSignup} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
