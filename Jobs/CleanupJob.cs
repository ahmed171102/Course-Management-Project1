using CourseManagement.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Jobs;

public class CleanupJob
{
    private readonly AppDbContext _context;
    private readonly ILogger<CleanupJob> _logger;

    public CleanupJob(AppDbContext context, ILogger<CleanupJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task CleanupExpiredRefreshTokensAsync()
    {
        var now = DateTime.UtcNow;

        var expiredTokens = await _context.RefreshTokens
            .Where(rt => rt.IsRevoked || rt.ExpiresAtUtc <= now)
            .ToListAsync();

        if (expiredTokens.Count == 0)
        {
            return;
        }

        _context.RefreshTokens.RemoveRange(expiredTokens);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Removed {Count} revoked/expired refresh tokens.", expiredTokens.Count);
    }
}
