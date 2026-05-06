import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../services/coursesService";
import { getUserRole } from "../services/authService";
import "./CoursesList.css";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const role = (getUserRole() || "").toLowerCase();

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

  useEffect(() => { load(); }, []);

  // Filter courses by search term
  const filtered = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.instructor?.name?.toLowerCase().includes(q) ||
      String(c.credits).includes(q)
    );
  });

  return (
    <section className="courses-page animate-slide">
      <div className="courses-header">
        <div>
          <h1>Courses</h1>
          <p className="courses-subtitle">Browse all available courses in the system</p>
        </div>
        <div className="courses-header-actions">
          {role === "admin" && (
            <Link to="/courses/new" className="btn btn-primary" id="courses-add-btn">+ New Course</Link>
          )}
          <button type="button" className="btn btn-secondary" onClick={load} id="courses-refresh-btn">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="courses-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by course title, instructor name, or credits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            id="courses-search"
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {String(error)}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="empty-state-card">
          <div className="empty-icon">📚</div>
          <h3>No Courses Yet</h3>
          <p>Create your first course to get started</p>
          {role === "admin" && (
            <Link to="/courses/new" className="btn btn-primary">Create Course</Link>
          )}
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <>
          <p className="courses-count">
            {search ? (
              <>Showing <strong>{filtered.length}</strong> of {courses.length} course{courses.length !== 1 ? "s" : ""}</>
            ) : (
              <>Showing <strong>{courses.length}</strong> course{courses.length !== 1 ? "s" : ""}</>
            )}
          </p>

          {filtered.length === 0 && (
            <div className="empty-state-card" style={{ marginTop: 20 }}>
              <div className="empty-icon">🔍</div>
              <h3>No Results</h3>
              <p>No courses match "{search}". Try a different search term.</p>
              <button type="button" className="btn btn-secondary" onClick={() => setSearch("")}>
                Clear Search
              </button>
            </div>
          )}

          <ul className="courses-grid">
            {filtered.map((c) => (
              <li key={c.id} className="course-card">
                <div className="course-card-top">
                  <h3 className="course-title">
                    <Link to={`/courses/${c.id}`}>{c.title}</Link>
                  </h3>
                  <span className="badge badge-primary">{c.credits} Credits</span>
                </div>
                <div className="course-meta-info">
                  {c.instructor && (
                    <div className="meta-row">
                      <span className="meta-label">Instructor</span>
                      <span className="meta-value">{c.instructor.name}</span>
                    </div>
                  )}
                  {c.instructorName && !c.instructor && (
                    <div className="meta-row">
                      <span className="meta-label">Instructor</span>
                      <span className="meta-value">{c.instructorName}</span>
                    </div>
                  )}
                </div>
                {(() => {
                  const count = c.enrollmentCount ?? c.enrollments?.length ?? 0;
                  return (
                    <div className="course-enrollment-badge">
                      👥 {count} student{count !== 1 ? "s" : ""}
                    </div>
                  );
                })()}
                <Link to={`/courses/${c.id}`} className="course-view-link" id={`course-view-${c.id}`}>
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