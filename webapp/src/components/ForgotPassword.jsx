import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email_id, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleanEmail = email_id.trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      alert("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email_id: cleanEmail,
      });

      alert(res.data?.message || "If email exists, OTP has been sent.");

      navigate("/verify", {
        state: { email: cleanEmail, first_time: false },
      });
    } catch (err) {
      
      alert("If email exists, OTP has been sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your registered email to receive OTP</p>

        <input
          type="email"
          placeholder="Enter email"
          value={email_id}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSendOtp} disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
