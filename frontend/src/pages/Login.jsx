import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveAuthData } from "../services/authService";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);
      saveAuthData(result);
      toast.success(`Welcome back, ${result.username}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data;
      const errorMsg = typeof msg === "string" ? msg : err.message || "Login failed.";
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
            <div className="auth-logo">📚</div>
            <h1>Course Management System</h1>
            <p>
              A comprehensive platform for managing courses, instructors, students, and enrollments.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">🔐</span>
                <span>Role-based access control</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">📊</span>
                <span>Real-time dashboard</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">👥</span>
                <span>Enrollment management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit" disabled={loading} id="login-submit">
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" id="register-link">Create Account</Link>
            </p>
          </div>

          <div className="demo-credentials">
            <h4>Demo Accounts</h4>
            <div className="demo-grid">
              <button type="button" className="demo-card" onClick={() => { setUsername("admin"); setPassword("admin123"); }}>
                <span className="demo-role admin">Admin</span>
                <span className="demo-user">admin / admin123</span>
              </button>
              <button type="button" className="demo-card" onClick={() => { setUsername("instructor1"); setPassword("inst123"); }}>
                <span className="demo-role instructor">Instructor</span>
                <span className="demo-user">instructor1 / inst123</span>
              </button>
              <button type="button" className="demo-card" onClick={() => { setUsername("user1"); setPassword("user123"); }}>
                <span className="demo-role student">Student</span>
                <span className="demo-user">user1 / user123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}