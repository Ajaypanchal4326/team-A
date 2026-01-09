import React, { useState } from "react";
import "../styles/auth.css";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const first_time = location.state?.first_time;

  
  if (!email) {
    navigate("/signup");
  }

  const handleVerify = async () => {
    const cleanOtp = otp.trim();

    if (!/^\d{4,6}$/.test(cleanOtp)) {
      alert("Enter a valid OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/verify-otp", {
        email_id: email,
        otp: cleanOtp,
        first_time: first_time
      });

      alert(res.data?.message || "OTP verified");

      if (first_time) {
        navigate("/login");
      } else {
        navigate("/ResetPassword", { state: { email } });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/resend-otp", {
        email_id: email,
      });

      alert(res.data?.message || "OTP resent");

    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg?.toLowerCase().includes("already verified")) {
        alert("Email already verified. Please login.");
        navigate("/login");
      } else {
        alert(msg || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your OTP</h2>
        <p>OTP sent to: {email}</p>

        <label>Verification Code</label>
        <input
          placeholder="Enter OTP"
          value={otp}
          maxLength={6}
          inputMode="numeric"
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />

        <button className="primary-btn" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        <button className="secondary-btn" onClick={handleResend} disabled={loading}>
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
