import React from "react";

const LogoutConfirmModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <p style={{ textAlign: "center", marginBottom: "20px" }}>Do you really want to logout?</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <button onClick={onConfirm}>YES</button>
          <button onClick={onCancel}>NO</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
