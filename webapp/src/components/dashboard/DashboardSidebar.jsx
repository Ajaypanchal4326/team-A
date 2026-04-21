import React from "react";
import { DASHBOARD_PAGES } from "./constants";

const DashboardSidebar = ({ activePage, setActivePage, pendingCount, user, onLogoutClick }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3 className="logo">Hire-a-Helper</h3>
      </div>
      <ul className="sidebar-menu">
        {DASHBOARD_PAGES.map((page) => (
          <li key={page} className={activePage === page ? "active" : ""} onClick={() => setActivePage(page)}>
            {page}
            {page === "Requests" && pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-user">
            {user?.picture ? (
              <img src={user.picture} alt="profile" className="sidebar-footer-avatar" />
            ) : (
              (user?.first_name || user?.email || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="sidebar-footer-text">
            <strong>{`${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"}</strong>
            <span>{user.email || "user@email.com"}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogoutClick}>Logout</button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
