import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";
import "./NavigationBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { token } = getCurrentUser();
  const isAuthenticated = Boolean(token);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/courses/new">Add Course</Link>
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {!isAuthenticated && <Link to="/register">Register</Link>}
      </div>

      <div className="navbar-actions">
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}