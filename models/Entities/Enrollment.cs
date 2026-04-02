namespace CourseManagement.Api.Models.Entities;

public class Enrollment
{
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public Student Student { get; set; } = null!;
    public Course Course { get; set; } = null!;
    public DateTime EnrollmentDate { get; set; } =DateTime.UtcNow;

    
}