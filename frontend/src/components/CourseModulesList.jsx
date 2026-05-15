import { useEffect, useState } from "react";
import { getCourseModules, createModule, deleteModule } from "../services/modulesService";
import { createAssignment, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission } from "../services/assignmentsService";
import toast from "react-hot-toast";

export default function CourseModulesList({ courseId, canEdit, isStudent }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  
  const [showAssignForm, setShowAssignForm] = useState(null);
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignScore, setNewAssignScore] = useState(100);

  const [submissionsView, setSubmissionsView] = useState(null); // assignmentId
  const [submissionsData, setSubmissionsData] = useState([]);
  
  // Student view
  const [submittingAssign, setSubmittingAssign] = useState(null);
  const [submissionContent, setSubmissionContent] = useState("");

  async function loadModules() {
    try {
      const data = await getCourseModules(courseId);
      setModules(data);
    } catch (err) {
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadModules(); }, [courseId]);

  async function handleCreateModule(e) {
    e.preventDefault();
    try {
      await createModule(courseId, { title: newModuleTitle, description: newModuleDesc, orderIndex: modules.length + 1 });
      setNewModuleTitle(""); setNewModuleDesc("");
      toast.success("Module created!");
      loadModules();
    } catch (err) {
      toast.error("Failed to create module");
    }
  }

  async function handleDeleteModule(id) {
    if (!window.confirm("Delete module?")) return;
    try {
      await deleteModule(id);
      toast.success("Module deleted");
      loadModules();
    } catch (err) {
      toast.error("Failed to delete module");
    }
  }

  async function handleCreateAssignment(e, moduleId) {
    e.preventDefault();
    try {
      await createAssignment(moduleId, { title: newAssignTitle, maxScore: Number(newAssignScore) });
      setNewAssignTitle(""); setShowAssignForm(null);
      toast.success("Assignment created!");
      loadModules();
    } catch (err) {
      toast.error("Failed to create assignment");
    }
  }

  async function handleDeleteAssignment(id) {
    if (!window.confirm("Delete assignment?")) return;
    try {
      await deleteAssignment(id);
      toast.success("Assignment deleted");
      loadModules();
    } catch (err) {
      toast.error("Failed to delete assignment");
    }
  }

  async function handleViewSubmissions(assignmentId) {
    if (submissionsView === assignmentId) {
      setSubmissionsView(null); return;
    }
    try {
      const data = await getSubmissions(assignmentId);
      setSubmissionsData(data);
      setSubmissionsView(assignmentId);
    } catch (err) {
      toast.error("Failed to load submissions");
    }
  }

  async function handleGrade(subId, currentScore) {
    const score = prompt("Enter score (0-100):", currentScore || 0);
    if (score === null) return;
    const feedback = prompt("Enter feedback:");
    try {
      await gradeSubmission(subId, Number(score), feedback || "");
      toast.success("Graded successfully");
      handleViewSubmissions(submissionsView); // reload
    } catch (err) {
      toast.error("Failed to grade");
    }
  }

  async function handleStudentSubmit(e, assignId) {
    e.preventDefault();
    try {
      await submitAssignment(assignId, submissionContent);
      toast.success("Submitted successfully!");
      setSubmittingAssign(null); setSubmissionContent("");
    } catch (err) {
      toast.error("Failed to submit");
    }
  }

  if (loading) return <p>Loading modules...</p>;

  return (
    <div className="modules-container" style={{ marginTop: 24 }}>
      {canEdit && (
        <div className="card form-card" style={{ marginBottom: 24 }}>
          <h4>Add New Module</h4>
          <form onSubmit={handleCreateModule} style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <input required placeholder="Module Title" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} style={{ flex: 1, padding: 8 }} />
            <input placeholder="Description" value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} style={{ flex: 2, padding: 8 }} />
            <button className="btn btn-primary" type="submit">Add Module</button>
          </form>
        </div>
      )}

      {modules.map(mod => (
        <div key={mod.id} className="card form-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{mod.title}</h3>
            {canEdit && <button className="btn btn-secondary" onClick={() => handleDeleteModule(mod.id)} style={{ color: "var(--danger)" }}>Delete Module</button>}
          </div>
          {mod.description && <p style={{ color: "var(--text-muted)", marginTop: 8 }}>{mod.description}</p>}

          <div style={{ marginTop: 16, paddingLeft: 16, borderLeft: "2px solid var(--primary)" }}>
            <h5 style={{ marginBottom: 12 }}>Assignments</h5>
            {mod.assignments?.map(assign => (
              <div key={assign.id} style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 6, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{assign.title}</strong>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Max: {assign.maxScore}</span>
                </div>
                
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  {canEdit && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => handleViewSubmissions(assign.id)}>
                        {submissionsView === assign.id ? "Hide Submissions" : "View Submissions"}
                      </button>
                      <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)" }} onClick={() => handleDeleteAssignment(assign.id)}>Delete</button>
                    </>
                  )}
                  {isStudent && (
                    <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => setSubmittingAssign(submittingAssign === assign.id ? null : assign.id)}>
                      Submit Work
                    </button>
                  )}
                </div>

                {isStudent && submittingAssign === assign.id && (
                  <form onSubmit={(e) => handleStudentSubmit(e, assign.id)} style={{ marginTop: 12 }}>
                    <textarea required placeholder="Paste your submission content/URL here..." value={submissionContent} onChange={e => setSubmissionContent(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 4, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "#fff", minHeight: 60 }} />
                    <button className="btn btn-primary" style={{ marginTop: 8, padding: "4px 12px", fontSize: 12 }} type="submit">Send Submission</button>
                  </form>
                )}

                {canEdit && submissionsView === assign.id && (
                  <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 6 }}>
                    <h6 style={{ margin: "0 0 8px 0" }}>Submissions ({submissionsData.length})</h6>
                    {submissionsData.map(sub => (
                      <div key={sub.id} style={{ padding: 8, borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>{sub.student.fullName}</strong>
                          <span style={{ color: sub.score !== null ? "var(--success)" : "var(--warning)" }}>
                            {sub.score !== null ? `Score: ${sub.score}` : "Needs Grading"}
                          </span>
                        </div>
                        <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>{sub.content}</p>
                        <button className="btn btn-secondary" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => handleGrade(sub.id, sub.score)}>Grade</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {canEdit && (
              <div style={{ marginTop: 12 }}>
                {showAssignForm === mod.id ? (
                  <form onSubmit={(e) => handleCreateAssignment(e, mod.id)} style={{ display: "flex", gap: 8 }}>
                    <input required placeholder="Assignment Title" value={newAssignTitle} onChange={e => setNewAssignTitle(e.target.value)} style={{ padding: 6, flex: 1 }} />
                    <input required type="number" placeholder="Max Score" value={newAssignScore} onChange={e => setNewAssignScore(e.target.value)} style={{ padding: 6, width: 80 }} />
                    <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} type="submit">Save</button>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} type="button" onClick={() => setShowAssignForm(null)}>Cancel</button>
                  </form>
                ) : (
                  <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => setShowAssignForm(mod.id)}>+ Add Assignment</button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
