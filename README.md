# Course Management System (Enterprise Edition)

This repository contains a full-stack, enterprise-grade **Course Management System (CMS)** built with **ASP.NET Core (C#)** for the backend and **React/Vite** for the frontend.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Distinct roles for `Admin`, `Instructor`, and `User/Student`.
*   **Student Self-Enrollment:** Secure, token-based endpoints for students to instantly enroll and drop classes dynamically.
*   **Instructor Autonomy:** Instructors manage their own courses, build modules, create assignments, and grade student submissions.
*   **Advanced Educational Logic:** Support for hierarchical Course Modules, Assignments, and Submissions.
*   **Soft Deletion:** Data is safely archived (`IsActive = false`) rather than permanently destroyed, protecting historical data integrity.
*   **Robust Security:** JWT-based authentication with `BCrypt` password hashing and a secure "Change Password" flow.
*   **Modern UI:** Responsive, aesthetically pleasing design using vanilla CSS, featuring glassmorphism and dynamic micro-animations.

## 📁 Project Structure

The project is divided into two main components:
1.  **`/backend`**: An ASP.NET Core Web API integrating Entity Framework Core and PostgreSQL.
2.  **`/frontend`**: A fast React SPA built with Vite.

For detailed instructions on running each component, refer to their respective README files:
*   [Backend README](./backend/README.md)
*   [Frontend README](./frontend/README.md)

## 🛠️ Technology Stack

*   **Backend:** ASP.NET Core (.NET 10), Entity Framework Core, PostgreSQL, BCrypt, JWT Authentication.
*   **Frontend:** React, Vite, React Router, Axios, React Hot Toast.

## 🏁 Getting Started

To run the entire system locally:
1. Ensure you have **.NET 10 SDK**, **Node.js**, and **PostgreSQL** installed.
2. Start your local PostgreSQL server and configure the connection string in `backend/appsettings.json`.
3. In the `/backend` folder, run `dotnet ef database update` to provision the database, then run `dotnet run`.
4. In the `/frontend` folder, run `npm install`, then run `npm run dev`.
