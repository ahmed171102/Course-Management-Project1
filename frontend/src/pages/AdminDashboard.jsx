import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getCourses } from "../services/coursesService";
import { getStudents } from "../services/studentsService";
import { getInstructors } from "../services/instructorsService";
import { getEnrollments } from "../services/enrollmentsService";
import toast from "react-hot-toast";
import "./Dashboard.css";

const gradients = [
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)"
];

function getGradient(id) {
  return gradients[id % gradients.length];
}

export default function AdminDashboard() {
  const { username } = getCurrentUser();

  const [stats, setStats] = useState({ courses: 0, students: 0, instructors: 0, enrollments: 0 });
  const [allCourses, setAllCourses] = useState([]);
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

        setAllCourses(courses);
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

  function handleExportCSV() {
    if (!allCourses || allCourses.length === 0) {
      toast.error("No course data available to export.");
      return;
    }

    const headers = ["Course ID", "Title", "Credits", "Instructor Name", "Enrollments"];
    const rows = allCourses.map(c => [
      c.id,
      `"${c.title}"`,
      c.credits,
      `"${c.instructor?.name || "None"}"`,
      c.enrollmentCount || 0
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `courses_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded successfully.");
  }

  // Chart Data Preparation
  const topCoursesChartData = [...allCourses]
    .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
    .slice(0, 5)
    .map(c => ({ name: c.title.substring(0, 15) + (c.title.length > 15 ? '...' : ''), students: c.enrollmentCount || 0 }));

  const creditDistribution = allCourses.reduce((acc, course) => {
    const cred = `${course.credits} Credits`;
    acc[cred] = (acc[cred] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(creditDistribution).map(key => ({
    name: key,
    value: creditDistribution[key]
  }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <section className="dashboard animate-slide">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{username}</strong>. Here's your system overview.
          </p>
        </div>
        <div className="dashboard-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>📥 Export Report</button>
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

      {/* Analytics Charts (Custom Built) */}
      {!loading && allCourses.length > 0 && (
        <div className="dashboard-content-grid" style={{ marginBottom: 32 }}>
          <div className="dashboard-section form-card card">
            <h3 style={{ marginBottom: 16 }}>Top Courses by Enrollment</h3>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topCoursesChartData.map((data, index) => {
                const maxStudents = Math.max(...topCoursesChartData.map(d => d.students), 1);
                const widthPercent = (data.students / maxStudents) * 100;
                
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ width: '120px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                      {data.name}
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-elevated)', height: '24px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ 
                        width: `${widthPercent}%`, 
                        height: '100%', 
                        background: 'var(--primary)',
                        transition: 'width 1s ease-out'
                      }}></div>
                      <span style={{ position: 'absolute', left: '8px', top: '2px', fontSize: '0.75rem', color: 'white', fontWeight: 'bold' }}>
                        {data.students}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section form-card card">
            <h3 style={{ marginBottom: 16 }}>Course Credits Distribution</h3>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pieData.map((data, index) => {
                const totalCourses = pieData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                const widthPercent = (data.value / totalCourses) * 100;
                const color = COLORS[index % COLORS.length];
                
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ width: '100px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {data.name}
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-elevated)', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${widthPercent}%`, 
                        height: '100%', 
                        background: color,
                        transition: 'width 1s ease-out'
                      }}></div>
                    </div>
                    <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      {data.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                <Link to={`/courses/${c.id}`} key={c.id} className="data-item" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 4px, width: '100%', background: getGradient(c.id) }}></div>
                  <div style={{ padding: '16px' }}>
                    <div className="data-item-title">{c.title}</div>
                    <div className="data-item-meta">
                      <span className="badge badge-primary">{c.credits} credits</span>
                      {c.instructor && <span className="data-item-sub">by {c.instructor.name}</span>}
                    </div>
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
