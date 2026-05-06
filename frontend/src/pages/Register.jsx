import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, saveAuthData } from "../services/authService";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("User");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await register(username, email, password, role);
      saveAuthData(result);
      toast.success(`Account created! Welcome, ${result.username}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data;
      const errorMsg = typeof msg === "string" ? msg : err.message || "Registration failed.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade">
        {/* Left — Branding */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <div className="auth-logo">🎓</div>
            <h1>Join the Platform</h1>
            <p>
              Create your account and start managing your academic journey.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">👨‍🎓</span>
                <span>Student: Browse & enroll in courses</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">📚</span>
                <span>Instructor: Manage your courses</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">🔧</span>
                <span>Admin: Full system control</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                minLength={3}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Account Type</label>
              <div className="role-selector">
                {[
                  { value: "User", label: "Student", icon: "👨‍🎓", desc: "Browse & enroll in courses" },
                  { value: "Instructor", label: "Instructor", icon: "📚", desc: "Teach & manage courses" },
                  { value: "Admin", label: "Admin", icon: "🔧", desc: "Full system access" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={`role-option ${role === r.value ? "selected" : ""}`}
                    onClick={() => setRole(r.value)}
                  >
                    <span className="role-option-icon">{r.icon}</span>
                    <span className="role-option-label">{r.label}</span>
                    <span className="role-option-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit" disabled={loading} id="register-submit">
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" id="login-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
