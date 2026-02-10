import React, { useState } from "react";
import "../styles/settings.css";
import axios from "axios";

const Settings = ({ user }) => {

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    profile_picture: null,
    preview: user?.picture || ""
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm({
        ...form,
        profile_picture: file,
        preview: reader.result
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("phone_number", form.phone_number);

      if (form.profile_picture) {
        formData.append("profile_picture", form.profile_picture);
      }

      await axios.put(
        "http://127.0.0.1:5000/api/user/profile",
        formData,
        { withCredentials: true }
      );

      alert("Profile updated successfully");

    } catch (err) {
      console.error("Profile update failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">

      <h2>Settings</h2>

      {/* PROFILE PIC */}
      <div className="settings-card">
        <h3>Profile Picture</h3>

        <div className="profile-picture-section">
          <div className="profile-preview">
            {form.preview ? (
              <img src={form.preview} alt="profile" />
            ) : (
              <div className="profile-placeholder">
                {form.first_name?.charAt(0) || "U"}
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* PERSONAL INFO */}
      <div className="settings-card">
        <h3>Personal Information</h3>

        <div className="settings-row">
          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
          />

          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        <input
          name="phone_number"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
        />

        <button
          className="settings-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
