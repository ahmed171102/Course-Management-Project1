using System.ComponentModel.DataAnnotations;
namespace CourseManagement.Api.DTOs;

public class LoginDTO
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDTO
{
    [System.Text.Json.Serialization.JsonIgnore]
    public string Token { get; set; } = string.Empty;
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