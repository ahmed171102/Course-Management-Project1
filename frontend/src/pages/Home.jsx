import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section>
      <h1>Course Management System</h1>
      <p style={{ fontSize: "18px", marginBottom: "24px" }}>
        Welcome to your course management platform. Manage instructors, students, and course enrollments all in one place.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "32px"
      }}>
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ marginTop: 0 }}>📚 View Courses</h3>
          <p>Browse all available courses, see enrollment numbers, and instructor details.</p>
          <Link to="/courses" className="btn">Go to Courses</Link>
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ marginTop: 0 }}>➕ Create Course</h3>
          <p>Add a new course to the system with an assigned instructor and credit hours.</p>
          <Link to="/courses/new" className="btn">Create Course</Link>
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ marginTop: 0 }}>🔐 Authentication</h3>
          <p>Log in to access your account. Roles (Admin, Instructor, User) are enforced by the backend.</p>
          <div className="flex wrap">
            <Link to="/login" className="btn secondary">Login</Link>
            <Link to="/register" className="btn">Register</Link>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: "48px",
        padding: "24px",
        background: "var(--accent-bg)",
        borderRadius: "8px",
        border: "1px solid var(--accent-border)"
      }}>
        <h3 style={{ color: "var(--accent)", marginTop: 0 }}>🛠️ Tech Stack</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li><strong>Frontend:</strong> React with Vite and React Router</li>
          <li><strong>Backend:</strong> ASP.NET Core with Entity Framework</li>
          <li><strong>Database:</strong> PostgreSQL</li>
          <li><strong>API Client:</strong> Axios for HTTP requests</li>
          <li><strong>Authentication:</strong> JWT with role-based access control</li>
        </ul>
      </div>
    </section>
  );
}