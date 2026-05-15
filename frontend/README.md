# Course Management Frontend

The frontend for the Course Management System is a Single Page Application (SPA) built with **React** and **Vite**.

## ✨ Core Features
*   **Dynamic Role-Based UI:** The interface conditionally renders features based on the logged-in user's role (Admin, Instructor, Student).
*   **Premium Aesthetics:** Built with custom vanilla CSS focusing on vibrant colors, dark mode integrations, glassmorphism, and smooth micro-animations.
*   **Course & Module Management:** Interfaces for instructors to structure their courses, create modules, and add assignments.
*   **Student Self-Enrollment:** One-click enrollment and drop capabilities.
*   **Live Grading System:** Instructors can view student assignment submissions and provide real-time grades and feedback.
*   **Account Security:** Built-in forms for users to securely change their passwords.

## ⚙️ Prerequisites
*   Node.js (v18+)
*   npm (or yarn)

## 🚀 Setup & Execution

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Endpoint:**
   If your backend is running on a port other than `http://localhost:5000`, open `src/services/apiClient.js` and update the `baseURL`.

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5173`.

4. **Build for Production:**
   ```bash
   npm run build
   ```

## 📁 Key Directories
*   **`/src/pages`**: Contains all the main views (`CourseDetails`, `Profile`, `Login`, etc.).
*   **`/src/components`**: Reusable UI components (like `CourseModulesList`).
*   **`/src/services`**: Axios-based API client methods communicating with the backend.
