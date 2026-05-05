import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../services/coursesService";

export default function CourseCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState(3);
  const [instructorId, setInstructorId] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      navigate(`/courses/${created.id}`); 
      
    } catch (err) {
      setError(err?.response?.data || err.message || "Create failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Add Course</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
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

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{String(error)}</p>}
    </section>
  );
}