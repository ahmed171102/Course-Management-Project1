# Course Management API (Backend)

The backend for the Course Management System is built using **ASP.NET Core** and **Entity Framework Core**, providing a highly secure and robust RESTful API.

## ✨ Core Features
*   **Authentication & Authorization:** Secure JWT generation with refresh tokens and `BCrypt` password hashing. Contains distinct policies for `Admin`, `Instructor`, and `User`.
*   **Enterprise Data Models:** Hierarchical models featuring `Course`, `CourseModule`, `Assignment`, and `AssignmentSubmission`.
*   **Data Integrity (Soft Deletes):** Uses Global Query Filters (`IsActive`) to ensure historical records are preserved when users or courses are deleted.
*   **Instructor Rights:** Secure endpoints that validate JWT claims against resource ownership, ensuring instructors can only edit and grade courses they actively manage.
*   **PostgreSQL Integration:** Fully migrations-driven database schema managed through EF Core.

## ⚙️ Prerequisites
*   .NET 10.0 SDK
*   PostgreSQL Server

## 🚀 Setup & Execution

1. **Configure Database:**
   Ensure PostgreSQL is running. Open `appsettings.json` and update the `ConnectionStrings:DefaultConnection` with your valid database credentials.

2. **Apply Migrations:**
   Run the following command to create the database schema:
   ```bash
   dotnet ef database update
   ```
   *(Note: The database is automatically seeded with an Admin account on first run: `admin` / `admin123`)*

3. **Run the Application:**
   ```bash
   dotnet run
   ```
   The API will typically start on `http://localhost:5000` or `https://localhost:5001`.

## 📚 API Architecture
*   **`/Controllers`**: Handles HTTP requests, JWT claim extraction, and routing.
*   **`/Services`**: Contains complex business logic (e.g., token generation, authorization rules).
*   **`/Models/Entities`**: Database schemas.
*   **`/DTOs`**: Data Transfer Objects to separate database models from API responses.
