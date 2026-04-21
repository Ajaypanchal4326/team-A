import React from "react";
import { CATEGORIES } from "../../constants/categories";

const EditTaskModal = ({ editingTask, setEditingTask, onUpdateTask }) => {
  if (!editingTask) return null;

  return (
    <div className="modal-overlay">
      <div className="modal edit-modal">
        <h2>Edit Task</h2>
        <label>Title <span className="required">*</span></label>
        <input type="text" value={editingTask.title || ""} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} />

        <div className="form-group">
          <label>Category <span className="required">*</span></label>
          <div className="select-wrapper">
            <select value={editingTask.category || ""} onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })} required>
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

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
          <button onClick={onUpdateTask}>Update</button>
          <button onClick={() => setEditingTask(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
