import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, getCurrentUser } from "../services/authService";
import "./Dashboard.css";

function roleToTab(role) {
  const roleLower = String(role || "").trim().toLowerCase();
  if (roleLower === "admin") return "admin";
  if (roleLower === "instructor") return "instructor";
  // Backend seeds "User"; map it to the Student tab.
  if (roleLower === "user" || roleLower === "student") return "student";
  return "student";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userRole = getUserRole();
  const activeTab = roleToTab(userRole);

  useEffect(() => {
    if (!user?.token) {
      navigate("/login", { replace: true });
    }
  }, [navigate, user?.token]);

  return (
    <section className="dashboard-container">
      <div className="dashboard-header">
        <h1>Course Management Dashboard</h1>
        {user.username && (
          <p className="user-info">
            Logged in as <strong>{user.username}</strong> ({userRole})
          </p>
        )}
      </div>

      <div className="tabs-wrapper">
        <div className="tabs-content">
          {activeTab === "admin" && (
            <div className="tab-pane">
              <h2>🔧 Admin Dashboard</h2>
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>System Management</h3>
                  <p>Manage users, courses, and system settings</p>
                  <ul>
                    <li>View all users and courses</li>
                    <li>Manage enrollments</li>
                    <li>System settings and configuration</li>
                  </ul>
                </div>
                <div className="dashboard-card">
                  <h3>Analytics</h3>
                  <p>View system-wide analytics and reports</p>
                  <ul>
                    <li>Enrollment statistics</li>
                    <li>Course performance</li>
                    <li>User activity logs</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div className="tab-pane">
              <h2>📚 Instructor Dashboard</h2>
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>My Courses</h3>
                  <p>Manage courses you are teaching</p>
                  <ul>
                    <li>View your assigned courses</li>
                    <li>Manage student enrollments</li>
                    <li>Update course materials</li>
                  </ul>
                </div>
                <div className="dashboard-card">
                  <h3>Student Management</h3>
                  <p>Track student progress and engagement</p>
                  <ul>
                    <li>View enrolled students</li>
                    <li>Track assignments and grades</li>
                    <li>Send announcements</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "student" && (
            <div className="tab-pane">
              <h2>👨‍🎓 Student Dashboard</h2>
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>My Courses</h3>
                  <p>View your enrolled courses</p>
                  <ul>
                    <li>Browse your courses</li>
                    <li>View course materials</li>
                    <li>Check deadlines</li>
                  </ul>
                </div>
                <div className="dashboard-card">
                  <h3>My Progress</h3>
                  <p>Track your academic progress</p>
                  <ul>
                    <li>View grades and feedback</li>
                    <li>Assignment status</li>
                    <li>Course completion progress</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
