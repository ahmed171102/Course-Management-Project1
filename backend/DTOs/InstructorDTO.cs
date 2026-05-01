using System.ComponentModel.DataAnnotations;
namespace CourseManagement.Api.DTOs;

public class CreateInstructorDTO
{
    [Required]
    [MaxLength(100)]
    [MinLength(2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Bio { get; set; } = string.Empty;

    [MaxLength(100)]
    public string OfficeLocation { get; set; } = string.Empty;
}

public class UpdateInstructorDTO
{
    [Required]
    [MaxLength(100)]
    [MinLength(2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;


    public string Bio { get; set; } = string.Empty;
    public string OfficeLocation { get; set; } = string.Empty;
}

public class InstructorResponseDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public InstructorProfileDTO? Profile { get; set; }
    public ICollection<InstructorCourseDTO> Courses { get; set; } = new List<InstructorCourseDTO>();
}

public class InstructorProfileDTO
{
    public string Bio { get; set; } = string.Empty;
    public string OfficeLocation { get; set; } = string.Empty;
}

public class InstructorCourseDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Credits { get; set; }
}
