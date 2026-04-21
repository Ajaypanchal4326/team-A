import React from "react";
import TaskCard from "../TaskCard";

const FeedView = ({ tasks, user, sentRequests, onRequestTask }) => {
  return (
    <div className="feed">
      {tasks.length === 0 ? (
        <div className="empty-state-feed">
          <h3>No tasks available right now</h3>
          <p>Be the first to add a task or check back later.</p>
        </div>
      ) : (
        tasks.map((task, index) => (
          <TaskCard
            key={task._id || task.id || index}
            task={task}
            currentUserId={user._id}
            sentRequests={sentRequests}
            onRequestTask={onRequestTask}
          />
        ))
      )}
    </div>
  );
};

export default FeedView;
