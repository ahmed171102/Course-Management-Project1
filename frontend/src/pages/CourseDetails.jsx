import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteCourse,
  getCourseById,
  updateCourse,
} from "../services/coursesService";

export default function CourseDetails() {
  const { id } = useParams();  
  const navigate = useNavigate();

  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [course, setCourse] = useState(null);

  
  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState(1);
  const [instructorId, setInstructorId] = useState(1);

  
  async function load() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getCourseById(id);
      setCourse(data);
      setTitle(data.title);
      setCredits(data.credits);
      setInstructorId(data.instructorId);
    } catch (err) {
      setError(err?.response?.data || err.message || "Failed to load course.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  
  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateCourse(id, {
        title,
        credits: Number(credits),
        instructorId: Number(instructorId),
      });

      setMessage("Updated successfully.");
      await load();  
    } catch (err) {
      setError(err?.response?.data || err.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  
  async function handleDelete() {
    const ok = confirm("Delete this course?");  
    if (!ok) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await deleteCourse(id);
      navigate("/courses");  
    } catch (err) {
      setError(err?.response?.data || err.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "crimson" }}>{String(error)}</p>;
  if (!course) return <p>Not found.</p>;

  return (
    <section>
      <h2>Course #{course.id}</h2>
      <p>
        <strong>Instructor Name:</strong> {course.instructorName}
      </p>

      <h3>Edit</h3>
      <form onSubmit={handleUpdate} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Credits (1-6)</label>
          <input
            required
            type="number"
            min={1}
            max={6}
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>InstructorId</label>
          <input
            required
            type="number"
            min={1}
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        style={{ marginTop: 12, background: "crimson", color: "white" }}
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
    </section>
  );
}