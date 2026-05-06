import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getCourses } from "../services/coursesService";
import { getStudents } from "../services/studentsService";
import { getInstructors } from "../services/instructorsService";
import { getEnrollments } from "../services/enrollmentsService";
import "./Dashboard.css";

export default function AdminDashboard() {
  const { username } = getCurrentUser();

  const [stats, setStats] = useState({ courses: 0, students: 0, instructors: 0, enrollments: 0 });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [courses, students, instructors, enrollments] = await Promise.all([
          getCourses().catch(() => []),
          getStudents().catch(() => []),
          getInstructors().catch(() => []),
          getEnrollments().catch(() => []),
        ]);

        setStats({
          courses: courses.length,
          students: students.length,
          instructors: instructors.length,
          enrollments: enrollments.length,
        });

        setRecentCourses(courses.slice(0, 5));
        setRecentStudents(students.slice(0, 5));
      } catch {
        // fail silently, stats stay at 0
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
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{username}</strong>. Here's your system overview.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link to="/courses/new" className="btn btn-primary" id="admin-create-course">+ New Course</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: "3px solid var(--primary)" }}>
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : stats.courses}</span>
            <span className="stat-label">Courses</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--success)" }}>
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : stats.students}</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--info)" }}>
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : stats.instructors}</span>
            <span className="stat-label">Instructors</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--warning)" }}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{loading ? "—" : stats.enrollments}</span>
            <span className="stat-label">Enrollments</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Courses</h3>
            <Link to="/courses" className="btn btn-ghost">View All →</Link>
          </div>
          {loading ? (
            <div className="text-center mt-md"><div className="spinner" style={{margin:'0 auto'}}></div></div>
          ) : recentCourses.length === 0 ? (
            <p className="empty-text">No courses yet. Create your first course!</p>
          ) : (
            <div className="data-list">
              {recentCourses.map((c) => (
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

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Students</h3>
          </div>
          {loading ? (
            <div className="text-center mt-md"><div className="spinner" style={{margin:'0 auto'}}></div></div>
          ) : recentStudents.length === 0 ? (
            <p className="empty-text">No students registered yet.</p>
          ) : (
            <div className="data-list">
              {recentStudents.map((s) => (
                <div key={s.id} className="data-item">
                  <div className="data-item-title">{s.fullName}</div>
                  <div className="data-item-meta">
                    <span className="data-item-sub">{s.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section mt-lg">
        <h3 style={{marginBottom: 16}}>Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/courses/new" className="quick-action-card">
            <span className="qa-icon">➕</span>
            <span className="qa-label">Create Course</span>
          </Link>
          <Link to="/courses" className="quick-action-card">
            <span className="qa-icon">📚</span>
            <span className="qa-label">Manage Courses</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
