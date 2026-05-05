import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavigationBar.jsx";

import { getCurrentUser } from "./services/authService";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CoursesList from "./pages/CoursesList.jsx";
import CourseCreate from "./pages/CourseCreate.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";

export default function App() {
  const location = useLocation();
  const { token } = getCurrentUser();
  const isAuthenticated = Boolean(token);
  const hideNavOnRoutes = new Set(["/login", "/register"]);
  const shouldShowNav = isAuthenticated && !hideNavOnRoutes.has(location.pathname);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {shouldShowNav && <NavBar />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesList />} />
        <Route path="/courses/new" element={<CourseCreate />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
      </Routes>
    </main>
  );
}