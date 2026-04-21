import React from "react";

const MyRequestsView = ({ loadingRequests, requests }) => {
  return (
    <div className="my-requests-page">
      <h2>My Requests</h2>
      <p className="page-subtitle">Track the help requests you've sent</p>
      {loadingRequests ? (
        <p style={{ padding: "20px" }}>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p style={{ padding: "20px" }}>You haven't requested any tasks yet. Go to Feed to request!</p>
      ) : (
        <div className="my-requests-grid">
          {requests.map((req) => (
            <div key={req.requestId} className="request-card my-request-card">
              <div className="request-task-image-wrapper">
                {req.taskPicture ? (
                  <img src={req.taskPicture} alt={req.taskTitle || "Task"} className="request-task-image" />
                ) : (
                  <div className="request-task-image-placeholder">?? No image provided</div>
                )}
              </div>

              <div className="request-card-body">
                <h3 className="request-title">{req.taskTitle || "Untitled task"}</h3>
                <p className="request-owner"><strong>Owner:</strong> {req.taskOwnerName || "Not available"}</p>
                {req.taskLocation && <p className="task-location">?? {req.taskLocation}</p>}
                <div className="request-message"><strong>Your message:</strong><p>{req.description || "No message"}</p></div>
              </div>

              <div className="request-status-section">
                <span className={`status-badge status-${req.status}`}>
                  {req.status === "pending" && "?? Pending"}
                  {req.status === "accepted" && "?? Accepted"}
                  {req.status === "rejected" && "?? Rejected"}
                </span>
                <p className="request-date">{req.creationDate ? `Sent ${new Date(req.creationDate).toLocaleDateString()}` : "Date not available"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequestsView;
