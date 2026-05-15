namespace CourseManagement.Api.Models.Entities;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int InstructorId { get; set; }
    public int Credits { get; set; }
    public Instructor Instructor { get; set; } = null!;
    public bool IsActive { get; set; } = true;

    public ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
