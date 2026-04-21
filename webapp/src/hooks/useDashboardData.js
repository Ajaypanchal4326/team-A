import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const AUTH_SESSION_KEY = "helper_auth_session";

const initialTaskForm = {
  title: "",
  description: "",
  category: "",
  location: "",
  startDate: "",
  endDate: "",
  image: null,
  imagePreview: null,
};

const useDashboardData = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePage, setActivePage] = useState("Feed");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [user, setUser] = useState({ username: "", email: "" });

  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTaskForRequest, setSelectedTaskForRequest] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [newTask, setNewTask] = useState(initialTaskForm);

  useEffect(() => {
    if (location.state?.openPage) {
      setActivePage(location.state.openPage);
    }
  }, [location.state]);

  const pendingCount = receivedRequests.filter((r) => r.status === "pending").length;

  const handleLogout = async () => {
    if (logoutLoading) return;
    try {
      setLogoutLoading(true);
      await api.post("/auth/logout");
      localStorage.removeItem(AUTH_SESSION_KEY);
      toast.success("Logged out successfully");
      setTimeout(() => navigate("/login"), 700);
    } catch {
      toast.error("Logout failed");
      console.error("Logout failed");
    } finally {
      setLogoutLoading(false);
    }
  };

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
      const fixed = data.map((r) => ({
        ...r,
        taskId: r.task_id?._id || r.taskId,
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
        picture: u.profile_picture || u.picture || "",
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
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.task) {
        setTasks((prev) => [res.data.task, ...prev]);
      }

      setNewTask(initialTaskForm);
      setActivePage("My Tasks");
      toast.success("Task added successfully");
      await loadAll();
    } catch (err) {
      toast.error("Task creation failed");
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
      toast.success("Task request sent successfully");
      await loadFeed();
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
      toast.success("Request accepted");
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
    return list.filter((t) => t.title?.toLowerCase().includes(searchTerm.toLowerCase().trim()));
  };

  const isTaskActiveForFeed = (task) => {
    if (!task?.end_time) return true;
    const endDate = new Date(task.end_time);
    if (Number.isNaN(endDate.getTime())) return true;
    return endDate.getTime() >= Date.now();
  };

  const filteredFeedTasks = filteredTasks(tasks).filter(isTaskActiveForFeed);
  const filteredMyTasks = filteredTasks(myTasks);
  const filteredReceivedRequests = (receivedRequests || []).filter((req) => {
    const title = req.task?.title || req.taskTitle || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });
  const filteredSentRequests = (sentRequests || []).filter((req) =>
    req.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTask((prev) => ({ ...prev, image: file, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTask((prev) => ({ ...prev, image: file, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      toast.warn("Please drop an image file");
    }
  };

  const handleRemoveImage = () => {
    setNewTask((prev) => ({ ...prev, image: null, imagePreview: null }));
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
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
      toast.success("Task updated successfully");
      await loadAll();
    } catch (err) {
      toast.error("Failed to update task");
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

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestMessage("");
    setSelectedTaskForRequest(null);
  };

  return {
    activePage,
    setActivePage,
    logoutLoading,
    showLogoutConfirm,
    setShowLogoutConfirm,
    showMenu,
    setShowMenu,
    notifications,
    showNotifications,
    setShowNotifications,
    searchTerm,
    setSearchTerm,
    user,
    tasks,
    myTasks,
    editingTask,
    setEditingTask,
    receivedRequests,
    sentRequests,
    loadingRequests,
    showRequestModal,
    setShowRequestModal,
    selectedTaskForRequest,
    setSelectedTaskForRequest,
    requestMessage,
    setRequestMessage,
    sendingRequest,
    globalLoading,
    actionLoading,
    newTask,
    setNewTask,
    pendingCount,
    filteredFeedTasks,
    filteredMyTasks,
    filteredReceivedRequests,
    filteredSentRequests,
    handleLogout,
    handleMarkNotificationsRead,
    handleSingleNotificationRead,
    handleAddTask,
    handleSendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleImageChange,
    handleDragOver,
    handleDrop,
    handleRemoveImage,
    handleUpdateTask,
    openRequestModal,
    closeRequestModal,
    loadUserProfile,
  };
};

export default useDashboardData;






