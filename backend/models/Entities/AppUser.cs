namespace CourseManagement.Api.Models.Entities;

public class AppUser
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public bool IsActive { get; set; } = true;
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}