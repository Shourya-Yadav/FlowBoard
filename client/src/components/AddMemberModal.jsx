import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AddMemberModal({
  projectId,
  onClose,
  onSave,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      return setError("Please select a user");
    }

    try {
      setLoading(true);
      setError("");

      await api.post(`/projects/${projectId}/members`, {
        userId: selectedUser,
        role,
      });

      onSave();
    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.message ||
          "Failed to add member"
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
          maxWidth: 450,
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
            fontSize: 22,
            fontWeight: "bold",
          }}
        >
          Add Team Member
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

        <form onSubmit={handleSubmit} noValidate>
          {/* Select User */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
              }}
            >
              Select User
            </label>

            <select
              value={selectedUser}
              onChange={(e) =>
                setSelectedUser(e.target.value)
              }
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
              }}
            >
              <option value="">Choose user</option>

              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: 6,
              }}
            >
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #374151",
                background: "#1f2937",
                color: "white",
              }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
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
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}