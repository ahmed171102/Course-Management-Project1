import { useEffect, useState } from "react";
import { getUsers, updateUser } from "../services/usersService";
import toast from "react-hot-toast";
import "./FormPages.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err?.response?.data || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleEditClick(u) {
    setEditingUser(u);
    setNewUsername(u.username);
    setNewPassword(""); // keep empty unless changing
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateUser(editingUser.id, {
        username: newUsername,
        password: newPassword || null
      });
      toast.success(`User ${newUsername} updated successfully!`);
      setEditingUser(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard animate-slide" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1>System Users</h1>
          <p className="dashboard-subtitle">Manage system accounts and credentials</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={load}>
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {String(error)}
        </div>
      )}

      {!loading && !error && (
        <div className="form-card card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "rgba(0,0,0,0.2)" }}>
              <tr>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={tdStyle}><strong>{u.username}</strong></td>
                  <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{u.email || "—"}</td>
                  <td style={tdStyle}><span className={`role-tag role-${(u.role || "").toLowerCase()}`}>{u.role}</span></td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }} onClick={() => handleEditClick(u)}>
                      Edit Credentials
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide" style={{ width: 400 }}>
            <h3 className="modal-title" style={{ marginBottom: 16 }}>Edit User</h3>
            <form onSubmit={handleUpdateUser} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Username</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={e => setNewUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>New Password <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "normal" }}>(leave blank to keep current)</span></label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                />
              </div>
              <div className="modal-actions" style={{ marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "16px",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--text-muted)",
  fontWeight: 600,
};

const tdStyle = {
  padding: "16px",
  fontSize: "14px",
  color: "var(--text-primary)",
};
