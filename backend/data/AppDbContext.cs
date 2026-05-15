using Microsoft.EntityFrameworkCore;
using CourseManagement.Api.Models.Entities;

namespace CourseManagement.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<InstructorProfile> InstructorProfiles => Set<InstructorProfile>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1-1 Instructor <-> InstructorProfile
        modelBuilder.Entity<Instructor>()
            .HasOne(i => i.Profile)
            .WithOne(p => p.Instructor)
            .HasForeignKey<InstructorProfile>(p => p.InstructorId);

        // 1-many Instructor -> Courses
        modelBuilder.Entity<Course>()
            .HasOne(c => c.Instructor)
            .WithMany(i => i.Courses)
            .HasForeignKey(c => c.InstructorId);

        // many-many Student <-> Course via Enrollment
        modelBuilder.Entity<Enrollment>()
            .HasKey(e => new { e.StudentId, e.CourseId });

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(e => e.StudentId);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId);

        // Optional uniqueness constraints
        modelBuilder.Entity<Instructor>().HasIndex(i => i.Email).IsUnique();
        modelBuilder.Entity<Student>().HasIndex(s => s.Email).IsUnique();
        modelBuilder.Entity<AppUser>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<RefreshToken>().HasIndex(rt => rt.Token).IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.AppUser)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filters for soft deletion
        modelBuilder.Entity<Instructor>().HasQueryFilter(i => i.IsActive);
        modelBuilder.Entity<Student>().HasQueryFilter(s => s.IsActive);
        modelBuilder.Entity<Course>().HasQueryFilter(c => c.IsActive);
        modelBuilder.Entity<AppUser>().HasQueryFilter(u => u.IsActive);

        // Course Modules -> Assignments -> Submissions relations
        modelBuilder.Entity<CourseModule>()
            .HasOne(m => m.Course)
            .WithMany(c => c.Modules)
            .HasForeignKey(m => m.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.CourseModule)
            .WithMany(m => m.Assignments)
            .HasForeignKey(a => a.CourseModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AssignmentSubmission>()
            .HasOne(s => s.Assignment)
            .WithMany(a => a.Submissions)
            .HasForeignKey(s => s.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AssignmentSubmission>()
            .HasOne(s => s.Student)
            .WithMany()
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}