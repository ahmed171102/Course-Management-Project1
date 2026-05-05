import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveToken } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await login(username, password);
      saveToken(result.token);
      setMessage("Login successful!");
      navigate("/dashboard");  
    } catch (err) {
      setError(err?.response?.data || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        Need a student account? <Link to="/register">Register</Link>
      </p>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "crimson" }}>{String(error)}</p>}

      <p style={{ marginTop: 10 }}>
        Demo users:
        <br /> admin / admin123 (Admin)
        <br /> instructor1 / inst123 (Instructor)
        <br /> user1 / user123 (User)
      </p>
    </section>
  );
}