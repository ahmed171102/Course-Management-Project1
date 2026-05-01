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
            .AllowAnyHeader();
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

builder.Services.AddControllers();
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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
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

    if (!db.AppUsers.Any())
    {
        db.AppUsers.AddRange(
            new AppUser
            {
                Id = Guid.NewGuid().ToString("N"),
                Username = "admin",
                Email = "admin@course.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin"
            },
            new AppUser
            {
                Id = Guid.NewGuid().ToString("N"),
                Username = "instructor1",
                Email = "instructor1@course.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("inst123"),
                Role = "Instructor"
            },
            new AppUser
            {
                Id = Guid.NewGuid().ToString("N"),
                Username = "user1",
                Email = "user1@course.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                Role = "User"
            }
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