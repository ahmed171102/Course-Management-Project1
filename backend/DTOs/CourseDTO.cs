using System.ComponentModel.DataAnnotations;
namespace CourseManagement.Api.DTOs;

public class CreateCourseDTO
{
    [Required]
    [MaxLength(200)]
    [MinLength(3)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Range(1, 10)]
    public int Credits { get; set; }

    [Required]
    public int InstructorId { get; set; }
}

public class UpdateCourseDTO
{
    [Required]
    [MaxLength(200)]
    [MinLength(3)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Range(1, 10)]
    public int Credits { get; set; }

    [Required]
    public int InstructorId { get; set; }
}

public class CourseResponseDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Credits { get; set; }
    public int InstructorId { get; set; }
    public InstructorInfoDTO? Instructor { get; set; }
    public ICollection<EnrollmentResponseDTO> Enrollments { get; set; } = new List<EnrollmentResponseDTO>();
}

public class InstructorInfoDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
