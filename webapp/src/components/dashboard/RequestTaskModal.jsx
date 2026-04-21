import React from "react";

const RequestTaskModal = ({ show, selectedTask, requestMessage, setRequestMessage, sendingRequest, onSend, onCancel }) => {
  if (!show || !selectedTask) return null;

  return (
    <div className="modal-overlay">
      <div className="modal request-modal">
        <h2>Send Request</h2>
        <div className="modal-task-info">
          <h3>{selectedTask.title}</h3>
          {selectedTask.picture && <img src={selectedTask.picture} alt={selectedTask.title} className="modal-task-image" />}
        </div>
        <label>Your Message to the Task Owner</label>
        <textarea
          placeholder="Tell the task owner about your experience, availability, and why you'd be great for this task..."
          value={requestMessage}
          onChange={(e) => setRequestMessage(e.target.value)}
          rows="6"
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />
        <div className="modal-actions">
          <button className="btn-submit" onClick={onSend} disabled={sendingRequest || !requestMessage.trim()}>{sendingRequest ? "Sending..." : "Send Request"}</button>
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RequestTaskModal;
