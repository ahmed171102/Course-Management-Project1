import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../services/coursesService";
import { getInstructors } from "../services/instructorsService";
import toast from "react-hot-toast";
import "./FormPages.css";

function toErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || "Request failed.";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    if (typeof data.message === "string") return data.message;
    if (typeof data.title === "string") return data.title;
    if (data.errors && typeof data.errors === "object") {
      return Object.entries(data.errors)
        .map(([field, messages]) => {
          const msgText = Array.isArray(messages) ? messages.join(", ") : String(messages);
          return `${field}: ${msgText}`;
        })
        .join("\n");
    }
    try { return JSON.stringify(data, null, 2); } catch { return "Request failed."; }
  }
  return String(data);
}

export default function CourseCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState(3);
  const [instructorId, setInstructorId] = useState("");
  const [instructors, setInstructors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInstructors() {
      try {
        const data = await getInstructors();
        setInstructors(data);
        if (data.length > 0) setInstructorId(data[0].id);
      } catch {
        // Instructors may be behind auth — user can type ID manually
      }
    }
    loadInstructors();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const created = await createCourse({
        title,
        credits: Number(credits),
        instructorId: Number(instructorId),
      });
      toast.success(`Course "${title}" created!`);
      navigate(`/courses/${created.id}`);
    } catch (err) {
      const msg = toErrorMessage(err);
      setError(msg);
      toast.error("Failed to create course.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-page animate-slide">
      <div className="form-page-header">
        <h1>Create Course</h1>
        <p>Add a new course to the system</p>
      </div>

      <div className="form-card card">
        <form onSubmit={handleSubmit} id="create-course-form">
          <div className="form-group">
            <label htmlFor="course-title">Course Title</label>
            <input
              id="course-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Web Engineering"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="course-credits">Credits (1-6)</label>
              <input
                id="course-credits"
                required
                type="number"
                min={1}
                max={6}
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="course-instructor">Instructor</label>
              {instructors.length > 0 ? (
                <select
                  id="course-instructor"
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  required
                >
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (ID: {i.id})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="course-instructor"
                  required
                  type="number"
                  min={1}
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  placeholder="Instructor ID"
                />
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ whiteSpace: "pre-wrap" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="create-course-submit">
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}