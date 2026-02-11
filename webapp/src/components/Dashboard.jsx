import React, { useState, useEffect, useCallback } from "react";
import { Upload, Bell } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/dashboard.css";
import api from "../services/api";
import Settings from "./Settings";
import Loader from "./Loader";

const Dashboard = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Feed");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [user, setUser] = useState({ username: "", email: "" });

  // TASKS
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  // REQUESTS
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // REQUEST MODAL
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTaskForRequest, setSelectedTaskForRequest] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const pendingCount = receivedRequests.filter(r => r.status === "pending").length;

  // NEW TASK FORM
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    endDate: "",
    image: null,
    imagePreview: null,
  });

  const handleLogout = async () => {
    if (logoutLoading) return;
    try {
      setLogoutLoading(true);
      await api.post("/auth/logout");
      toast.success("Logged out successfully 👋");
      setTimeout(() => navigate("/login"), 700);
    } catch {
      toast.error("Logout failed");
      console.error("Logout failed");
    } finally {
      setLogoutLoading(false);
    }
  };

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

  const loadReceivedRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get("/requests/received");
      setReceivedRequests(res.data.requests || res.data || []);
    } catch (err) {
      console.error("Failed to load received requests:", err);
      setReceivedRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadSentRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get("/requests/sent");
      const data = res.data.requests || res.data || [];
      const fixed = data.map(r => ({
        ...r,
        taskId: r.task_id?._id || r.taskId
      }));
      setSentRequests(fixed);
    } catch (err) {
      console.error("Failed to load sent requests:", err);
      setSentRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const u = res.data.user;
      if (!u) return;
      setUser({
        _id: u._id || "",
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || u.email_id || "",
        phone_number: u.phone_number || "",
        picture: u.profile_picture || u.picture || ""
      });
    } catch (err) {
      console.error("Failed to load user profile:", err.message);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const raw = res.data.notifications || res.data.data || res.data || [];
      const normalized = Array.isArray(raw) ? raw : [];
      setNotifications(normalized);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    }
  };

  const handleMarkNotificationsRead = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  }, []);

  const handleSingleNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const loadAll = useCallback(async () => {
    try {
      await loadUserProfile();
      await Promise.all([
        loadFeed(),
        loadMyTasks(),
        loadReceivedRequests(),
        loadSentRequests(),
        loadNotifications(),
      ]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setGlobalLoading(true);
      await loadAll();
      setGlobalLoading(false);
    };
    init();
  }, [loadAll]);

  useEffect(() => {
    if (!user._id) return;
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [user._id]);

  // ================= ADD TASK =================
  const handleAddTask = async () => {
    try {
      setGlobalLoading(true);
      const formData = new FormData();
      formData.append("title", newTask.title);
      formData.append("description", newTask.description);
      formData.append("category", newTask.category);
      formData.append("location", newTask.location);
      formData.append("start_time", newTask.startDate);
      formData.append("end_time", newTask.endDate);
      formData.append("status", "active");
      if (newTask.image) formData.append("picture", newTask.image);

      const res = await api.post("/task/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.task) {
        setTasks(prev => [res.data.task, ...prev]);
      }

      setNewTask({
        title: "",
        description: "",
        category: "",
        location: "",
        startDate: "",
        endDate: "",
        image: null,
        imagePreview: null
      });

      setActivePage("My Tasks");
      toast.success("Task added successfully ✅");
      loadAll();
    } catch (err) {
      toast.error("Task creation failed ❌");
      console.error("Task creation failed:", err.response?.data || err.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedTaskForRequest) return;
    if (!requestMessage.trim()) return;

    try {
      setGlobalLoading(true);
      setSendingRequest(true);
      await api.post(`/requests/${selectedTaskForRequest._id}/send`, { description: requestMessage });
      setShowRequestModal(false);
      setRequestMessage("");
      setSelectedTaskForRequest(null);
      await loadSentRequests();
      await loadNotifications();
      toast.success("Task request sent successfully 📩");
      loadFeed();
    } catch (err) {
      console.error("Failed to send request:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to send request. Please try again.";
      toast.error(errorMessage);
      if (errorMessage.includes("already")) {
        setShowRequestModal(false);
        setRequestMessage("");
        setSelectedTaskForRequest(null);
      }
    } finally {
      setSendingRequest(false);
      setGlobalLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!requestId) return;
    try {
      setGlobalLoading(true);
      setActionLoading(true);
      await api.put(`/requests/${requestId}`, { status: "accepted" });
      await loadReceivedRequests();
      await loadNotifications();
      await loadMyTasks();
      toast.success("Request accepted! ✅");
    } catch (err) {
      console.error("Accept failed:", err);
      toast.error("Failed to accept request");
    } finally {
      setActionLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!requestId) return;
    try {
      setGlobalLoading(true);
      await api.put(`/requests/${requestId}`, { status: "rejected" });
      await loadReceivedRequests();
      await loadNotifications();
      toast.success("Request rejected");
    } catch (err) {
      console.error("Reject failed:", err);
      toast.error("Failed to reject request");
    } finally {
      setGlobalLoading(false);
    }
  };

  const filteredTasks = (list) => {
    if (!Array.isArray(list)) return [];
    if (searchTerm.trim() === "") return list;
    return list.filter(t =>
      t.title?.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  };

  const filteredReceivedRequests = (receivedRequests || []).filter(req => {
    const title = req.task?.title || req.taskTitle || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  const filteredSentRequests = (sentRequests || []).filter(req =>
    req.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTask({ ...newTask, image: file, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTask({ ...newTask, image: file, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      toast.warn('Please drop an image file');
    }
  };

  const handleRemoveImage = () => {
    setNewTask({ ...newTask, image: null, imagePreview: null });
  };

  const handleUpdateTask = async () => {
    try {
      setGlobalLoading(true);
      const fd = new FormData();
      fd.append("title", editingTask.title);
      fd.append("category", editingTask.category);
      fd.append("description", editingTask.description);
      fd.append("location", editingTask.location);
      fd.append("start_time", editingTask.start_time);
      fd.append("end_time", editingTask.end_time);
      if (editingTask.newImage) fd.append("picture", editingTask.newImage);

      await api.put(`/task/${editingTask._id}`, fd);
      setEditingTask(null);
      toast.success("Task updated successfully ✏️");
      loadAll();
    } catch (err) {
      toast.error("Failed to update task ❌");
      console.error("Update failed:", err.response?.data || err.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const openRequestModal = (task) => {
    setSelectedTaskForRequest(task);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  return (
    <>
      {globalLoading && <Loader />}
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3 className="logo">Hire-a-Helper</h3>
          </div>
          <ul className="sidebar-menu">
            {["Feed", "My Tasks", "Requests", "My Requests", "Add Task", "Settings"].map(page => (
              <li
                key={page}
                className={activePage === page ? "active" : ""}
                onClick={() => setActivePage(page)}
              >
                {page}
                {page === "Requests" && pendingCount > 0 && (
                  <span className="pending-badge">{pendingCount}</span>
                )}
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
            <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
          </div>
        </aside>

        <div className="dashboard-right">
          <div className="topbar">
            <div className="topbar-left">
              <span className="hamburger-icon" onClick={() => setShowMenu(true)}>☰</span>
              <h2>{activePage}</h2>
            </div>
            <div className="topbar-center">
              {!["Settings", "Add Task"].includes(activePage) && (
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
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </div>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <span>Notifications</span>
                    {notifications.some(n => !n.read) && (
                      <p className="mark-all-btn" onClick={handleMarkNotificationsRead}>Mark all as read</p>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty"><p>No notifications yet</p></div>
                    ) : (
                      notifications.map(note => (
                        <div key={note._id} className={`notification-item ${note.read ? "read" : "unread"}`} onClick={() => handleSingleNotificationRead(note._id)}>
                          <div className="notification-dot" />
                          <div className="notification-content">
                            <p className="notification-message">{note.message}</p>
                            <p className="notification-time">
                              {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

          <main className="main">
            {activePage === "Feed" && (
              <div className="feed">
                {filteredTasks(tasks).length === 0 ? (
                  <div className="empty-state-feed">
                    <h3>No tasks available right now</h3>
                    <p>Be the first to add a task or check back later.</p>
                  </div>
                ) : (
                  filteredTasks(tasks).map((task, index) => (
                    <TaskCard
                      key={task._id || task.id || index}
                      task={task}
                      currentUserId={user._id}
                      sentRequests={sentRequests}
                      onRequestTask={openRequestModal}
                    />
                  ))
                )}
              </div>
            )}

            {activePage === "Add Task" && (
              <div className="add-task-container">
                <div className="add-task-form">
                  <h2>Add Task</h2>
                  <div className="form-group">
                    <label>Task Title <span className="required">*</span></label>
                    <input type="text" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Task Description</label>
                    <textarea placeholder="Describe the task you need help with" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows="4" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category <span className="required">*</span></label>
                      <input type="text" placeholder="e.g., Moving, Gardening, Tech" value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Location <span className="required">*</span></label>
                      <input type="text" placeholder="City, State" value={newTask.location} onChange={e => setNewTask({ ...newTask, location: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label> Start Date <span className="required">*</span></label>
                      <input type="date" value={newTask.startDate} onChange={e => setNewTask({ ...newTask, startDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label> End Date </label>
                      <input type="date" value={newTask.endDate} onChange={e => setNewTask({ ...newTask, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Task Image</label>
                    {newTask.imagePreview ? (
                      <div className="image-preview-container">
                        <img src={newTask.imagePreview} alt="Preview" className="image-preview" />
                        <button type="button" className="btn-remove-image" onClick={handleRemoveImage}>✕ Remove Image</button>
                      </div>
                    ) : (
                      <div className="file-upload" onDragOver={handleDragOver} onDrop={handleDrop}>
                        <input type="file" id="task-image" accept="image/*" onChange={handleImageChange} />
                        <label htmlFor="task-image" className="file-upload-label">
                          <span><Upload /></span>Upload a file or drag and drop
                          <span>PNG, JPG, GIF up to 10MB</span>
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="form-actions">
                    <button className="btn-submit" onClick={handleAddTask}>Add Task</button>
                  </div>
                </div>
              </div>
            )}

            {activePage === "Settings" && (
              <Settings user={user} reloadUser={loadUserProfile} />
            )}

            {activePage === "My Tasks" && (
              <>
                <div className="my-tasks-header">
                  <button className="add-task-btn" onClick={() => setActivePage("Add Task")}>+ Add New Task</button>
                </div>
                <div className="feed my-tasks-section">
                  {filteredTasks(myTasks).length === 0 ? (
                    <div className="empty-state">
                      <h3>You haven’t created any tasks yet</h3>
                      <p>Start by adding a new task and get help from others.</p>
                    </div>
                  ) : (
                    filteredTasks(myTasks).map((task, index) => (
                      <TaskCard key={task._id || task.id || index} task={task} editable={true} onEdit={setEditingTask} />
                    ))
                  )}
                </div>
              </>
            )}

            {activePage === "Requests" && (
              <div className="requests-page">
                <h2>Incoming Requests</h2>
                <p className="page-subtitle">People who want to help with your tasks</p>
                {loadingRequests ? (
                  <p style={{ padding: "20px" }}>Loading requests...</p>
                ) : receivedRequests.length === 0 ? (
                  <p style={{ padding: "20px" }}>No requests yet. Create a task to get started!</p>
                ) : (
                  <div className="feed">
                    {filteredReceivedRequests.map(req => (
                      <div key={req.requestId || req._id} className="request-card">
                        <div className="requester-header">
                          <div className="requester-avatar">{(req.requester?.first_name || "U").charAt(0).toUpperCase()}</div>
                          <div className="requester-info"><h3>{req.requester?.name || "User"}</h3></div>
                        </div>
                        <div className="request-task-info">
                          <h4>Requesting for: {req.task?.title || req.taskTitle || "Task"}</h4>
                          {(req.task?.picture || req.taskPicture) && (
                            <img src={req.task?.picture || req.taskPicture} alt={req.task?.title || req.taskTitle} className="request-task-image" />
                          )}
                        </div>
                        <div className="request-message">
                          <p><strong>Their message:</strong></p>
                          <p className="message-text">{req.description || req.message || "No message"}</p>
                        </div>
                        <div className="request-meta">
                          <span>📍 {req.task?.location || req.taskLocation || "Location not specified"}</span>
                          <span>🕐 {new Date(req.createdAt || req.creationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="request-actions">
                          {req.status === "pending" ? (
                            <>
                              <button className="btn-accept" onClick={() => handleAcceptRequest(req.requestId)} disabled={actionLoading}>{actionLoading ? "..." : "✓ Accept"}</button>
                              <button className="btn-reject" onClick={() => handleRejectRequest(req.requestId)} disabled={actionLoading}>{actionLoading ? "..." : " ✕ Reject"}</button>
                            </>
                          ) : (
                            <span className={`status-badge status-${req.status}`}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activePage === "My Requests" && (
              <div className="my-requests-page">
                <h2>My Requests</h2>
                <p className="page-subtitle">Track the help requests you've sent</p>
                {loadingRequests ? (
                  <p style={{ padding: "20px" }}>Loading requests...</p>
                ) : sentRequests.length === 0 ? (
                  <p style={{ padding: "20px" }}>You haven't requested any tasks yet. Go to Feed to request!</p>
                ) : (
                  <div className="my-requests-grid">
                    {filteredSentRequests.map(req => (
                      <div key={req.requestId} className="request-card my-request-card">
                        <div className="request-task-image-wrapper">
                          {req.taskPicture ? (
                            <img src={req.taskPicture} alt={req.taskTitle || "Task"} className="request-task-image" />
                          ) : (
                            <div className="request-task-image-placeholder">📷 No image provided</div>
                          )}
                        </div>
                        <div className="request-card-body">
                          <h3 className="request-title">{req.taskTitle || "Untitled task"}</h3>
                          <p className="request-owner"><strong>Owner:</strong> {req.taskOwnerName || "Not available"}</p>
                          {req.taskLocation && <p className="task-location">📍 {req.taskLocation}</p>}
                          <div className="request-message"><strong>Your message:</strong><p>{req.description || "No message"}</p></div>
                        </div>
                        <div className="request-status-section">
                          <span className={`status-badge status-${req.status}`}>
                            {req.status === "pending" && "🟡 Pending"}
                            {req.status === "accepted" && "🟢 Accepted"}
                            {req.status === "rejected" && "🔴 Rejected"}
                          </span>
                          <p className="request-date">{req.creationDate ? `Sent ${new Date(req.creationDate).toLocaleDateString()}` : "Date not available"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          {editingTask && (
            <div className="modal-overlay">
              <div className="modal edit-modal">
                <h2>Edit Task</h2>
                <label>Title <span className="required">*</span></label>
                <input type="text" value={editingTask.title || ""} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} />
                <label>Category <span className="required">*</span></label>
                <input type="text" value={editingTask.category || ""} onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })} />
                <label>Description</label>
                <textarea value={editingTask.description || ""} onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} />
                <label>Location <span className="required">*</span></label>
                <input type="text" value={editingTask.location || ""} onChange={(e) => setEditingTask({ ...editingTask, location: e.target.value })} />
                <label>Start Date & Time <span className="required">*</span></label>
                <input type="datetime-local" value={editingTask.start_time ? editingTask.start_time.slice(0, 16) : ""} onChange={(e) => setEditingTask({ ...editingTask, start_time: e.target.value })} />
                <label>End Date & Time <span className="required">*</span></label>
                <input type="datetime-local" value={editingTask.end_time ? editingTask.end_time.slice(0, 16) : ""} onChange={(e) => setEditingTask({ ...editingTask, end_time: e.target.value })} />
                <label>Change Image</label>
                <input type="file" accept="image/*" onChange={(e) => setEditingTask({ ...editingTask, newImage: e.target.files[0] })} />
                <div className="modal-actions">
                  <button onClick={handleUpdateTask}>Update</button>
                  <button onClick={() => setEditingTask(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showRequestModal && selectedTaskForRequest && (
            <div className="modal-overlay">
              <div className="modal request-modal">
                <h2>Send Request</h2>
                <div className="modal-task-info">
                  <h3>{selectedTaskForRequest.title}</h3>
                  {selectedTaskForRequest.picture && (
                    <img src={selectedTaskForRequest.picture} alt={selectedTaskForRequest.title} className="modal-task-image" />
                  )}
                </div>
                <label>Your Message to the Task Owner</label>
                <textarea placeholder="Tell the task owner about your experience, availability, and why you'd be great for this task..." value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows="6" style={{ width: "100%", padding: "10px", marginBottom: "15px" }} />
                <div className="modal-actions">
                  <button className="btn-submit" onClick={handleSendRequest} disabled={sendingRequest || !requestMessage.trim()}>{sendingRequest ? "Sending..." : "Send Request"}</button>
                  <button className="btn-cancel" onClick={() => { setShowRequestModal(false); setRequestMessage(""); setSelectedTaskForRequest(null); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showMenu && (
            <div className="hamburger-overlay" onClick={() => setShowMenu(false)}>
              <div className="hamburger-menu" onClick={e => e.stopPropagation()}>
                <h3>Hire-a-Helper</h3>
                <ul className="menu-list">
                  {["Feed", "My Tasks", "Requests", "My Requests", "Add Task", "Settings"].map(page => (
                    <li key={page} onClick={() => { setActivePage(page); setShowMenu(false); }} style={{ cursor: "pointer" }}>{page}</li>
                  ))}
                </ul>
                <div className="sidebar-footer">
                  <button className="logout-btn" onClick={() => { setShowMenu(false); setShowLogoutConfirm(true); }}>Logout</button>
                </div>
              </div>
            </div>
          )}

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
      </div>
    </>
  );
};

const TaskCard = ({ task, currentUserId, sentRequests = [], onRequestTask, editable = false, onEdit }) => {
  if (!task) return null;
  const taskId = String(task._id || task.id);
  const hasRequested = sentRequests.some(req => String(req.taskId) === taskId);
  const isOwnTask = currentUserId === (task.user_id?._id || task.user_id);
  const isUnavailable = ["completed", "cancelled", "assigned"].includes(task.status);

  let buttonText = "Request Task";
  let buttonDisabled = false;
  let buttonClass = "request-btn";

  if (isOwnTask) {
    buttonText = "Your Task";
    buttonDisabled = true;
    buttonClass = "request-btn disabled";
  } else if (hasRequested) {
    buttonText = "Requested";
    buttonDisabled = true;
    buttonClass = "request-btn requested";
  } else if (isUnavailable) {
    buttonText = "Unavailable";
    buttonDisabled = true;
    buttonClass = "request-btn unavailable";
  }

  return (
    <div className="task-card">
      <div className="task-image-wrapper">
        {task.picture ? (
          <img src={task.picture} alt="task" className="task-image" />
        ) : (
          <div className="task-image-placeholder"><span>📷 No image provided</span></div>
        )}
      </div>
      <div className="badges-container">
        <div className="tag">{task.category || "General"}</div>
        {editable && task.status && (
          <div className={`status-badge status-${task.status.toLowerCase()}`}>{task.status}</div>
        )}
      </div>
      <div className="card-content">
        <h3>{task.title}</h3>
        <p className="task-description">{task.description?.trim() || "No description provided"}</p>
        {task.location && <p className="task-location"><span className="icon">📍</span> {task.location}</p>}
        {task.start_time && (
          <p className="task-date"><span className="icon">🟢</span> Start: {new Date(task.start_time).toLocaleDateString()} • {new Date(task.start_time).toLocaleTimeString()}</p>
        )}
        {task.end_time && (
          <p className="task-date end-date"><span className="icon">🔴</span> End: {new Date(task.end_time).toLocaleDateString()} • {new Date(task.end_time).toLocaleTimeString()}</p>
        )}
        <div className="task-footer">
          <div className="task-author">
            <div className="author-avatar">{(task.user_id?.first_name || "U").charAt(0).toUpperCase()}</div>
            <div className="author-name">
              <span>{task.user_id?.first_name || "User"}</span>
              {task.user_id?.last_name && <span> {task.user_id.last_name}</span>}
            </div>
          </div>
          {editable && <button className="edit-btn" onClick={() => onEdit(task)}>✏️ Edit Task</button>}
          {!editable && onRequestTask && (
            <button className={buttonClass} onClick={() => !buttonDisabled && onRequestTask(task)} disabled={buttonDisabled}>{buttonText}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
