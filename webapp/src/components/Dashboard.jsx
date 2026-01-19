import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import api from "../services/api";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("Feed");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();

const handleLogout = async () => {
  if (logoutLoading) return;
  try {
    setLogoutLoading(true);
    await api.post("/auth/logout");
    setTimeout(() => navigate("/login"), 700);
  } catch {
    console.error("Logout failed");
  } finally {
    setLogoutLoading(false);
  }
};


 
  // TASKS
  const [tasks, setTasks] = useState([ { id: 1, title: "Help Moving Furniture", category: "Moving", location: "Downtown Seattle, WA", requested: false },
    { id: 2, title: "Garden Cleanup", category: "Gardening", location: "Bellevue, WA", requested: false },
    { id: 3, title: "Room Painting Project", category: "Painting", location: "Redmond, WA", requested: false }, 
    { id: 4, title: "Dog Walking", category: "Pet Care", location: "Seattle, WA", requested: false },
    { id: 5, title: "Grocery Shopping Assistance", category: "Errands", location: "Kirkland, WA", requested: false }, 
    { id: 6, title: "Assemble IKEA Furniture", category: "DIY", location: "Renton, WA", requested: false },
    { id: 7, title: "Math Tutoring", category: "Education", location: "Bellevue, WA", requested: false }, 
    { id: 8, title: "Yoga Session Help", category: "Fitness", location: "Redmond, WA", requested: false }, 
    { id: 9, title: "Website Bug Fix", category: "Tech", location: "Seattle, WA", requested: false }, 
    { id: 10, title: "Car Wash Assistance", category: "Automotive", location: "Kirkland, WA", requested: false }, 
    { id: 11, title: "Birthday Party Setup", category: "Event", location: "Bothell, WA", requested: false }, 
    { id: 12, title: "Photography Help", category: "Creative", location: "Seattle, WA", requested: false },
    { id: 13, title: "Music Lesson Assistance", category: "Education", location: "Redmond, WA", requested: false }, 
    { id: 14, title: "Laptop Setup", category: "Tech", location: "Bellevue, WA", requested: false }, 
    { id: 15, title: "Closet Organization", category: "Home", location: "Renton, WA", requested: false } 
  ]);


  const [myTasks, setMyTasks] = useState([]);
  const [requests, setRequests] = useState([]);

  // ===== HANDLE REQUEST APPROVAL / REJECTION =====
const handleApproveRequest = (id) => {
  setRequests(prev =>
    prev.map(req =>
      req.id === id ? { ...req, status: "Approved" } : req
    )
  );
};

