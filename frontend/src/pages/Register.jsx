import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { getUserRole } from "../services/authService";

function isAdminRole(role) {
  return String(role || "").trim().toLowerCase() === "admin";
}

export default function Register() {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const canCreateInstructor = useMemo(() => isAdminRole(userRole), [userRole]);

  const [accountType, setAccountType] = useState("student");

  const [studentFullName, setStudentFullName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const [instructorName, setInstructorName] = useState("");
  const [instructorEmail, setInstructorEmail] = useState("");
  const [instructorBio, setInstructorBio] = useState("");
  const [instructorOfficeLocation, setInstructorOfficeLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (accountType === "student") {
        const payload = {
          fullName: studentFullName,
          email: studentEmail,
        };

        await apiClient.post("/students", payload);
        setMessage("Student registered successfully.");
        setStudentFullName("");
        setStudentEmail("");
        return;
      }

      if (accountType === "instructor") {
        if (!canCreateInstructor) {
          setError("Instructor registration requires an Admin login.");
          return;
        }

        const payload = {
          name: instructorName,
          email: instructorEmail,
          bio: instructorBio,
          officeLocation: instructorOfficeLocation,
        };

        await apiClient.post("/instructors", payload);
        setMessage("Instructor registered successfully.");
        setInstructorName("");
        setInstructorEmail("");
        setInstructorBio("");
        setInstructorOfficeLocation("");
      }
    } catch (err) {
      setError(err?.response?.data || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Register</h2>

      <div className="flex wrap" style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setAccountType("student")}
          disabled={loading}
          style={{ opacity: accountType === "student" ? 1 : 0.75 }}
        >
          New Student
        </button>

        <button
          type="button"
          onClick={() => setAccountType("instructor")}
          disabled={loading || !canCreateInstructor}
          title={!canCreateInstructor ? "Admin login required" : undefined}
          style={{ opacity: accountType === "instructor" ? 1 : 0.75 }}
        >
          New Instructor
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Back to Login
        </button>
      </div>

      {!canCreateInstructor && (
        <p style={{ marginBottom: 12 }}>
          Instructor registration is Admin-only.
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        {accountType === "student" && (
          <>
            <div style={{ marginBottom: 8 }}>
              <label>Full Name</label>
              <input
                value={studentFullName}
                onChange={(e) => setStudentFullName(e.target.value)}
                style={{ width: "100%" }}
                required
                minLength={2}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label>Email</label>
              <input
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                style={{ width: "100%" }}
                required
                type="email"
              />
            </div>
          </>
        )}

        {accountType === "instructor" && (
          <>
            <div style={{ marginBottom: 8 }}>
              <label>Name</label>
              <input
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                style={{ width: "100%" }}
                required
                minLength={2}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label>Email</label>
              <input
                value={instructorEmail}
                onChange={(e) => setInstructorEmail(e.target.value)}
                style={{ width: "100%" }}
                required
                type="email"
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label>Bio</label>
              <textarea
                value={instructorBio}
                onChange={(e) => setInstructorBio(e.target.value)}
                style={{ width: "100%" }}
                rows={3}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label>Office Location</label>
              <input
                value={instructorOfficeLocation}
                onChange={(e) => setInstructorOfficeLocation(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "crimson" }}>{String(error)}</p>}

      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
