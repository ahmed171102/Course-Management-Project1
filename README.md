# Course Management System API — Submission (Web Engineering ASP.NET Core)

**Student Name:** Ahmed Adel Goda  
**Student ID:** 211005618  
**Repository:** `ahmed171102/Course-Management-Project1`  

---

## 1) Complete source code
This repository contains the complete source code for the Course Management System API, including:

- Controllers (API endpoints)
- Services (business logic)
- DTOs (request/response models)
- EF Core DbContext + entity models
- Authentication/Authorization logic
- Middleware and background jobs (bonus)

---

## 2) Database migrations
EF Core migrations are included in the `Migrations/` folder.

### Applying migrations
This project also runs migrations automatically at startup using:

- `db.Database.Migrate();`

You can apply migrations manually using:

```bash
dotnet ef database update
```

---

## 3) README file explaining how to run the project

### Prerequisites
- **.NET SDK** (matching the project target framework)
- **PostgreSQL** installed and running

### Configure the database connection string
Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=CourseManagementDb;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

### Configure JWT settings
In `appsettings.json` (example):

```json
{
  "Jwt": {
    "Key": "YOUR_LONG_SECRET_KEY_HERE",
    "Issuer": "CourseManagementApi",
    "Audience": "CourseManagementApiUsers"
  }
}
```

### Run the API
From the repository root:

```bash
dotnet run
```

Swagger UI (Development) will be available at:

- `https://localhost:<port>/swagger`

---

## 4) Technologies used (with short description)

- **ASP.NET Core Web API**  
  Framework for building REST APIs (controllers, routing, middleware, model binding).

- **Entity Framework Core (EF Core)**  
  ORM to map C# entity classes to database tables and query data using LINQ.

- **PostgreSQL**  
  Relational database used for storing application data.

- **Npgsql.EntityFrameworkCore.PostgreSQL**  
  EF Core provider that enables EF Core to work with PostgreSQL.

- **JWT Bearer Authentication (Microsoft.AspNetCore.Authentication.JwtBearer)**  
  Authentication method using JSON Web Tokens (JWT) sent in the `Authorization` header.

- **Swagger / OpenAPI (Swashbuckle.AspNetCore + Microsoft.AspNetCore.OpenApi)**  
  Automatically generates interactive API documentation and allows endpoint testing in browser.

- **BCrypt.Net-Next**  
  Secure password hashing library used to store passwords safely.

- **Hangfire (Hangfire.AspNetCore + Hangfire.MemoryStorage)** *(Bonus / Optional)*  
  Background job scheduling and processing (used for scheduled cleanup tasks).

---

## 5) Why HTTP-only cookies are commonly used (industry standard)



- **HTTP-only cookies cannot be accessed by JavaScript**, which helps protect session tokens from **XSS (Cross-Site Scripting)** attacks.
- If an authentication token is stored somewhere JavaScript can read (like `localStorage`), then an XSS vulnerability could allow attackers to steal it.
- With HTTP-only cookies, the browser automatically sends the cookie to the server on each request, supporting secure session-style authentication.
- In practice, teams often combine:
  - `HttpOnly` to block JS access
  - `Secure` to only send cookies over HTTPS
  - `SameSite` to reduce CSRF risk

**Note:** Cookie-based authentication must also handle **CSRF** protection. JWT-in-header approaches reduce CSRF risk, but still require preventing XSS and securing token storage.

---

## 6) API endpoint documentation

### Authentication
- `POST /api/authentication/login`  
  Logs in and returns a JWT token + refresh token.

- `POST /api/authentication/refresh`  
  Exchanges a refresh token for a new JWT token.

- `POST /api/authentication/revoke`  
  Revokes a refresh token.

### Students
- `GET /api/students`  
- `GET /api/students/{id}`  
- `POST /api/students`  
- `PUT /api/students/{id}`  
- `DELETE /api/students/{id}`  

### Courses
- `GET /api/courses`  
- `GET /api/courses/{id}`  
- `POST /api/courses`  
- `PUT /api/courses/{id}`  
- `DELETE /api/courses/{id}`  

### Instructors (Protected + role-based)
- `GET /api/instructors`  
- `GET /api/instructors/{id}`  
- `POST /api/instructors`  
- `PUT /api/instructors/{id}`  
- `DELETE /api/instructors/{id}`  

### Enrollments
- `GET /api/enrollments`  
- `GET /api/enrollments/student/{studentId}`  
- `GET /api/enrollments/course/{courseId}`  
- `POST /api/enrollments`  

> Authorization: Protected endpoints require:
> `Authorization: Bearer <JWT>`

---

## 7) Screenshots from Swagger or Postman demonstrating working endpoints

I included a **PDF file containing Swagger screenshots and explanation** (Swagger UI requests/responses and how endpoints were tested).

Recommended location:
- `docs/`

Example filename:
- `docs/swagger_screenshots.pdf`

---

## Project structure (overview)
- `controllers/` — API controllers and routes
- `services/` — service layer (business logic)
- `DTOs/` — request/response models + validation
- `data/` — EF Core DbContext
- `models/` — entity models
- `Migrations/` — EF Core migrations
- `Middleware/` — exception handling middleware
- `Jobs/` — Hangfire jobs
