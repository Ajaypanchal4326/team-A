import React from "react";
import "../styles/task-card.css";

const formatTaskDateTime = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return `${date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const statusClassFromTask = (status) => {
  const normalized = String(status || "open").toLowerCase().replace(/\s+/g, "-");
  return `task-item__status--${normalized}`;
};

const TaskCard = ({ task, currentUserId, sentRequests = [], onRequestTask, editable = false, onEdit }) => {
  if (!task) return null;

  const taskId = String(task._id || task.id);
  const hasRequested = sentRequests.some((req) => String(req.taskId) === taskId);
  const isOwnTask = currentUserId === (task.user_id?._id || task.user_id);
  const isUnavailable = ["completed", "cancelled", "assigned"].includes(String(task.status || "").toLowerCase());
  const userProfilePicture = task.user_id?.picture || task.user_id?.profile_picture;
  const userInitial = (task.user_id?.first_name || "U").charAt(0).toUpperCase();

  let buttonText = "Request Task";
  let buttonDisabled = false;
  let buttonClass = "task-item__action";

  if (isOwnTask) {
    buttonText = "Your Task";
    buttonDisabled = true;
    buttonClass = "task-item__action task-item__action--disabled";
  } else if (hasRequested) {
    buttonText = "Requested";
    buttonDisabled = true;
    buttonClass = "task-item__action task-item__action--requested";
  } else if (isUnavailable) {
    buttonText = "Unavailable";
    buttonDisabled = true;
    buttonClass = "task-item__action task-item__action--unavailable";
  }

  return (
    <article className="task-item">
      <div className="task-item__image-wrap">
        {task.picture ? (
          <img src={task.picture} alt={task.title || "Task"} className="task-item__image" />
        ) : (
          <div className="task-item__image-placeholder">No image provided</div>
        )}
      </div>

      <div className="task-item__badges">
        <span className="task-item__category">{task.category || "General"}</span>
        {editable && task.status && (
          <span className={`task-item__status ${statusClassFromTask(task.status)}`}>
            {task.status}
          </span>
        )}
      </div>

      <div className="task-item__body">
        <h3 className="task-item__title">{task.title || "Untitled Task"}</h3>
        <p className="task-item__description">{task.description?.trim() || "No description provided"}</p>

        <div className="task-item__meta-card">
          <div className="task-item__meta-row">
            <div className="task-item__meta-label-wrap">
              <span className="task-item__dot task-item__dot--location" />
              <span className="task-item__meta-label">Location</span>
            </div>
            <span className="task-item__meta-value">{task.location || "Not specified"}</span>
          </div>

          <div className="task-item__meta-row">
            <div className="task-item__meta-label-wrap">
              <span className="task-item__dot task-item__dot--start" />
              <span className="task-item__meta-label">Starts</span>
            </div>
            <span className="task-item__meta-value">{formatTaskDateTime(task.start_time)}</span>
          </div>

          <div className="task-item__meta-row task-item__meta-row--last">
            <div className="task-item__meta-label-wrap">
              <span className="task-item__dot task-item__dot--end" />
              <span className="task-item__meta-label">Ends</span>
            </div>
            <span className="task-item__meta-value">{formatTaskDateTime(task.end_time)}</span>
          </div>
        </div>
      </div>

      <footer className="task-item__footer">
        {!editable && (
          <div className="task-item__owner">
            <div className="task-item__avatar">
              {userProfilePicture ? (
                <img src={userProfilePicture} alt={task.user_id?.first_name || "User"} className="task-item__avatar-image" />
              ) : (
                userInitial
              )}
            </div>
            <div className="task-item__owner-name">
              {`${task.user_id?.first_name || "User"}${task.user_id?.last_name ? ` ${task.user_id.last_name}` : ""}`}
            </div>
          </div>
        )}

        {editable ? (
          <button className="task-item__edit" onClick={() => onEdit(task)}>Edit Task</button>
        ) : (
          onRequestTask && (
            <button className={buttonClass} onClick={() => !buttonDisabled && onRequestTask(task)} disabled={buttonDisabled}>
              {buttonText}
            </button>
          )
        )}
      </footer>
    </article>
  );
};

export default TaskCard;
