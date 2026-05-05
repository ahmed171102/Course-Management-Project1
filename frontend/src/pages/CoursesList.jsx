import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../services/coursesService";
import "./CoursesList.css";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);

    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError(err?.response?.data || err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="courses-container">
      <div className="courses-header">
        <h2>Available Courses</h2>
        <div className="courses-header-actions">
          <Link to="/courses/new" className="btn">
            + New Course
          </Link>
          <button type="button" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {String(error)}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="empty-state">
          <h3>No Courses Yet</h3>
          <p>Create your first course to get started</p>
          <Link to="/courses/new" className="btn">
            Create Course
          </Link>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <>
          <div style={{ marginBottom: "8px", color: "var(--text)", fontSize: "14px" }}>
            Found <strong>{courses.length}</strong> course{courses.length !== 1 ? "s" : ""}
          </div>
          <ul className="courses-grid">
            {courses.map((c) => (
              <li key={c.id} className="course-card">
                <h3 className="course-title">
                  <Link to={`/courses/${c.id}`}>{c.title}</Link>
                </h3>
                <div className="course-meta">
                  <span className="course-credits">{c.credits} Credits</span>
                  <div className="course-meta-item">
                    <span className="label">Instructor:</span>
                    <span>{c.instructorName}</span>
                  </div>
                </div>
                {c.enrollmentCount !== undefined && (
                  <div className="course-enrollment">
                    👥 {c.enrollmentCount} student{c.enrollmentCount !== 1 ? "s" : ""}
                  </div>
                )}
                <Link to={`/courses/${c.id}`} style={{ marginTop: "auto", fontSize: "14px" }}>
                  View Details →
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}