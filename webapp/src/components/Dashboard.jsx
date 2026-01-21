import React, { useState,useEffect,useCallback  } from "react";
import { Upload } from 'lucide-react';
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
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [requests, setRequests] = useState([]);

  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    budget: "",
    image: null,
    imagePreview: null,
  });


 // ================= LOAD DATA =================


  const loadAll = useCallback(async () => {
  await Promise.all([
    loadFeed(),
    loadMyTasks(),
   
  ]);
}, []);

 useEffect(() => {
  loadAll();
}, [loadAll]);


  const loadFeed = async () => {
    try {
      const res = await api.get("/task/other");
setTasks(res.data.tasks || res.data.data || res.data);
    } catch {
      console.error("Feed load failed");
    }
  };

  const loadMyTasks = async () => {
    try {
      const res = await api.get("/task/me");
setMyTasks(res.data.tasks);
    } catch {
      console.error("My task load failed");
    }
  };

  

  // ================= ADD TASK =================
const handleAddTask = async () => {
  try {
    const formData = new FormData();

    formData.append("title", newTask.title);
    formData.append("description", newTask.description);
    formData.append("category", newTask.category);   
    formData.append("location", newTask.location);
    formData.append("start_time", newTask.date);
    formData.append("end_time", newTask.date);
    formData.append("status", "active");
    formData.append("budget", newTask.budget);      

    if (newTask.image) formData.append("picture", newTask.image);


    const res = await api.post("/task/create", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setNotifications((p) => [...p, "Task added successfully"]);
if (res.data?.task) {
  setTasks(prev => [res.data.task, ...prev]);
}

    setNewTask({
      title: "",
      description: "",
      category: "",
      location: "",
      date: "",
      budget: "",
      image: null,
      imagePreview: null
    });

    await loadFeed();
    await loadMyTasks();
    setActivePage("My Tasks");

  } catch (err) {
    console.error("Task creation failed:", err.response?.data || err.message);
  }
};


  // ===== HANDLE REQUEST APPROVAL / REJECTION =====
 const handleApproveRequest = async (_id) => {
  try {
    await api.patch(`/task/${_id}/status`, { status: "active" });
    setNotifications(p => [...p, "Task approved"]);
    await loadMyTasks();
    await loadFeed();
  } catch (err) {
    console.error("Approve failed:", err.response?.data || err.message);
  }
};

const handleRejectRequest = async (_id) => {
  try {
    await api.patch(`/task/${_id}/status`, { status: "cancelled" });
    setNotifications(p => [...p, "Task rejected"]);
    await loadMyTasks();
    await loadFeed();
  } catch (err) {
    console.error("Reject failed:", err.response?.data || err.message);
  }
};



  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [settings, setSettings] = useState({
    username: "",
    email: "",
    notifications: true,
  });

const filteredTasks = !Array.isArray(tasks)
  ? []
  : searchTerm.trim() === ""
    ? tasks
    : tasks.filter(t =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );


  
  // ===== HANDLE IMAGE UPLOAD =====
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTask({ 
        ...newTask, 
        image: file,
        imagePreview: reader.result  
      });
    };
    reader.readAsDataURL(file);
  }
};

// ===== HANDLE DRAG AND DROP =====
const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTask({ 
        ...newTask, 
        image: file,
        imagePreview: reader.result
      });
    };
    reader.readAsDataURL(file);
  } else {
    alert('Please drop an image file');
  }
};


