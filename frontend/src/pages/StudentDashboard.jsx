import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getCourses } from "../services/coursesService";
import { getEnrollments } from "../services/enrollmentsService";
import "./Dashboard.css";

export default function StudentDashboard() {
  const { username } = getCurrentUser();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allCourses, allEnrollments] = await Promise.all([
          getCourses().catch(() => []),
          getEnrollments().catch(() => []),
        ]);
        setCourses(allCourses);
        setEnrollments(allEnrollments);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <section className="dashboard animate-slide">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{username}</strong>. Explore and enroll in courses.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: "3px solid var(--success)" }}>
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : courses.length}</span>
            <span className="stat-label">Available Courses</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--info)" }}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : enrollments.length}</span>
            <span className="stat-label">Total Enrollments</span>
          </div>
        </div>
      </div>

      {/* Available Courses */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Available Courses</h3>
          <Link to="/courses" className="btn btn-ghost">View All →</Link>
        </div>
        {loading ? (
          <div className="text-center mt-md"><div className="spinner" style={{margin:'0 auto'}}></div></div>
        ) : courses.length === 0 ? (
          <p className="empty-text">No courses available yet. Check back later!</p>
        ) : (
          <div className="courses-dashboard-grid">
            {courses.slice(0, 6).map((c) => (
              <Link to={`/courses/${c.id}`} key={c.id} className="course-dash-card card">
                <h4>{c.title}</h4>
                <div className="data-item-meta" style={{marginTop: 8}}>
                  <span className="badge badge-primary">{c.credits} credits</span>
                  {c.instructor && <span className="data-item-sub">by {c.instructor.name}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section mt-lg">
        <h3 style={{marginBottom: 16}}>Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/courses" className="quick-action-card">
            <span className="qa-icon">🔍</span>
            <span className="qa-label">Browse Courses</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
