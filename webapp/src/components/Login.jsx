import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [email_id, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    const email = email_id.trim();
    const pass = password.trim();

    if (!email || !pass) {
      alert("Please enter email and password");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email_id: email,
        password: pass,
        remember,
      });

      alert(res.data?.message || "Login successful");
      navigate("/Dashboard");

    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";

      if (msg.toLowerCase().includes("verify")) {
        alert(msg);
        navigate("/verify", { state: { email, first_time: false } });
      } else {
        alert("Invalid credentials or server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to your Hire-a-Helper account</p>

        <label>Email Address</label>
        <input
          type="email"
          value={email_id}
          autoComplete="email"
          maxLength={100}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          maxLength={100}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <div className="auth-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Remember me
          </label>

          <Link to={"/ForgotPassword"} className="forget-link">
            Forgot password?
          </Link>
        </div>

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
