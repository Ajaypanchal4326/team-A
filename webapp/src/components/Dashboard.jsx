import React from "react";
import "../styles/dashboard.css";
import Loader from "./Loader";
import useDashboardData from "../hooks/useDashboardData";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import DashboardTopbar from "./dashboard/DashboardTopbar";
import DashboardMainContent from "./dashboard/DashboardMainContent";
import DashboardModals from "./dashboard/DashboardModals";

const Dashboard = () => {
  const {
    activePage,
    setActivePage,
    showMenu,
    setShowMenu,
    showLogoutConfirm,
    setShowLogoutConfirm,
    notifications,
    showNotifications,
    setShowNotifications,
    searchTerm,
    setSearchTerm,
    user,
    editingTask,
    setEditingTask,
    sentRequests,
    loadingRequests,
    showRequestModal,
    selectedTaskForRequest,
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
  } = useDashboardData();

  return (
    <>
      {globalLoading && <Loader />}
      <div className="dashboard-layout">
        <DashboardSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          pendingCount={pendingCount}
          user={user}
          onLogoutClick={() => setShowLogoutConfirm(true)}
        />

        <div className="dashboard-right">
          <DashboardTopbar
            activePage={activePage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            onReadAll={handleMarkNotificationsRead}
            onReadOne={handleSingleNotificationRead}
            onOpenMenu={() => setShowMenu(true)}
          />

          <DashboardMainContent
            activePage={activePage}
            user={user}
            sentRequests={sentRequests}
            filteredFeedTasks={filteredFeedTasks}
            filteredMyTasks={filteredMyTasks}
            filteredReceivedRequests={filteredReceivedRequests}
            filteredSentRequests={filteredSentRequests}
            newTask={newTask}
            setNewTask={setNewTask}
            handleImageChange={handleImageChange}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleRemoveImage={handleRemoveImage}
            handleAddTask={handleAddTask}
            setActivePage={setActivePage}
            setEditingTask={setEditingTask}
            loadingRequests={loadingRequests}
            actionLoading={actionLoading}
            handleAcceptRequest={handleAcceptRequest}
            handleRejectRequest={handleRejectRequest}
            loadUserProfile={loadUserProfile}
            openRequestModal={openRequestModal}
          />

          <DashboardModals
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            onUpdateTask={handleUpdateTask}
            showRequestModal={showRequestModal}
            selectedTaskForRequest={selectedTaskForRequest}
            requestMessage={requestMessage}
            setRequestMessage={setRequestMessage}
            sendingRequest={sendingRequest}
            onSendRequest={handleSendRequest}
            onCloseRequestModal={closeRequestModal}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            setActivePage={setActivePage}
            setShowLogoutConfirm={setShowLogoutConfirm}
            showLogoutConfirm={showLogoutConfirm}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
