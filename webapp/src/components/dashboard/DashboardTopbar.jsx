import React from "react";
import { Bell } from "lucide-react";

const DashboardTopbar = ({
  activePage,
  searchTerm,
  setSearchTerm,
  showNotifications,
  setShowNotifications,
  notifications,
  onReadAll,
  onReadOne,
  onOpenMenu,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="hamburger-icon" onClick={onOpenMenu}>?</span>
        <h2>{activePage}</h2>
      </div>
      <div className="topbar-center">
        {!(["Settings", "Add Task"].includes(activePage)) && (
          <input
            type="text"
            placeholder={`Search in ${activePage.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>
      <div className="topbar-right">
        <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={25} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>
        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <span>Notifications</span>
              {notifications.some((n) => !n.read) && (
                <p className="mark-all-btn" onClick={onReadAll}>Mark all as read</p>
              )}
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty"><p>No notifications yet</p></div>
              ) : (
                notifications.map((note) => (
                  <div
                    key={note._id}
                    className={`notification-item ${note.read ? "read" : "unread"}`}
                    onClick={() => onReadOne(note._id)}
                  >
                    <div className="notification-dot" />
                    <div className="notification-content">
                      <p className="notification-message">{note.message}</p>
                      <p className="notification-time">
                        {new Date(note.createdAt).toLocaleDateString()} - {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTopbar;
