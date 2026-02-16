import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/settings.css";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // VERIFY PASSWORD
  const handleVerifyPassword = async () => {
    try {
      setLoading(true);

      await api.post("/user/reverify-password", {
        password: form.current_password
      });

      toast.success("Password verified");
      setStep(2);

    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  //CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (form.new_password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.put("/user/change-password", {
        current_password: form.current_password,
        new_password: form.new_password
      });

      toast.success("Password changed successfully");

      navigate("/dashboard?tab=settings");

    } catch (err) {
      toast.error(err?.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };
  const eyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const eyeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.86 21.86 0 0 1 5.06-6.94" />
    <path d="M1 1l22 22" />
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
  </svg>
);


  return (
    <div className="settings-container">

      <div className="settings-card">

        <h3>Change Password</h3>

        {step === 1 && (
          <>
            <div className="password-field">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="current_password"
                placeholder="Enter Current Password"
                value={form.current_password}
                onChange={handleChange}
              />

              <span
        className="toggle-password"
        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
      >
        {showCurrentPassword ? eyeOffIcon : eyeIcon}
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
            <div className="password-field">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                placeholder="New Password"
                value={form.new_password}
                onChange={handleChange}
              />

              <span
        className="toggle-password"
        onClick={() => setShowNewPassword(!showNewPassword)}
      >
        {showNewPassword ? eyeOffIcon : eyeIcon}
      </span>
            </div>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                placeholder="Confirm Password"
                value={form.confirm_password}
                onChange={handleChange}
              />

              <span
        className="toggle-password"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
        {showConfirmPassword ? eyeOffIcon : eyeIcon}
      </span>
            </div>

            <button
              className="settings-save-btn"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default ChangePasswordPage;
