import { useState } from "react";
import { getCurrentUser, changePassword } from "../services/authService";
import toast from "react-hot-toast";
import "./FormPages.css";

export default function Profile() {
  const user = getCurrentUser();
  const role = (user.role || "User").toUpperCase();
  const initial = (user.username || "U")[0].toUpperCase();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.response?.data || "Failed to change password.");
    } finally {
      setChanging(false);
    }
  }

  return (
    <section className="form-page animate-slide" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="form-card card" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <div 
          style={{ 
            width: 80, 
            height: 80, 
            borderRadius: "50%", 
            background: "var(--primary)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "2rem", 
            fontWeight: "bold",
            margin: "0 auto 24px",
            boxShadow: "var(--shadow-md)"
          }}
        >
          {initial}
        </div>
        
        <h2 style={{ marginBottom: 8, color: "var(--text-primary)" }}>{user.username}</h2>
        
        <span 
          className={`badge`} 
          style={{ 
            display: "inline-block", 
            marginBottom: 32,
            background: "var(--primary-bg)",
            color: "var(--primary-light)",
            border: "1px solid var(--primary-border)"
          }}
        >
          {role}
        </span>

        <div style={{ textAlign: "left", background: "var(--bg-input)", padding: 20, borderRadius: "var(--radius-md)" }}>
          <h4 style={{ marginBottom: 16, color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Account Details</h4>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-muted)" }}>Username</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{user.username}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-muted)" }}>Access Level</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{role}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Status</span>
            <span style={{ color: "var(--success)", fontWeight: 500 }}>Active</span>
          </div>
        </div>

      </div>

      <div className="form-card card" style={{ maxWidth: 500, margin: "24px auto 0" }}>
        <h3 style={{ marginBottom: 20 }}>Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={changing} style={{ width: "100%" }}>
            {changing ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </section>
  );
}
