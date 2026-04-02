namespace CourseManagement.Api.Models.Entities;

public class InstructorProfile
{
    [System.ComponentModel.DataAnnotations.Key]
    public int InstructorId { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string OfficeLocation { get; set; } = string.Empty;
    public Instructor Instructor { get; set; } = null!;
}