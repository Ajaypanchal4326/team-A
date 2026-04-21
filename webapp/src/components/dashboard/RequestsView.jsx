import React from "react";

const RequestsView = ({ loadingRequests, requests, actionLoading, onAcceptRequest, onRejectRequest }) => {
  return (
    <div className="requests-page">
      <h2>Incoming Requests</h2>
      <p className="page-subtitle">People who want to help with your tasks</p>
      {loadingRequests ? (
        <p style={{ padding: "20px" }}>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p style={{ padding: "20px" }}>No requests yet. Create a task to get started!</p>
      ) : (
        <div className="feed">
          {requests.map((req) => (
            <div key={req.requestId || req._id} className="request-card">
              <div className="requester-header">
                <div className="requester-avatar">
                  {req.requester?.profilePicture || req.requester?.picture ? (
                    <img
                      src={req.requester?.profilePicture || req.requester?.picture}
                      alt={req.requester?.first_name || "User"}
                      className="requester-avatar-image"
                    />
                  ) : (
                    (req.requester?.first_name || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="requester-info"><h3>{req.requester?.name || "User"}</h3></div>
              </div>

              <div className="request-task-info">
                <h4>Requesting for: {req.task?.title || req.taskTitle || "Task"}</h4>
                {(req.task?.picture || req.taskPicture) && (
                  <img src={req.task?.picture || req.taskPicture} alt={req.task?.title || req.taskTitle} className="request-task-image" />
                )}
              </div>

              <div className="request-message">
                <p><strong>Their message:</strong></p>
                <p className="message-text">{req.description || req.message || "No message"}</p>
              </div>

              <div className="request-meta">
                <span>?? {req.task?.location || req.taskLocation || "Location not specified"}</span>
                <span>?? {new Date(req.createdAt || req.creationDate).toLocaleDateString()}</span>
              </div>

              <div className="request-actions">
                {req.status === "pending" ? (
                  <>
                    <button className="btn-accept" onClick={() => onAcceptRequest(req.requestId)} disabled={actionLoading}>{actionLoading ? "..." : "? Accept"}</button>
                    <button className="btn-reject" onClick={() => onRejectRequest(req.requestId)} disabled={actionLoading}>{actionLoading ? "..." : "? Reject"}</button>
                  </>
                ) : (
                  <span className={`status-badge status-${req.status}`}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsView;
