import { useEffect, useState } from "react";
import { getInstructors, createInstructor, deleteInstructor } from "../services/instructorsService";
import toast from "react-hot-toast";
import "./CoursesList.css"; // Reuse the grid CSS

export default function InstructorsList() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getInstructors();
      setInstructors(data);
    } catch (err) {
      setError(err?.response?.data || "Failed to load instructors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await createInstructor({ name, email });
      toast.success("Instructor added successfully!");
      setName("");
      setEmail("");
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to add instructor.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete instructor ${name}?`)) return;
    try {
      await deleteInstructor(id);
      toast.success("Instructor deleted.");
      await load();
    } catch (err) {
      toast.error("Cannot delete instructor (they may be assigned to a course).");
    }
  }

  return (
    <section className="courses-page animate-slide">
      <div className="courses-header">
        <div>
          <h1>Instructors Management</h1>
          <p className="courses-subtitle">View and manage system instructors</p>
        </div>
        <div className="courses-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Instructor"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={load}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Add New Instructor</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
              <label>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} style={{ height: 42 }}>
              {creating ? "Adding..." : "Save Instructor"}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading instructors...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {String(error)}
        </div>
      )}

      {!loading && !error && (
        <ul className="courses-grid">
          {instructors.map((instructor) => (
            <li key={instructor.id} className="course-card">
              <div className="course-card-top">
                <h3 className="course-title" style={{ color: "var(--text-primary)" }}>
                  {instructor.name}
                </h3>
                <span className="badge badge-primary">ID: {instructor.id}</span>
              </div>
              <div className="course-meta-info">
                <div className="meta-row">
                  <span className="meta-label">Email</span>
                  <span className="meta-value">{instructor.email}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(instructor.id, instructor.name)} 
                className="btn btn-secondary" 
                style={{ marginTop: "auto", color: "var(--danger)", borderColor: "var(--danger-bg)" }}
              >
                Delete Instructor
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
