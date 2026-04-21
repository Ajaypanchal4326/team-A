import React from "react";
import { Upload } from "lucide-react";
import { CATEGORIES } from "../../constants/categories";

const AddTaskView = ({ newTask, setNewTask, onImageChange, onDragOver, onDrop, onRemoveImage, onAddTask }) => {
  return (
    <div className="add-task-container">
      <div className="add-task-form">
        <h2>Add Task</h2>
        <div className="form-group">
          <label>Task Title <span className="required">*</span></label>
          <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Task Description</label>
          <textarea placeholder="Describe the task you need help with" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows="4" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <div className="select-wrapper">
              <select value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })} required>
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Location <span className="required">*</span></label>
            <input type="text" placeholder="City, State" value={newTask.location} onChange={(e) => setNewTask({ ...newTask, location: e.target.value })} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date <span className="required">*</span></label>
            <input type="date" value={newTask.startDate} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>End Date <span className="required">*</span></label>
            <input type="date" value={newTask.endDate} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>Task Image</label>
          {newTask.imagePreview ? (
            <div className="image-preview-container">
              <img src={newTask.imagePreview} alt="Preview" className="image-preview" />
              <button type="button" className="btn-remove-image" onClick={onRemoveImage}>Remove Image</button>
            </div>
          ) : (
            <div className="file-upload" onDragOver={onDragOver} onDrop={onDrop}>
              <input type="file" id="task-image" accept="image/*" onChange={onImageChange} />
              <label htmlFor="task-image" className="file-upload-label">
                <span><Upload /></span>Upload a file or drag and drop
                <span>PNG, JPG, GIF up to 10MB</span>
              </label>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn-submit" onClick={onAddTask}>Add Task</button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskView;
