import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, logout, getUserRole } from "../services/authService";
import "./NavigationBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { username } = getCurrentUser();
  const role = (getUserRole() || "").toLowerCase();

  const dashboardPath = role === "admin" ? "/admin" : role === "instructor" ? "/instructor" : "/student";

  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check initial state from body class
    setIsLightMode(document.body.classList.contains("light-mode"));
  }, []);

  function toggleTheme() {
    if (isLightMode) {
      document.body.classList.remove("light-mode");
      setIsLightMode(false);
    } else {
      document.body.classList.add("light-mode");
      setIsLightMode(true);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar" id="main-nav">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">CourseMS</span>
        </div>

        <div className="navbar-links">
          <NavLink to={dashboardPath} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Dashboard
          </NavLink>
          <NavLink to="/courses" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Courses
          </NavLink>
          {role === "admin" && (
            <>
              <NavLink to="/instructors" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Instructors
              </NavLink>
              <NavLink to="/courses/new" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Add Course
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-user">
          <button 
            type="button" 
            className="btn-icon theme-toggle" 
            onClick={toggleTheme} 
            title="Toggle Theme"
            style={{ 
              background: "transparent", 
              border: "none", 
              fontSize: "1.2rem", 
              cursor: "pointer", 
              padding: "8px", 
              color: "var(--text-primary)",
              marginRight: "8px"
            }}
          >
            {isLightMode ? "🌙" : "☀️"}
          </button>
          <div className="user-badge">
            <span className="user-avatar">{(username || "U")[0].toUpperCase()}</span>
            <span className="user-name">{username}</span>
            <span className={`role-tag role-${role}`}>{role}</span>
          </div>
          <button type="button" className="btn-ghost logout-btn" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}