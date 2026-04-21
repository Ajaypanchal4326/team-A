import React from "react";
import { DASHBOARD_PAGES } from "./constants";

const MobileMenu = ({ show, setShowMenu, setActivePage, onShowLogout }) => {
  if (!show) return null;

  return (
    <div className="hamburger-overlay" onClick={() => setShowMenu(false)}>
      <div className="hamburger-menu" onClick={(e) => e.stopPropagation()}>
        <h3>Hire-a-Helper</h3>
        <ul className="menu-list">
          {DASHBOARD_PAGES.map((page) => (
            <li key={page} onClick={() => { setActivePage(page); setShowMenu(false); }} style={{ cursor: "pointer" }}>
              {page}
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => { setShowMenu(false); onShowLogout(); }}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