const handleRejectRequest = (id) => {
  setRequests(prev =>
    prev.map(req =>
      req.id === id ? { ...req, status: "Rejected" } : req
    )
  );
};


  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTask, setNewTask] = useState({ title: "", category: "", location: "" });

  const [settings, setSettings] = useState({
    username: "",
    email: "",
    notifications: true,
  });

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= HANDLE REQUEST =================
  const handleRequestTask = (task) => {
    // Update task as requested
    setTasks(tasks.map(t => t.id === task.id ? { ...t, requested: true } : t));

    // Add to My Tasks
    setMyTasks([...myTasks, { ...task, requested: true }]);

    // Add to Requests list
    setRequests([
  ...requests,
  {
    ...task,
    requestedBy: settings.username || "You",
    status: "Pending",
  },
]);


    // Add notification
    setNotifications([...notifications, `Request sent for "${task.title}"`]);
  };

  return (
    <div className="dashboard">
    
    {/* ================= DESKTOP SIDEBAR ================= */}
<aside className="sidebar">
  <h3 className="logo">Hire-a-Helper</h3>

  <ul className="sidebar-menu">
    {["Feed", "My Tasks", "Requests", "My Requests", "Add Task", "Settings"].map(page => (
      <li
        key={page}
        className={activePage === page ? "active" : ""}
        onClick={() => setActivePage(page)}
      >
        {page}
      </li>
    ))}
  </ul>

  <div className="sidebar-footer">
    <strong>{settings.username || "User"}</strong>
    <span>{settings.email || "user@email.com"}</span>

    <button
      className="logout-btn"
      onClick={() => setShowLogoutConfirm(true)}
    >
      Logout
    </button>
  </div>
</aside>


      {/* ================= TOP BAR ================= */}
      <div className="topbar">
        <span
          className="hamburger-icon"
          onClick={() => setShowMenu(true)}
          style={{ cursor: "pointer" }}
        >
          ☰
        </span>

        <h2>{activePage}</h2>

        {activePage === "Feed" && (
          <div className="topbar-actions">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div
  className="notification-bell"
  onClick={() => setShowNotifications(!showNotifications)}
>
  🔔
  {notifications.length > 0 && (
    <span className="notification-badge">
      {notifications.length}
    </span>
  )}
</div>

            {showNotifications && (
  <div className="notification-dropdown">
    {notifications.length === 0 ? (
      <p style={{ padding: "10px" }}>No notifications</p>
    ) : (
      notifications.map((note, index) => (
        <p key={index} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
          {note}
        </p>
      ))
    )}
  </div>
)}

          </div>
        )}
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main">

        {/* ===== FEED ===== */}
        {activePage === "Feed" && (
          <div className="feed">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} handleRequestTask={handleRequestTask} />
            ))}
          </div>
        )}

        {/* ===== ADD TASK ===== */}
        {activePage === "Add Task" && (
          <div className="add-task-form">
            <input placeholder="Title" onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            <input placeholder="Category" onChange={e => setNewTask({ ...newTask, category: e.target.value })} />
            <input placeholder="Location" onChange={e => setNewTask({ ...newTask, location: e.target.value })} />
            <button onClick={() => {
              setTasks([...tasks, { ...newTask, id: tasks.length + 1, requested: false, status: "Pending" }]);
              setActivePage("Feed");
            }}>Add Task</button>
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {activePage === "Settings" && (
          <div className="settings-page">
            <input placeholder="Username" value={settings.username}
              onChange={e => setSettings({ ...settings, username: e.target.value })} />
            <input placeholder="Email" value={settings.email}
              onChange={e => setSettings({ ...settings, email: e.target.value })} />
          </div>
        )}

        {/* ===== MY TASKS ===== */}
        {activePage === "My Tasks" && (
          <div className="feed">
            {myTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="tag">{task.category}</div>
                <h3>{task.title}</h3>
                <p>{task.location}</p>
                <button disabled>Request Sent</button>
              </div>
            ))}
          </div>
        )}

        {/* ===== REQUESTS ===== */}
        {activePage === "Requests" && (
          <div className="feed">
            {requests.map(task => (
              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>Requested by: {task.requestedBy}</p>
                <p>Status: {task.status}</p>
                {task.status === "Pending" && (
  <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
    <button
      style={{ background: "#22c55e", color: "#fff" }}
      onClick={() => handleApproveRequest(task.id)}
    >
      Approve
    </button>

    <button
      style={{ background: "#ef4444", color: "#fff" }}
      onClick={() => handleRejectRequest(task.id)}
    >
      Reject
    </button>
  </div>
)}

              </div>
            ))}
          </div>
        )}

        {/* ===== MY REQUESTS ===== */}
        {activePage === "My Requests" && (
          <div className="feed">
            {requests.map(task => (

              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>Status: {task.status}</p>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ================= HAMBURGER MENU ================= */}
      {showMenu && (
        <div className="hamburger-overlay" onClick={() => setShowMenu(false)}>
          <div className="hamburger-menu" onClick={e => e.stopPropagation()}>
            <h3>Hire-a-Helper</h3>

            <ul className="menu-list">
              {["Feed", "My Tasks", "Requests", "My Requests", "Add Task", "Settings"].map(page => (
                <li
                  key={page}
                  onClick={() => {
                    setActivePage(page);
                    setShowMenu(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {page}
                </li>
              ))}
            </ul>

            <div className="menu-profile">
              <strong>{settings.username || "User"}</strong>
              <span>{settings.email || "user@email.com"}</span>

              <button
                className="logout-btn"
                onClick={() => {
                  setShowMenu(false);
                  setShowLogoutConfirm(true);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LOGOUT CONFIRM ================= */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p style={{ textAlign: "center", marginBottom: "20px" }}>Do you really want to logout?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <button onClick={handleLogout}>YES</button>
              <button onClick={() => setShowLogoutConfirm(false)}>NO</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const TaskCard = ({ task, handleRequestTask }) => (
  <div className="task-card">
    <div className="tag">{task.category}</div>
    <h3>{task.title}</h3>
    <p>{task.location}</p>
    <button
      disabled={task.requested}
      onClick={() => handleRequestTask(task)}
    >
      {task.requested ? "Request Sent" : "Request Task"}
    </button>
  </div>
);

export default Dashboard;