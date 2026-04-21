import React from "react";
import EditTaskModal from "./EditTaskModal";
import RequestTaskModal from "./RequestTaskModal";
import MobileMenu from "./MobileMenu";
import LogoutConfirmModal from "./LogoutConfirmModal";

const DashboardModals = ({
  editingTask,
  setEditingTask,
  onUpdateTask,
  showRequestModal,
  selectedTaskForRequest,
  requestMessage,
  setRequestMessage,
  sendingRequest,
  onSendRequest,
  onCloseRequestModal,
  showMenu,
  setShowMenu,
  setActivePage,
  setShowLogoutConfirm,
  showLogoutConfirm,
  onLogout,
}) => {
  return (
    <>
      <EditTaskModal editingTask={editingTask} setEditingTask={setEditingTask} onUpdateTask={onUpdateTask} />

      <RequestTaskModal
        show={showRequestModal}
        selectedTask={selectedTaskForRequest}
        requestMessage={requestMessage}
        setRequestMessage={setRequestMessage}
        sendingRequest={sendingRequest}
        onSend={onSendRequest}
        onCancel={onCloseRequestModal}
      />

      <MobileMenu
        show={showMenu}
        setShowMenu={setShowMenu}
        setActivePage={setActivePage}
        onShowLogout={() => setShowLogoutConfirm(true)}
      />

      <LogoutConfirmModal
        show={showLogoutConfirm}
        onConfirm={onLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default DashboardModals;
