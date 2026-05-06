# 🎓 Course Management System (CMS)

A full-stack, role-based educational platform designed to manage courses, instructors, students, and enrollments. Built with a modern, glassmorphism-inspired React frontend and a robust ASP.NET Core backend.

---

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Secure, varied experiences for Admins, Instructors, and Students.
*   **Modern UI/UX:** A stunning, responsive design utilizing glassmorphism, CSS variables, and dynamic micro-animations.
*   **Real-Time Dashboards:** Tailored dashboard statistics based on the logged-in user's role.
*   **Interactive Course Catalog:** Searchable and filterable course list with live enrollment counts.
*   **Secure API:** JWT-based authentication with strict backend role enforcement (`[Authorize(Roles="Admin")]`).
*   **Toast Notifications:** Elegant, non-intrusive feedback for user actions (success/error states).

---

## 🛠️ Technology Stack

### Backend
*   **Framework:** ASP.NET Core 10.0 (Web API)
*   **ORM:** Entity Framework Core
*   **Database:** PostgreSQL
*   **Authentication:** JWT (JSON Web Tokens) Bearer Authentication
*   **Background Jobs:** Hangfire (Configured for background processing)

### Frontend
*   **Framework:** React 19
*   **Build Tool:** Vite 8
*   **Routing:** React Router DOM v7
*   **HTTP Client:** Axios (with custom interceptors for token management)
*   **Notifications:** React Hot Toast
*   **Styling:** Pure Vanilla CSS (Design system with tokens, variables, and glassmorphism)

---

## 🔐 Role-Based Access Control (RBAC)

The system features three distinct roles, enforced on both the frontend (UI visibility) and backend (API endpoint protection):

1.  **👑 Admin**
    *   *Capabilities:* Full CRUD (Create, Read, Update, Delete) access.
    *   *Features:* Can create new courses, edit existing ones, delete courses, and view all system statistics (total courses, students, instructors, enrollments).
2.  **🧑‍🏫 Instructor**
    *   *Capabilities:* Read-only access to course catalogs.
    *   *Features:* Can view detailed course information and see a comprehensive table of students enrolled in their courses. Cannot modify or delete courses.
3.  **👨‍🎓 Student**
    *   *Capabilities:* Read-only access.
    *   *Features:* Can browse available courses, use the search/filter functionalities, and view their specific enrollments. Protected from accessing any administrative routes.

---

## 🚀 Getting Started

Follow these steps to run the application locally. 

### Prerequisites
*   .NET 10.0 SDK
*   Node.js & npm
*   PostgreSQL running locally

### 1. Start the Backend
The backend runs on `https://localhost:7215` (or `http://localhost:5106`).
```bash
cd backend
dotnet run --launch-profile https
```

### 2. Start the Frontend
The frontend runs on `http://localhost:5174`. It is configured to automatically proxy `/api` requests to the backend to avoid CORS issues.
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Test Accounts

The database comes pre-seeded with sample data (10 courses, 9 students, 25 enrollments). Use these credentials to explore the different roles:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Instructor** | `instructor1` | `inst123` |
| **Student** | `user1` | `user123` |

---

## 📁 Project Structure highlights

### Backend Data Flow
*   `Controllers/`: Exposes RESTful endpoints (e.g., `CoursesController`, `AuthenticationController`).
*   `DTOs/`: Data Transfer Objects used to prevent circular reference errors and control the exact data sent to the client (e.g., pulling `EnrollmentCount` without loading entire nested entities).
*   `Models/Entities/`: Database schemas (Courses, Students, Instructors, Enrollments, AppUsers).
*   `Services/`: Contains business logic (e.g., `AuthorizationService` for JWT generation and password hashing).

### Frontend Architecture
*   `src/pages/`: Main application views (`Dashboard.jsx`, `CoursesList.jsx`, `CourseDetails.jsx`).
*   `src/components/`: Reusable UI elements like the `Navbar`.
*   `src/services/`: API communication layers (`apiClient.js` with global 401 redirect logic).
*   `src/index.css`: The global design system containing all CSS variables (colors, spacing, shadows, glassmorphism utilities).

---

## 🐛 Recent Optimizations
*   **Circular Reference Resolution:** Transitioned GET endpoints from returning raw Entities to using anonymous `Select` projections, resolving deep Entity Framework cyclical dependency errors (500 Internal Server Error).
*   **Data Aggregation:** Added `EnrollmentCount` properties to DTOs so the frontend can display live student counts without requesting the entire enrollment array.
*   **Security:** Applied `[Authorize(Roles="Admin")]` directly to API Controllers to ensure security is handled server-side, rather than just hiding UI buttons.
