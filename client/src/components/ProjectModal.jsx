import { useState } from "react";
import api from "../api/axios";

export default function ProjectModal({
  project,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "active",
    priority: project?.priority || "medium",
    deadline: project?.deadline
      ? project.deadline.split("T")[0]
      : "",
    color: project?.color || "#6C63FF",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Preset Colors
  const colors = [
    "#6C63FF",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#3B82F6",
    "#EC4899",
    "#8B5CF6",
    "#14B8A6",
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return setError("Project name is required");
    }

    try {
      setLoading(true);
      setError("");

      if (project?._id) {
        await api.put(`/projects/${project._id}`, formData);
      } else {
        await api.post("/projects", formData);
      }

      onSave();
    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.message ||
          "Failed to create project"
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
          maxWidth: 500,
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
          {project ? "Edit Project" : "Create New Project"}
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
          {/* Project Name */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Project Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
                outline: "none",
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
              placeholder="Enter description"
              rows={4}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
                resize: "none",
                outline: "none",
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
                outline: "none",
              }}
            >
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
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
                outline: "none",
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              Deadline
            </label>

            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          {/* Project Colors */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              Project Color
            </label>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {colors.map((c) => (
                <div
                  key={c}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      color: c,
                    }))
                  }
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
                    transition: "0.2s",
                    border:
                      formData.color === c
                        ? "3px solid white"
                        : "2px solid transparent",
                    transform:
                      formData.color === c
                        ? "scale(1.1)"
                        : "scale(1)",
                  }}
                />
              ))}
            </div>
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
                background: formData.color,
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {loading
                ? "Saving..."
                : project
                ? "Update Project"
                : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}