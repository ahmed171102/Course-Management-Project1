import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "./services/authService";

import NavBar from "./components/NavigationBar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import CoursesList from "./pages/CoursesList.jsx";
import CourseCreate from "./pages/CourseCreate.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";

import "./App.css";

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DashboardRedirect() {
  const { role } = getCurrentUser();
  const r = (role || "").toLowerCase();
  if (r === "admin") return <Navigate to="/admin" replace />;
  if (r === "instructor") return <Navigate to="/instructor" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  const location = useLocation();
  const authPages = new Set(["/login", "/register"]);
  const showNav = isAuthenticated() && !authPages.has(location.pathname);

  return (
    <>
      {showNav && <NavBar />}

      <main className="container" style={{ flex: 1, paddingTop: showNav ? 0 : 24, paddingBottom: 40 }}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — Dashboard Redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Role Dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Courses */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CoursesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute>
                <CourseCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </>
  );
}