// ===== REMOVE IMAGE =====
const handleRemoveImage = () => {
  setNewTask({ 
    ...newTask, 
    image: null,
    imagePreview: null
  });
};

  // ================= HANDLE REQUEST =================
  const handleRequestTask = (task) => {
  if (!task) return;

  const newRequest = {
    _id: task._id || Date.now(),
    title: task.title,
    location: task.location,
    picture: task.picture,
    category: task.category,
    requestedBy: settings.username || "You",
    status: "Pending",
  };

  setRequests(prev => [...prev, newRequest]);

  setNotifications(prev => [...prev, `Request sent for "${task.title}"`]);
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
              <TaskCard key={task._id || task.id} task={task} handleRequestTask={handleRequestTask} />

              
            ))}
          </div>
        )}

        {/* ===== ADD TASK ===== */}
        {/* {activePage === "Add Task" && (
          <div className="add-task-form">
            <input placeholder="Title" onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            <input placeholder="Category" onChange={e => setNewTask({ ...newTask, category: e.target.value })} />
            <input placeholder="Location" onChange={e => setNewTask({ ...newTask, location: e.target.value })} />
            <button onClick={() => {
              setTasks([...tasks, { ...newTask, id: tasks.length + 1, requested: false, status: "Pending" }]);
              setActivePage("Feed");
            }}>Add Task</button>
          </div>
        )} */}

         {/* ===== NEW ADD TASK ===== */}
         {activePage === "Add Task" && (
  <div className="add-task-container">
    <div className="add-task-form">
      <h2>Add Task</h2>
      
      <div className="form-group">
        <label>Task Title</label>
        <input 
          type="text"
          placeholder="Task Title" 
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
        />
      </div>

      <div className="form-group">
        <label>Task Description</label>
        <textarea 
          placeholder="Describe the task you need help with"
          value={newTask.description}
          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <input 
            type="text"
            placeholder="e.g., Moving, Gardening, Tech"
            value={newTask.category}
            onChange={e => setNewTask({ ...newTask, category: e.target.value })} 
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input 
            type="text"
            placeholder="City, State"
            value={newTask.location}
            onChange={e => setNewTask({ ...newTask, location: e.target.value })} 
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input 
            type="date"
            value={newTask.date}
            onChange={e => setNewTask({ ...newTask, date: e.target.value })} 
          />
        </div>

        <div className="form-group">
          <label>Budget</label>
          <input 
            type="number"
            min={0}
            placeholder="₹0.00"
            value={newTask.budget}
            onChange={e => setNewTask({ ...newTask, budget: e.target.value })} 
          />
        </div>
      </div>

      <div className="form-group">
        <label>Task Image</label>
        {newTask.imagePreview ? (
          <div className="image-preview-container">
            <img src={newTask.imagePreview} alt="Preview" className="image-preview" />
            <button 
              type="button"
              className="btn-remove-image"
              onClick={handleRemoveImage}
            >
              ✕ Remove Image
            </button>
          </div>
        ) : (
          <div className="file-upload"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input 
              type="file"
              id="task-image"
              accept="image/*"
              onChange={handleImageChange}
            />
            <label htmlFor="task-image" className="file-upload-label">
             <span><Upload /></span>Upload a file or drag and drop
              <span>PNG, JPG, GIF up to 10MB</span>
            </label>
          </div>
        )}
      </div>

     <div className="form-actions">
  <button className="btn-submit" onClick={handleAddTask}>
    Add Task
  </button>
</div>

    </div>
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
              <div key={task._id || task.id} className="task-card">
                <div className="tag">{task.category}</div>
                {task.picture && <img src={task.picture} alt={task.title} className="task-image" />}
                <h3>{task.title}</h3>
                <p>{task.location}</p>
                <p>Status: {task.status}</p>

                {task.status === "pending" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => handleApproveRequest(task._id)}>Activate</button>
                    <button onClick={() => handleRejectRequest(task._id)}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== REQUESTS ===== */}
       {activePage === "Requests" && (
          <div className="feed">
            {requests.map(task => (
              <div key={task._id || task.id} className="task-card">
                {task.picture && <img src={task.picture} alt={task.title} className="task-image" />}
                <p>Requested by: {task.requestedBy}</p>
                <p>Status: {task.status}</p>
                {task.status === "Pending" && (
  <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
    <button
      style={{ background: "#22c55e", color: "#fff" }}
      onClick={() => handleApproveRequest(task._id || task.id)}
    >
      Approve
    </button>

    <button
      style={{ background: "#ef4444", color: "#fff" }}
      onClick={() => handleRejectRequest(task._id || task.id)}
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

              <div key={task._id || task.id} className="task-card">
                {task.picture && <img src={task.picture} alt={task.title} className="task-image" />}
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
    {task.picture && (
      <img src={task.picture} alt={task.title} className="task-image" />
    )}
    <div className="tag">{task.category}</div>
    <h3>{task.title}</h3>
    <p>{task.location}</p>
    {task.date && <p className="task-date">{task.date}</p>}
    <button
      disabled={task.requested}
      onClick={() => handleRequestTask(task)}
    >
      {task.requested ? "Request Sent" : "Request Task"}
    </button>
  </div>
);
export default Dashboard;