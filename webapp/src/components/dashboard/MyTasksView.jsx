import React from "react";
import TaskCard from "../TaskCard";

const MyTasksView = ({ tasks, onCreateNew, onEditTask }) => {
  return (
    <>
      <div className="my-tasks-header">
        <button className="add-task-btn" onClick={onCreateNew}>+ Add New Task</button>
      </div>
      <div className="feed my-tasks-section">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>You haven&apos;t created any tasks yet</h3>
            <p>Start by adding a new task and get help from others.</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard key={task._id || task.id || index} task={task} editable={true} onEdit={onEditTask} />
          ))
        )}
      </div>
    </>
  );
};

export default MyTasksView;
