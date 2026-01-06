import React from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
     
      <aside className="sidebar">
        <h2 className="logo">Hire-a-Helper</h2>

        <ul className="menu">
          <li className="active">Feed</li>
          <li>My Tasks</li>
          <li>Requests</li>
          <li>My Requests</li>
          <li>Add Task</li>
          <li>Settings</li>
        </ul>

        <div className="profile">
          <strong>User</strong><br></br>
          <span>user@gmail.com</span>
        </div>
      </aside>


      <main className="main">
       
        <div className="topbar">
          <div>
            <h2>Feed</h2>
            <p></p>
          </div>

          <div className="topbar-actions">
            <input type="text" placeholder="Search tasks..." />
            <span className="notification">🔔</span>
          </div>
        </div>

       
        <div className="feed">
          <TaskCard
            title="Help Moving Furniture"
            category="moving"
            location="Downtown Seattle, WA"
          />
          <TaskCard
            title="Garden Cleanup"
            category="gardening"
            location="Bellevue, WA"
          />
          <TaskCard
            title="Room Painting Project"
            category="painting"
            location="Redmond, WA"
          />
        </div>
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
      <button>Request Sent</button>
    </div>
  );
};

export default Dashboard;
