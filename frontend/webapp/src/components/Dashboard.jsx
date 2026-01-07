import React, { useState } from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("Feed");

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">Hire-a-Helper</h2>

        <ul className="menu">
          <li
            className={activePage === "Feed" ? "active" : ""}
            onClick={() => setActivePage("Feed")}
          >
            Feed
          </li>

          <li
            className={activePage === "My Tasks" ? "active" : ""}
            onClick={() => setActivePage("My Tasks")}
          >
            My Tasks
          </li>

          <li
            className={activePage === "Requests" ? "active" : ""}
            onClick={() => setActivePage("Requests")}
          >
            Requests
          </li>

          <li
            className={activePage === "My Requests" ? "active" : ""}
            onClick={() => setActivePage("My Requests")}
          >
            My Requests
          </li>

          <li
            className={activePage === "Add Task" ? "active" : ""}
            onClick={() => setActivePage("Add Task")}
          >
            Add Task
          </li>

          <li
            className={activePage === "Settings" ? "active" : ""}
            onClick={() => setActivePage("Settings")}
          >
            Settings
          </li>
        </ul>

        <div className="profile">
          <strong>User</strong>
          <br />
          <span>user@gmail.com</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* TOP BAR */}
        <div className="topbar">
          <h2>{activePage}</h2>

          <div className="topbar-actions">
            <input type="text" placeholder="Search tasks..." />
            <span className="notification">🔔</span>
          </div>
        </div>

        {/* PAGE CONTENT */}
        {activePage === "Feed" && (
          <div className="feed">
            <TaskCard
              title="Help Moving Furniture"
              category="Moving"
              location="Downtown Seattle, WA"
            />
            <TaskCard
              title="Garden Cleanup"
              category="Gardening"
              location="Bellevue, WA"
            />
            <TaskCard
              title="Room Painting Project"
              category="Painting"
              location="Redmond, WA"
            />
          </div>
        )}

        {activePage === "My Tasks" && <p>My Tasks content goes here</p>}
        {activePage === "Requests" && <p>Requests content goes here</p>}
        {activePage === "My Requests" && <p>My Requests content goes here</p>}
        {activePage === "Add Task" && <p>Add Task form goes here</p>}
        {activePage === "Settings" && <p>Settings page goes here</p>}
      </main>
    </div>
  );
};

const TaskCard = ({ title, category, location }) => {
  return (
    <div className="task-card">
      <div className="tag">{category}</div>
      <h3>{title}</h3>
      <p>{location}</p>
      <button disabled>Request Sent</button>
    </div>
  );
};

export default Dashboard;
