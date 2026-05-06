import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getCourses } from "../services/coursesService";
import { getEnrollments } from "../services/enrollmentsService";
import "./Dashboard.css";

export default function InstructorDashboard() {
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

  const totalStudents = new Set(enrollments.map(e => e.studentId)).size;

  return (
    <section className="dashboard animate-slide">
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{username}</strong>. Manage your courses and students.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: "3px solid var(--info)" }}>
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : courses.length}</span>
            <span className="stat-label">Total Courses</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--success)" }}>
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : totalStudents}</span>
            <span className="stat-label">Enrolled Students</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--warning)" }}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : enrollments.length}</span>
            <span className="stat-label">Total Enrollments</span>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>All Courses</h3>
          <Link to="/courses" className="btn btn-ghost">View All →</Link>
        </div>
        {loading ? (
          <div className="text-center mt-md"><div className="spinner" style={{margin:'0 auto'}}></div></div>
        ) : courses.length === 0 ? (
          <p className="empty-text">No courses available yet.</p>
        ) : (
          <div className="data-list">
            {courses.map((c) => (
              <Link to={`/courses/${c.id}`} key={c.id} className="data-item">
                <div className="data-item-title">{c.title}</div>
                <div className="data-item-meta">
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
            <span className="qa-icon">📚</span>
            <span className="qa-label">Browse Courses</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
