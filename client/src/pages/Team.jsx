import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">
            Manage all workspace users
          </p>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div className="loading-spinner" />
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">
            No users found
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {users.map((user) => (
            <div
              key={user._id}
              className="card"
              style={{
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=6C63FF&color=fff`
                  }
                  alt={user.name}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                  }}
                />

                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {user.name}
                  </div>

                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: 13,
                    }}
                  >
                    {user.email}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    background:
                      user.role === "admin"
                        ? "#6C63FF"
                        : "#374151",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {user.role}
                </span>

                <span
                  style={{
                    color: "#9ca3af",
                    fontSize: 12,
                  }}
                >
                  Joined
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}