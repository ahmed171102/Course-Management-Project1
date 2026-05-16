import { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../services/usersService";
import { register, getUsername } from "../services/authService";
import ConfirmModal from "../components/ConfirmModal";
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

  // Create user form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("Student");
  const [creating, setCreating] = useState(false);

  // Delete modal
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const currentUsername = getUsername();

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

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await register(createUsername, createEmail, createPassword, createRole);
      toast.success(`User "${createUsername}" created successfully!`);
      setCreateUsername("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("Student");
      setShowCreateForm(false);
      await load();
    } catch (err) {
      const msg = err?.response?.data;
      toast.error(typeof msg === "string" ? msg : "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  function promptDeleteUser(u) {
    setModalConfig({
      isOpen: true,
      title: "Delete User",
      message: `Are you sure you want to permanently delete "${u.username}"? This action cannot be undone.`,
      onConfirm: async () => {
        setModalConfig({ ...modalConfig, isOpen: false });
        await executeDeleteUser(u.id);
      }
    });
  }

  async function executeDeleteUser(id) {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully.");
      await load();
    } catch (err) {
      const msg = err?.response?.data;
      toast.error(typeof msg === "string" ? msg : "Failed to delete user.");
    }
  }

  return (
    <section className="dashboard animate-slide" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1>System Users</h1>
          <p className="dashboard-subtitle">Manage system accounts and credentials</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "+ Create User"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={load}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="form-card card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Create New User</h3>
          <form onSubmit={handleCreateUser} style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
              <label>Username</label>
              <input type="text" value={createUsername} onChange={e => setCreateUsername(e.target.value)} required minLength={3} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
              <label>Email</label>
              <input type="email" value={createEmail} onChange={e => setCreateEmail(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
              <label>Password</label>
              <input type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} required minLength={6} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 130 }}>
              <label>Role</label>
              <select value={createRole} onChange={e => setCreateRole(e.target.value)} required>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} style={{ height: 42 }}>
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        </div>
      )}

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
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }} onClick={() => handleEditClick(u)}>
                        Edit
                      </button>
                      {u.username !== currentUsername && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: "6px 12px", fontSize: "0.85rem", color: "var(--danger)", borderColor: "var(--danger-bg)" }} 
                          onClick={() => promptDeleteUser(u)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
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

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        confirmText="Yes, Delete"
        isDanger={true}
      />
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
