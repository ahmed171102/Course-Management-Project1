namespace CourseManagement.Api.Models.Entities;

public class Instructor
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public InstructorProfile? Profile { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}