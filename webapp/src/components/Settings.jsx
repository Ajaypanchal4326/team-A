import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../styles/settings.css";
import api from "../services/api";

const Settings = ({ user, reloadUser }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    profile_picture: null,
    preview: ""
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      profile_picture: null,
      preview: user.picture || user.profile_picture || ""
    });
  }, [user]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        profile_picture: file,
        preview: reader.result
      }));
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

      await api.put("user/profile", formData, {
        withCredentials: true
      });

      await reloadUser();
      toast.success("Profile updated successfully ⚙️");
    } catch (err) {
      toast.error("Profile update failed ❌");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

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
          name="email"
          placeholder="Email"
          value={form.email}
          disabled
        />
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
