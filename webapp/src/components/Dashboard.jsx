import React, { useState } from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("Feed");

  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 1, title: "Help Moving Furniture", category: "Moving", location: "Downtown Seattle, WA", requested: false },
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

  // Requests state
  const [requests, setRequests] = useState([]);

  // Notifications panel state
  const [showNotifications, setShowNotifications] = useState(false);

  // Add Task form state
  const [newTask, setNewTask] = useState({ title: "", category: "", location: "" });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Settings state
const [settings, setSettings] = useState({
  username: "",
  email: "",
  notifications: true,
});


  // Add new task
  const handleAddTask = () => {
    if (!newTask.title || !newTask.category || !newTask.location) return;
    const nextId = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
    setTasks([...tasks, { ...newTask, id: nextId, requested: false }]);
    setNewTask({ title: "", category: "", location: "" });
    setActivePage("Feed"); // Go back to Feed after adding
  };

  // Request a task
  const handleRequestTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Mark task as requested
    setTasks(tasks.map(t => t.id === id ? { ...t, requested: true } : t));

    // Add to requests list
    const nextReqId = requests.length ? requests[requests.length - 1].id + 1 : 1;
    setRequests([...requests, { id: nextReqId, taskId: id, requester: settings.username, status: "Pending" }]);
  };

  // Approve or reject request
  const handleRequestAction = (id, action) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
  };

  // Notification click
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Filter tasks by search term
  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">Hire-a-Helper</h2>
        <ul className="menu">
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
        <div className="profile">
          <strong>{settings.username}</strong>
          <br />
          <span>{settings.email}</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* TOP BAR */}
        <div className="topbar">
          <h2>{activePage}</h2>
          {activePage === "Feed" && (
            <div className="topbar-actions" style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span
  className="notification"
  style={{ cursor: "pointer", marginLeft: "12px", position: "relative" }}
  onClick={handleNotificationClick}
>
  🔔
  {requests.filter(r => r.status === "Pending").length > 0 && (
    <span className="notification-badge">
      {requests.filter(r => r.status === "Pending").length}
    </span>
  )}
  {showNotifications && (
    <div className="notification-panel">
      {requests.filter(r => r.status === "Pending").length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        requests.filter(r => r.status === "Pending").map(r => {
          const task = tasks.find(t => t.id === r.taskId);
          return (
            <div key={r.id} className="notification-item">
              <strong>{task ? task.title : "Task deleted"}</strong>
              <p>Requested by: {r.requester}</p>
            </div>
          );
        })
      )}
    </div>
  )}
</span>


              {/* Notification panel */}
              {showNotifications && (
                <div className="notification-panel">
                  {requests.filter(r => r.status === "Pending").length === 0 ? (
                    <p>No new notifications.</p>
                  ) : (
                    requests.filter(r => r.status === "Pending").map(r => {
                      const task = tasks.find(t => t.id === r.taskId);
                      return (
                        <div key={r.id} className="notification-item">
                          <strong>{task ? task.title : "Task deleted"}</strong>
                          <p>Requested by: {r.requester}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PAGE CONTENT */}
        {activePage === "Feed" && (
          <div className="feed">
            {filteredTasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onRequest={() => handleRequestTask(task.id)}
                />
              ))
            )}
          </div>
        )}

        {activePage === "My Tasks" && (
          <div>
            <h3>My Tasks</h3>
            {tasks.filter(t => t.requested).length === 0 ? (
              <p>No tasks requested yet.</p>
            ) : (
              tasks.filter(t => t.requested).map(t => (
                <TaskCard key={t.id} task={t} readOnly />
              ))
            )}
          </div>
        )}

        {activePage === "Requests" && (
          <div className="requests-page">
            <h3>Pending Requests</h3>
            {requests.length === 0 ? (
              <p>No requests yet.</p>
            ) : (
              requests.map(r => {
                const task = tasks.find(t => t.id === r.taskId);
                return (
                  <div key={r.id} className="request-card">
                    <h4>{task ? task.title : "Task deleted"}</h4>
                    <p>Requested by: {r.requester}</p>
                    <p>Status: {r.status}</p>
                    {r.status === "Pending" && (
                      <div>
                        <button onClick={() => handleRequestAction(r.id, "Approved")}>Approve</button>
                        <button onClick={() => handleRequestAction(r.id, "Rejected")}>Reject</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activePage === "My Requests" && (
          <div>
            <h3>My Requests</h3>
            {requests.filter(r => r.requester === settings.username).length === 0 ? (
              <p>No requests sent yet.</p>
            ) : (
              requests.filter(r => r.requester === settings.username).map(r => {
                const task = tasks.find(t => t.id === r.taskId);
                return (
                  <div key={r.id} className="request-card">
                    <h4>{task ? task.title : "Task deleted"}</h4>
                    <p>Status: {r.status}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activePage === "Add Task" && (
          <div className="add-task-form">
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Category"
              value={newTask.category}
              onChange={e => setNewTask({ ...newTask, category: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              value={newTask.location}
              onChange={e => setNewTask({ ...newTask, location: e.target.value })}
            />
            <button onClick={handleAddTask}>Add Task</button>
          </div>
        )}

        {activePage === "Settings" && (
          <div className="settings-page">
            <h3>Settings</h3>
            <div className="settings-form">
              <label>
                Username:
                <input
                  type="text"
                  value={settings.username}
                  onChange={e => setSettings({ ...settings, username: e.target.value })}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                />
              </label>
              <label>
                Notifications:
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={e => setSettings({ ...settings, notifications: e.target.checked })}
                />
              </label>
              <button onClick={() => alert("Settings saved!")}>Save Settings</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// TaskCard component
const TaskCard = ({ task, onRequest, readOnly }) => {
  return (
    <div className={`task-card ${task.requested ? "requested" : ""}`}>
      <div className="tag">{task.category}</div>
      <h3>{task.title}</h3>
      <p>{task.location}</p>
      <button
        onClick={onRequest}
        disabled={readOnly || task.requested}
      >
        {task.requested ? "Request Sent" : "Request Task"}
      </button>
    </div>
  );
};

export default Dashboard;
