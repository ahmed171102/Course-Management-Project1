using System.ComponentModel.DataAnnotations;
namespace CourseManagement.Api.DTOs;

public class LoginDTO
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterDTO
{
    [Required]
    [MinLength(3)]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Role must be one of: Admin, Instructor, User (Student).
    /// Defaults to User if not provided.
    /// </summary>
    public string Role { get; set; } = "User";
}

public class LoginResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime RefreshTokenExpires { get; set; }
}

public class RefreshTokenRequestDTO
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class RevokeTokenRequestDTO
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class ChangePasswordDTO
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}