import React from "react";
import Settings from "../Settings/Settings";
import FeedView from "./FeedView";
import AddTaskView from "./AddTaskView";
import MyTasksView from "./MyTasksView";
import RequestsView from "./RequestsView";
import MyRequestsView from "./MyRequestsView";

const DashboardMainContent = ({
  activePage,
  user,
  sentRequests,
  filteredFeedTasks,
  filteredMyTasks,
  filteredReceivedRequests,
  filteredSentRequests,
  newTask,
  setNewTask,
  handleImageChange,
  handleDragOver,
  handleDrop,
  handleRemoveImage,
  handleAddTask,
  setActivePage,
  setEditingTask,
  loadingRequests,
  actionLoading,
  handleAcceptRequest,
  handleRejectRequest,
  loadUserProfile,
  openRequestModal,
}) => {
  return (
    <main className="main">
      {activePage === "Feed" && (
        <FeedView tasks={filteredFeedTasks} user={user} sentRequests={sentRequests} onRequestTask={openRequestModal} />
      )}

      {activePage === "Add Task" && (
        <AddTaskView
          newTask={newTask}
          setNewTask={setNewTask}
          onImageChange={handleImageChange}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onRemoveImage={handleRemoveImage}
          onAddTask={handleAddTask}
        />
      )}

      {activePage === "Settings" && <Settings user={user} reloadUser={loadUserProfile} />}

      {activePage === "My Tasks" && (
        <MyTasksView tasks={filteredMyTasks} onCreateNew={() => setActivePage("Add Task")} onEditTask={setEditingTask} />
      )}

      {activePage === "Requests" && (
        <RequestsView
          loadingRequests={loadingRequests}
          requests={filteredReceivedRequests}
          actionLoading={actionLoading}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
        />
      )}

      {activePage === "My Requests" && (
        <MyRequestsView loadingRequests={loadingRequests} requests={filteredSentRequests} />
      )}
    </main>
  );
};

export default DashboardMainContent;
