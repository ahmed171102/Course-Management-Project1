using System.ComponentModel.DataAnnotations;
namespace CourseManagement.Api.DTOs;

public class CreateEnrollmentDTO
{
    [Required]
    [Range(1, int.MaxValue)]
    public int StudentId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int CourseId { get; set; }
}

public class EnrollmentResponseDTO
{
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public DateTime EnrollmentDate { get; set; }
    public StudentBasicDTO? Student { get; set; }
    public EnrollmentCourseDTO? Course { get; set; }
}

public class EnrollmentCourseDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Credits { get; set; }
    public int InstructorId { get; set; }
}
