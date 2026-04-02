namespace CourseManagement.Api.Models.Entities;

public class RefreshToken
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Token { get; set; } = string.Empty;
    public string AppUserId { get; set; } = string.Empty;
    public AppUser AppUser { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; }
    public bool IsRevoked { get; set; }
}
