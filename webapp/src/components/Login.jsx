import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/auth.css";
import Loader from "../components/Loader";
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email_id, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    const email = email_id.trim();
    const pass = password.trim();

    if (!email || !pass) {
      toast.error("Please enter email and password");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email_id: email,
        password: pass,
        remember,
      });

      setLoading(false);
      toast.success(res.data?.message || "Login successful");

      setTimeout(() => {
        navigate("/Dashboard");
      }, 100);

    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";

      if (msg.toLowerCase().includes("verify")) {
        toast.error(msg);
        setTimeout(() => {
          navigate("/verify", { state: { email, first_time: false } });
        }, 400);
      } else {
        toast.error("Invalid credentials or server error");
      }
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p>Sign in to your Hire-a-Helper account</p>

          <label>Email Address <span className="required">*</span></label>
          <input
            type="email"
            value={email_id}
            autoComplete="email"
            maxLength={100}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <label>Password <span className="required">*</span></label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              maxLength={100}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                    <EyeOff size={20} />
                         ) : (
                              <Eye size={20} />
                             )}
            </span>
          </div>

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

          <button onClick={handleLogin} disabled={loading} className={loading ? "btn disabled" : "btn"}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="auth-footer">
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
