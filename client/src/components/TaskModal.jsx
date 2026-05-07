import { useState } from "react";
import api from "../api/axios";

export default function TaskModal({
  task,
  projectId,
  members = [],
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate
      ? task.dueDate.split("T")[0]
      : "",
    assignee: task?.assignee?._id || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return setError("Task title is required");
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...formData,
        project: projectId,
      };

      if (task?._id) {
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      onSave();
    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.message ||
          "Failed to save task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 550,
          background: "#111827",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #374151",
        }}
      >
        <h2
          style={{
            color: "white",
            marginBottom: 20,
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {task ? "Edit Task" : "Create New Task"}
        </h2>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fecaca",
              padding: 10,
              borderRadius: 8,
              marginBottom: 15,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Task Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={4}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
                resize: "none",
              }}
            />
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
              }}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Priority
            </label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Assignee */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Assign To
            </label>

            <select
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
              }}
            >
              <option value="">Unassigned</option>

              {members.map((member) => (
                <option
                  key={member.user?._id}
                  value={member.user?._id}
                >
                  {member.user?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Due Date
            </label>

            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
              }}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid #4b5563",
                background: "#1f2937",
                color: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: "#6C63FF",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {loading
                ? "Saving..."
                : task
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}