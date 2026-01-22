import React, { useState,useEffect,useCallback  } from "react";
import { Upload } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  

  const [activePage, setActivePage] = useState("Feed");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
   // TASKS
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
 const [requests, setRequests] = useState([]);


  

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

  

  const loadAll = useCallback(async () => {
  await Promise.all([
    loadFeed(),
    loadMyTasks(),
   
   
  ]);
}, []);


 useEffect(() => {
  loadAll();
}, [loadAll]);

  

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

   
    setActivePage("My Tasks");
      loadAll();

  } catch (err) {
    console.error("Task creation failed:", err.response?.data || err.message);
  }
};


  // ===== HANDLE REQUEST APPROVAL / REJECTION =====
 const handleApproveRequest = async (id) => {
  try {
    await api.patch(`/task/${id}/status`, { status: "active" });
    setNotifications(p => [...p, "Task approved"]);
         loadAll();

  } catch (err) {
    console.error("Approve failed:", err.response?.data || err.message);
  }
};

const handleRejectRequest = async (id) => {
  try {
    await api.patch(`/task/${id}/status`, { status: "cancelled" });
    setNotifications(p => [...p, "Task rejected"]);
          loadAll();

  } catch (err) {
    console.error("Reject failed:", err.response?.data || err.message);
  }
};

  
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


/* ================= EDIT TASK ================= */

const handleUpdateTask = async () => {
  try {
    const fd = new FormData();
    fd.append("title", editingTask.title);
    fd.append("description", editingTask.description);
    fd.append("category", editingTask.category);
    fd.append("location", editingTask.location);
    fd.append("start_time", editingTask.start_time);
    fd.append("end_time", editingTask.end_time);
    fd.append("status", editingTask.status);
    fd.append("budget", editingTask.budget);

    if (editingTask.newImage) {
      fd.append("picture", editingTask.newImage);
    }

    await api.put(`/task/${editingTask._id}`, fd);

    setEditingTask(null);
    setNotifications(p => [...p, "Task updated successfully"]);
    loadAll();

  } catch (err) {
    console.error("Update failed:", err.response?.data || err.message);
  }
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
      <TaskCard
        key={task._id || task.id}
        task={task}
        editable={true}
        onEdit={setEditingTask}
      />
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


       {/* ===== EDIT MODAL ===== */}
      {editingTask && (
  <div className="modal-overlay">
    <div className="modal edit-modal">

      <h2>Edit Task</h2>

      <input
        type="text"
        value={editingTask.title || ""}
        onChange={(e) =>
          setEditingTask({ ...editingTask, title: e.target.value })
        }
        placeholder="Title"
      />

      <textarea
        value={editingTask.description || ""}
        onChange={(e) =>
          setEditingTask({ ...editingTask, description: e.target.value })
        }
        placeholder="Description"
      />

      <input
        type="text"
        value={editingTask.location || ""}
        onChange={(e) =>
          setEditingTask({ ...editingTask, location: e.target.value })
        }
        placeholder="Location"
      />

     <input
  type="datetime-local"
  value={editingTask.start_time ? editingTask.start_time.slice(0, 16) : ""}
  onChange={(e) =>
    setEditingTask({ ...editingTask, start_time: e.target.value })
  }
/>

      <select
        value={editingTask.status || "pending"}
        onChange={(e) =>
          setEditingTask({ ...editingTask, status: e.target.value })
        }
      >
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setEditingTask({
            ...editingTask,
            newImage: e.target.files[0]
          })
        }
      />

      <div className="modal-actions">
        <button onClick={handleUpdateTask}>Update</button>
        <button onClick={() => setEditingTask(null)}>Cancel</button>
      </div>

    </div>
  </div>
)}


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

const TaskCard = ({ task, handleRequestTask, editable = false, onEdit }) => {
  if (!task) return null;

  return (
    <div className="task-card">
      {task.picture && (
        <img src={task.picture} alt={task.title || "task"} className="task-image" />
      )}

      <div className="card-content">
        {/* Status badge for My Tasks */}
        {editable && task.status && (
          <div className={`status-badge status-${task.status.toLowerCase()}`}>
            {task.status}
          </div>
        )}

        <div className="tag">{task.category || "General"}</div>

        <h3>{task.title}</h3>
        
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {task.location && (
          <p className="task-location">
            <span className="icon">📍</span> {task.location}
          </p>
        )}

        {task.start_time && (
          <p className="task-date">
            <span className="icon">📅</span> 
            {new Date(task.start_time).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })} • {new Date(task.start_time).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </p>
        )}

        {task.budget && (
          <p className="task-budget">
            <span className="icon">₹</span> {task.budget}
          </p>
        )}

        <div className="task-footer">
          <div className="task-author">
            <div className="author-avatar">
              {(task.user?.username || "U").charAt(0).toUpperCase()}
            </div>
            <span className="author-name">{task.user?.username || "User"}</span>
          </div>

          {/* ===== MY TASKS → EDIT ===== */}
          {editable && (
            <button className="edit-btn" onClick={() => onEdit(task)}>
              ✏️ Edit Task
            </button>
          )}

          {/* ===== FEED → REQUEST ===== */}
          {!editable && handleRequestTask && (
            <button className="request-btn" onClick={() => handleRequestTask(task)}>
              Request Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;