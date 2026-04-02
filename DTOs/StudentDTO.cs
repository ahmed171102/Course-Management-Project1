using System.ComponentModel.DataAnnotations;
namespace CourseManagement.Api.DTOs;

public class CreateStudentDTO
{
    [Required]
    [MaxLength(100)]
    [MinLength(2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;
}

public class UpdateStudentDTO
{
    [Required]
    [MaxLength(100)]
    [MinLength(2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;
}

public class StudentResponseDTO
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ICollection<EnrollmentResponseDTO> Enrollments { get; set; } = new List<EnrollmentResponseDTO>();
}

public class StudentBasicDTO
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
