import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getUserRole } from "../services/authService";
import "./NavigationBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { username } = getCurrentUser();
  const role = (getUserRole() || "").toLowerCase();

  const dashboardPath = role === "admin" ? "/admin" : role === "instructor" ? "/instructor" : "/student";

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
            <NavLink to="/courses/new" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Add Course
            </NavLink>
          )}
        </div>

        <div className="navbar-user">
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