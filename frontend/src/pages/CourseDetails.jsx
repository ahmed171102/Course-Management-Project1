import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { deleteCourse, getCourseById, updateCourse } from "../services/coursesService";
import { getStudents } from "../services/studentsService";
import { createEnrollment, deleteEnrollment, selfEnroll, selfDrop } from "../services/enrollmentsService";
import { getUserRole, getUsername, getCurrentUser } from "../services/authService";
import CourseModulesList from "../components/CourseModulesList";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import "./FormPages.css";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const role = (user.role || "").toLowerCase();
  const isStudent = role === "student";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);

  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState(1);
  const [instructorId, setInstructorId] = useState(1);

  // Enrollment states
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // Modal states
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getCourseById(id);
      setCourse(data);
      setTitle(data.title);
      setCredits(data.credits);
      setInstructorId(data.instructorId);

      const isAuthorizedToEdit = role === "admin" || (role === "instructor" && data?.instructor?.email === user.email);
      if (isAuthorizedToEdit) {
        const students = await getStudents();
        setAllStudents(students);
      }
    } catch (err) {
      setError(err?.response?.data || err.message || "Failed to load course.");
    } finally {
      setLoading(false);
    }
  }

  const canEdit = isAdmin || (isInstructor && course?.instructor?.email === user.email);

  useEffect(() => { load(); }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateCourse(id, {
        id: Number(id),
        title,
        credits: Number(credits),
        instructorId: Number(instructorId),
      });
      toast.success("Course updated successfully!");
      await load();
    } catch (err) {
      const msg = err?.response?.data || err.message || "Update failed.";
      setError(String(msg));
      toast.error("Failed to update course.");
    } finally {
      setSaving(false);
    }
  }

  function promptDeleteCourse() {
    setModalConfig({
      isOpen: true,
      title: "Delete Course",
      message: "Are you sure you want to delete this course? This action cannot be undone.",
      onConfirm: async () => {
        setModalConfig({ ...modalConfig, isOpen: false });
        await executeDeleteCourse();
      }
    });
  }

  async function executeDeleteCourse() {
    setDeleting(true);
    setError("");
    try {
      await deleteCourse(id);
      toast.success("Course deleted.");
      navigate("/courses");
    } catch (err) {
      const msg = err?.response?.data || err.message || "Delete failed.";
      setError(String(msg));
      toast.error("Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleEnroll(e) {
    e.preventDefault();
    if (!selectedStudentId) return;
    setEnrolling(true);
    try {
      await createEnrollment(Number(selectedStudentId), Number(id));
      toast.success("Student enrolled successfully!");
      setSelectedStudentId("");
      await load();
    } catch (err) {
      const msg = err?.response?.data || err.message || "Enrollment failed.";
      toast.error(String(msg));
    } finally {
      setEnrolling(false);
    }
  }

  function promptRemoveStudent(studentId) {
    setModalConfig({
      isOpen: true,
      title: "Remove Student",
      message: "Are you sure you want to remove this student from the course?",
      onConfirm: async () => {
        setModalConfig({ ...modalConfig, isOpen: false });
        await executeRemoveStudent(studentId);
      }
    });
  }

  async function executeRemoveStudent(studentId) {
    try {
      await deleteEnrollment(studentId, Number(id));
      toast.success("Student removed from course.");
      await load();
    } catch (err) {
      const msg = err?.response?.data || err.message || "Failed to remove student.";
      toast.error(String(msg));
    }
  }

  async function handleSelfEnroll() {
    setEnrolling(true);
    try {
      await selfEnroll(Number(id));
      toast.success("Successfully enrolled!");
      await load();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to enroll.");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleSelfDrop() {
    setEnrolling(true);
    try {
      await selfDrop(Number(id));
      toast.success("Successfully dropped course.");
      await load();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to drop course.");
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <section className="form-page" style={{ paddingTop: 64 }}>
        <div className="text-center">
          <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
          <p style={{ color: "var(--text-muted)" }}>Loading course details...</p>
        </div>
      </section>
    );
  }

  if (error && !course) {
    return (
      <section className="form-page" style={{ paddingTop: 64 }}>
        <div className="alert alert-error">
          <span>⚠️</span> {String(error)}
        </div>
        <Link to="/courses" className="btn btn-secondary mt-md">← Back to Courses</Link>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="form-page" style={{ paddingTop: 64 }}>
        <p style={{ color: "var(--text-muted)" }}>Course not found.</p>
        <Link to="/courses" className="btn btn-secondary mt-md">← Back to Courses</Link>
      </section>
    );
  }

  const enrollments = course.enrollments || [];
  const enrollmentCount = course.enrollmentCount ?? enrollments.length;

  return (
    <section className="form-page animate-slide">
      <div className="form-page-header">
        <div>
          <Link to="/courses" className="back-link">← Back to Courses</Link>
          <h1>{course.title}</h1>
          <div className="flex gap-sm items-center" style={{ marginTop: 8 }}>
            <span className="badge badge-primary">{course.credits} Credits</span>
            {course.instructor && (
              <span className="badge badge-info">Instructor: {course.instructor.name}</span>
            )}
            <span className="badge badge-success">👥 {enrollmentCount} student{enrollmentCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="form-card card">
          <h3 style={{ marginBottom: 20 }}>Edit Course</h3>
          <form onSubmit={handleUpdate} id="edit-course-form">
            <div className="form-group">
              <label htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-credits">Credits (1-6)</label>
                <input
                  id="edit-credits"
                  required
                  type="number"
                  min={1}
                  max={6}
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-instructor">Instructor ID</label>
                <input
                  id="edit-instructor"
                  required
                  type="number"
                  min={1}
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  disabled={role === "instructor"} 
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {String(error)}
              </div>
            )}

            <div className="form-actions">
              {role === "admin" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={promptDeleteCourse}
                  disabled={deleting}
                  style={{ color: "var(--danger)", borderColor: "var(--danger-bg)" }}
                >
                  {deleting ? "Deleting..." : "Delete Course"}
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving} id="update-course-btn">
                {saving ? "Saving..." : "Update Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!canEdit && (
        <div className="form-card card">
          <h3>Course Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Title</span>
              <span className="detail-value">{course.title}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Credits</span>
              <span className="detail-value">{course.credits}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Instructor ID</span>
              <span className="detail-value">{course.instructorId}</span>
            </div>
            {course.instructor && (
              <div className="detail-item">
                <span className="detail-label">Instructor Name</span>
                <span className="detail-value">{course.instructor.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isStudent && (
        <div className="form-card card" style={{ marginTop: 24 }}>
          <h3>Student Actions</h3>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
            You can enroll or drop this course using the buttons below.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button className="btn btn-primary" onClick={handleSelfEnroll} disabled={enrolling}>
              {enrolling ? "Processing..." : "Enroll in Course"}
            </button>
            <button className="btn btn-secondary" onClick={handleSelfDrop} disabled={enrolling} style={{ color: "var(--danger)", borderColor: "var(--danger-bg)" }}>
               Drop Course
            </button>
          </div>
        </div>
      )}

      {/* Enrolled Students List */}
      <div className="form-card card" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>
            Enrolled Students
            <span className="badge badge-primary" style={{ marginLeft: 12, fontSize: 13 }}>
              {enrollmentCount}
            </span>
          </h3>
        </div>

        {canEdit && (
          <form onSubmit={handleEnroll} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "rgba(0, 0, 0, 0.2)",
                color: "var(--text-primary)"
              }}
            >
              <option value="">-- Select a student to enroll --</option>
              {allStudents
                .filter(s => !enrollments.some(e => e.studentId === s.id))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                ))}
            </select>
            <button type="submit" className="btn btn-primary" disabled={enrolling || !selectedStudentId}>
              {enrolling ? "Enrolling..." : "Enroll"}
            </button>
          </form>
        )}

        {enrollments.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
            No students enrolled in this course yet.
          </p>
        ) : (
          <div className="enrolled-students-table" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(139, 92, 246, 0.2)" }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Student Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Enrolled On</th>
                  {canEdit && <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, i) => (
                  <tr key={`${e.studentId}-${e.courseId}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{e.student?.fullName || `Student #${e.studentId}`}</td>
                    <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{e.student?.email || "—"}</td>
                    <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                      {e.enrollmentDate ? new Date(e.enrollmentDate).toLocaleDateString() : "—"}
                    </td>
                    {canEdit && (
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button
                          onClick={() => promptRemoveStudent(e.studentId)}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--danger)",
                            color: "var(--danger)",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CourseModulesList courseId={course.id} canEdit={canEdit} isStudent={isStudent} />

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        confirmText="Yes, Proceed"
        isDanger={true}
      />
    </section>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--text-muted)",
  fontWeight: 600,
};

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
  color: "var(--text-primary)",
};