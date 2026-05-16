using System.Text;
using CourseManagement.Api.Data;
using CourseManagement.Api.Interfaces;
using CourseManagement.Api.Jobs;
using CourseManagement.Api.Middleware;
using CourseManagement.Api.Models.Entities;
using Hangfire;
using Hangfire.MemoryStorage;
using CourseManagement.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Authorization");
    });
});

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IInstructorService, InstructorService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IAuthorizationService, AuthorizationService>();
builder.Services.AddScoped<CleanupJob>();

builder.Services.AddHangfire(configuration => configuration
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseMemoryStorage());
builder.Services.AddHangfireServer();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.WriteIndented = false;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Course Management API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {JWT token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseHangfireDashboard("/hangfire");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    db.Database.ExecuteSqlRaw("UPDATE \"AppUsers\" SET \"IsActive\" = true; UPDATE \"Courses\" SET \"IsActive\" = true; UPDATE \"Students\" SET \"IsActive\" = true; UPDATE \"Instructors\" SET \"IsActive\" = true; UPDATE \"AppUsers\" SET \"Role\" = 'Student' WHERE \"Role\" = 'User';");

    if (!db.AppUsers.Any())
    {
        // ── 1. User Accounts ──
        db.AppUsers.AddRange(
            new AppUser { Id = Guid.NewGuid().ToString("N"), Username = "admin", Email = "admin@course.local", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Role = "Admin" },
            new AppUser { Id = Guid.NewGuid().ToString("N"), Username = "dr.smith", Email = "smith@course.local", PasswordHash = BCrypt.Net.BCrypt.HashPassword("inst123"), Role = "Instructor" },
            new AppUser { Id = Guid.NewGuid().ToString("N"), Username = "dr.jones", Email = "jones@course.local", PasswordHash = BCrypt.Net.BCrypt.HashPassword("inst123"), Role = "Instructor" },
            new AppUser { Id = Guid.NewGuid().ToString("N"), Username = "alice", Email = "alice@course.local", PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"), Role = "Student" },
            new AppUser { Id = Guid.NewGuid().ToString("N"), Username = "bob", Email = "bob@course.local", PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"), Role = "Student" },
            new AppUser { Id = Guid.NewGuid().ToString("N"), Username = "charlie", Email = "charlie@course.local", PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"), Role = "Student" },
            new AppUser { Id = Guid.NewGuid().ToString("N"), Username = "diana", Email = "diana@course.local", PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"), Role = "Student" }
        );
        db.SaveChanges();

        // ── 2. Instructor Profiles ──
        var inst1 = new Instructor { Name = "Dr. Sarah Smith", Email = "smith@course.local" };
        var inst2 = new Instructor { Name = "Dr. Michael Jones", Email = "jones@course.local" };
        var inst3 = new Instructor { Name = "Prof. Emily Davis", Email = "davis@university.edu" };
        db.Instructors.AddRange(inst1, inst2, inst3);
        db.SaveChanges();

        // ── 3. Instructor Profiles (1-to-1) ──
        db.InstructorProfiles.AddRange(
            new InstructorProfile { InstructorId = inst1.Id, Bio = "Expert in full-stack web development with 12 years of industry experience.", OfficeLocation = "Building A, Room 301" },
            new InstructorProfile { InstructorId = inst2.Id, Bio = "Specializes in relational and NoSQL database design.", OfficeLocation = "Building B, Room 205" },
            new InstructorProfile { InstructorId = inst3.Id, Bio = "Researcher in machine learning and computer vision.", OfficeLocation = "Building C, Room 112" }
        );
        db.SaveChanges();

        // ── 4. Student Profiles ──
        var stu1 = new Student { FullName = "Alice Johnson", Email = "alice@course.local" };
        var stu2 = new Student { FullName = "Bob Williams", Email = "bob@course.local" };
        var stu3 = new Student { FullName = "Charlie Brown", Email = "charlie@course.local" };
        var stu4 = new Student { FullName = "Diana Martinez", Email = "diana@course.local" };
        db.Students.AddRange(stu1, stu2, stu3, stu4);
        db.SaveChanges();

        // ── 5. Courses ──
        var course1 = new Course { Title = "Advanced Web Architectures", Credits = 4, InstructorId = inst1.Id };
        var course2 = new Course { Title = "Database Design & Optimization", Credits = 3, InstructorId = inst2.Id };
        var course3 = new Course { Title = "Machine Learning Fundamentals", Credits = 4, InstructorId = inst3.Id };
        var course4 = new Course { Title = "Cybersecurity Essentials", Credits = 3, InstructorId = inst1.Id };
        db.Courses.AddRange(course1, course2, course3, course4);
        db.SaveChanges();

        // ── 6. Enrollments ──
        db.Enrollments.AddRange(
            new Enrollment { StudentId = stu1.Id, CourseId = course1.Id, EnrollmentDate = new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Enrollment { StudentId = stu2.Id, CourseId = course1.Id, EnrollmentDate = new DateTime(2025, 9, 6, 0, 0, 0, DateTimeKind.Utc) },
            new Enrollment { StudentId = stu3.Id, CourseId = course1.Id, EnrollmentDate = new DateTime(2026, 1, 20, 0, 0, 0, DateTimeKind.Utc) },
            new Enrollment { StudentId = stu1.Id, CourseId = course2.Id, EnrollmentDate = new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Enrollment { StudentId = stu4.Id, CourseId = course2.Id, EnrollmentDate = new DateTime(2026, 1, 22, 0, 0, 0, DateTimeKind.Utc) },
            new Enrollment { StudentId = stu2.Id, CourseId = course3.Id, EnrollmentDate = new DateTime(2025, 9, 8, 0, 0, 0, DateTimeKind.Utc) },
            new Enrollment { StudentId = stu3.Id, CourseId = course3.Id, EnrollmentDate = new DateTime(2026, 1, 20, 0, 0, 0, DateTimeKind.Utc) },
            new Enrollment { StudentId = stu4.Id, CourseId = course3.Id, EnrollmentDate = new DateTime(2026, 1, 22, 0, 0, 0, DateTimeKind.Utc) }
        );
        db.SaveChanges();

        // ── 7. Course Modules ──
        var mod1 = new CourseModule { Title = "Week 1: HTTP & REST Fundamentals", Description = "Understanding HTTP methods, status codes, and RESTful API design.", OrderIndex = 1, CourseId = course1.Id };
        var mod2 = new CourseModule { Title = "Week 2: JWT & Authentication", Description = "Implementing secure token-based authentication with refresh tokens.", OrderIndex = 2, CourseId = course1.Id };
        var mod3 = new CourseModule { Title = "Week 3: Role-Based Access Control", Description = "Designing and enforcing RBAC policies in enterprise applications.", OrderIndex = 3, CourseId = course1.Id };
        var mod4 = new CourseModule { Title = "Week 1: ER Diagrams & Normalization", Description = "Designing efficient relational schemas using normalization rules.", OrderIndex = 1, CourseId = course2.Id };
        var mod5 = new CourseModule { Title = "Week 2: SQL Query Optimization", Description = "Using indexes, query plans, and JOINs for high-performance queries.", OrderIndex = 2, CourseId = course2.Id };
        var mod6 = new CourseModule { Title = "Week 1: Intro to Supervised Learning", Description = "Linear regression, classification, and model evaluation metrics.", OrderIndex = 1, CourseId = course3.Id };
        db.CourseModules.AddRange(mod1, mod2, mod3, mod4, mod5, mod6);
        db.SaveChanges();

        // ── 8. Assignments ──
        var assign1 = new Assignment { Title = "REST API Design Quiz", Description = "Design a RESTful API for a library system.", MaxScore = 50, CourseModuleId = mod1.Id, DueDate = new DateTime(2026, 2, 15, 23, 59, 0, DateTimeKind.Utc) };
        var assign2 = new Assignment { Title = "JWT Implementation Lab", Description = "Implement JWT auth with refresh token rotation.", MaxScore = 100, CourseModuleId = mod2.Id, DueDate = new DateTime(2026, 2, 22, 23, 59, 0, DateTimeKind.Utc) };
        var assign3 = new Assignment { Title = "RBAC Policy Report", Description = "Write a report comparing RBAC, ABAC, and ACL models.", MaxScore = 75, CourseModuleId = mod3.Id, DueDate = new DateTime(2026, 3, 1, 23, 59, 0, DateTimeKind.Utc) };
        var assign4 = new Assignment { Title = "Database Schema Design", Description = "Design a normalized schema for an e-commerce platform.", MaxScore = 100, CourseModuleId = mod4.Id, DueDate = new DateTime(2026, 2, 18, 23, 59, 0, DateTimeKind.Utc) };
        var assign5 = new Assignment { Title = "SQL Performance Tuning", Description = "Optimize 5 slow queries using EXPLAIN ANALYZE.", MaxScore = 80, CourseModuleId = mod5.Id, DueDate = new DateTime(2026, 2, 25, 23, 59, 0, DateTimeKind.Utc) };
        var assign6 = new Assignment { Title = "Linear Regression Notebook", Description = "Train a linear regression model on housing data.", MaxScore = 100, CourseModuleId = mod6.Id, DueDate = new DateTime(2026, 3, 5, 23, 59, 0, DateTimeKind.Utc) };
        var assign7 = new Assignment { Title = "Midterm Project: Full-Stack App", Description = "Build a complete CRUD app with authentication.", MaxScore = 200, CourseModuleId = mod2.Id, DueDate = new DateTime(2026, 3, 15, 23, 59, 0, DateTimeKind.Utc) };
        var assign8 = new Assignment { Title = "3NF Normalization Exercise", Description = "Normalize a given denormalized table to 3NF.", MaxScore = 40, CourseModuleId = mod4.Id, DueDate = new DateTime(2026, 2, 20, 23, 59, 0, DateTimeKind.Utc) };
        db.Assignments.AddRange(assign1, assign2, assign3, assign4, assign5, assign6, assign7, assign8);
        db.SaveChanges();

        // ── 9. Student Submissions (some graded, some pending) ──
        db.AssignmentSubmissions.AddRange(
            new AssignmentSubmission { AssignmentId = assign1.Id, StudentId = stu1.Id, Content = "Here is my REST API design for the library system: GET /books, POST /books, PUT /books/{id}, DELETE /books/{id}.", SubmittedAt = new DateTime(2026, 2, 14, 18, 30, 0, DateTimeKind.Utc), Score = 45, Feedback = "Excellent work! Consider adding pagination to GET /books." },
            new AssignmentSubmission { AssignmentId = assign1.Id, StudentId = stu2.Id, Content = "My API includes: /api/books endpoints with proper status codes (200, 201, 404).", SubmittedAt = new DateTime(2026, 2, 15, 10, 0, 0, DateTimeKind.Utc), Score = 38, Feedback = "Good structure but missing PATCH for partial updates." },
            new AssignmentSubmission { AssignmentId = assign1.Id, StudentId = stu3.Id, Content = "REST API design submitted. Used resource-based URLs and HATEOAS links.", SubmittedAt = new DateTime(2026, 2, 15, 22, 45, 0, DateTimeKind.Utc) },
            new AssignmentSubmission { AssignmentId = assign2.Id, StudentId = stu1.Id, Content = "JWT implementation with access + refresh tokens. Used BCrypt for password hashing. GitHub repo: https://github.com/alice/jwt-lab", SubmittedAt = new DateTime(2026, 2, 21, 14, 0, 0, DateTimeKind.Utc), Score = 92, Feedback = "Great implementation! Token rotation is well done." },
            new AssignmentSubmission { AssignmentId = assign4.Id, StudentId = stu1.Id, Content = "E-commerce schema with Users, Products, Orders, OrderItems, Reviews tables. All in 3NF.", SubmittedAt = new DateTime(2026, 2, 17, 20, 15, 0, DateTimeKind.Utc) },
            new AssignmentSubmission { AssignmentId = assign4.Id, StudentId = stu4.Id, Content = "My schema includes: Customers, Products, Categories, Orders, Payments. ER diagram attached.", SubmittedAt = new DateTime(2026, 2, 18, 11, 30, 0, DateTimeKind.Utc) }
        );
    }
    else
    {
        // Backward compatibility for any existing plain-text seeded passwords.
        var usersNeedingHashUpgrade = db.AppUsers
            .Where(u => !u.PasswordHash.StartsWith("$2"))
            .ToList();

        foreach (var user in usersNeedingHashUpgrade)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        }
    }

    db.SaveChanges();

    RecurringJob.AddOrUpdate<CleanupJob>(
        "cleanup-expired-refresh-tokens",
        job => job.CleanupExpiredRefreshTokensAsync(),
        Cron.Hourly);

    var cleanupJob = scope.ServiceProvider.GetRequiredService<CleanupJob>();
    await cleanupJob.CleanupExpiredRefreshTokensAsync();
}

app.Run();