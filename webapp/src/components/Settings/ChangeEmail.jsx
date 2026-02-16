import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ChangeEmail = () => {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  const [form, setForm] = useState({
    password: "",
    new_email: "",
    otp: ""
  });


  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);


  const handleVerifyPassword = async () => {
    try {
      setLoading(true);

      await api.post("/user/reverify-password", {
        password: form.password
      });

      toast.success("Password verified");
      setStep(2);

    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSendOtp = async () => {
    try {
      setLoading(true);

      await api.post("/user/change-email/send-otp", {
        newEmail: form.new_email
      });

      toast.success("OTP sent to new email");
      setStep(3);
      setTimer(30);

    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      await api.post("/user/change-email/verify-otp", {
        otp: form.otp
      });

      toast.success("Email updated successfully");

      setTimeout(() => {
        navigate("/Dashboard", { state: { openPage: "Settings" } });

      }, 1500);

    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- RESEND OTP ---------- */

  const handleResendOtp = async () => {
    try {
      setLoading(true);

      await api.post("/user/change-email/resend-otp");

      toast.success("OTP resent");
      setTimer(30);

    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
    <div className="settings-card">

      <h3>Change Email</h3>

      
      {step === 1 && (
        <>
            <div className="password-field">

  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Enter Current Password"
    value={form.password}
    onChange={handleChange}
  />

  <span
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? (
      // Eye Off Icon
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.86 21.86 0 0 1 5.06-6.94" />
        <path d="M1 1l22 22" />
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      </svg>
    ) : (
      // Eye Icon
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </span>

</div>


          <button
            className="settings-save-btn"
            onClick={handleVerifyPassword}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Password"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            name="new_email"
            placeholder="Enter New Email"
            value={form.new_email}
            onChange={handleChange}
          />

          <button
            className="settings-save-btn"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <input
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
          />

          <button
            className="settings-save-btn"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            className="resend-btn"
            onClick={handleResendOtp}
            disabled={timer > 0 || loading}
          >
            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </button>
        </>
      )}

      </div>
      </div>
  );
};

export default ChangeEmail;
