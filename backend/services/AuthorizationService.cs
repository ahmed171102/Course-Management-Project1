using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using CourseManagement.Api.Data;
using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using CourseManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CourseManagement.Api.Services;

public class AuthorizationService : IAuthorizationService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthorizationService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDTO?> LoginAsync(LoginDTO loginDto)
    {
        var user = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null)
        {
            return null;
        }

        if (!VerifyPassword(loginDto.Password, user.PasswordHash, out var needsHashUpgrade))
        {
            return null;
        }

        if (needsHashUpgrade)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(loginDto.Password);
        }

        var expires = DateTime.UtcNow.AddHours(2);
        var refreshToken = await CreateAndSaveRefreshTokenAsync(user);

        await _context.SaveChangesAsync();

        return new LoginResponseDTO
        {
            Token = GenerateToken(user.Username, user.Role, expires),
            Role = user.Role,
            Username = user.Username,
            Email = user.Email,
            Expires = expires,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpires = refreshToken.ExpiresAtUtc
        };
    }

    public async Task<LoginResponseDTO?> RegisterAsync(RegisterDTO registerDto)
    {
        // Check if username already exists
        var existingUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Username == registerDto.Username);

        if (existingUser != null)
        {
            return null; // Username taken
        }

        // Validate role
        var validRoles = new[] { "Admin", "Instructor", "Student" };
        var role = validRoles.FirstOrDefault(r =>
            string.Equals(r, registerDto.Role, StringComparison.OrdinalIgnoreCase)) ?? "Student";

        var newUser = new AppUser
        {
            Id = Guid.NewGuid().ToString("N"),
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = role
        };

        await _context.AppUsers.AddAsync(newUser);

        if (role.Equals("Student", StringComparison.OrdinalIgnoreCase))
        {
            var existingStudent = await _context.Students.FirstOrDefaultAsync(s => s.Email == registerDto.Email);
            if (existingStudent == null)
            {
                var student = new CourseManagement.Api.Models.Entities.Student
                {
                    FullName = registerDto.Username, // default to username, can be updated later
                    Email = registerDto.Email,
                    IsActive = true
                };
                await _context.Students.AddAsync(student);
            }
        }
        else if (role.Equals("Instructor", StringComparison.OrdinalIgnoreCase))
        {
            var existingInstructor = await _context.Instructors.FirstOrDefaultAsync(i => i.Email == registerDto.Email);
            if (existingInstructor == null)
            {
                var instructor = new CourseManagement.Api.Models.Entities.Instructor
                {
                    Name = registerDto.Username,
                    Email = registerDto.Email,
                    IsActive = true
                };
                await _context.Instructors.AddAsync(instructor);
            }
        }

        var expires = DateTime.UtcNow.AddHours(2);
        var refreshToken = await CreateAndSaveRefreshTokenAsync(newUser);

        await _context.SaveChangesAsync();

        return new LoginResponseDTO
        {
            Token = GenerateToken(newUser.Username, newUser.Role, expires),
            Role = newUser.Role,
            Username = newUser.Username,
            Email = newUser.Email,
            Expires = expires,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpires = refreshToken.ExpiresAtUtc
        };
    }

    public async Task<LoginResponseDTO?> RefreshTokenAsync(RefreshTokenRequestDTO request)
    {
        var existingToken = await _context.RefreshTokens
            .Include(rt => rt.AppUser)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAtUtc <= DateTime.UtcNow)
        {
            return null;
        }

        existingToken.IsRevoked = true;

        var newRefreshToken = await CreateAndSaveRefreshTokenAsync(existingToken.AppUser);
        var accessTokenExpires = DateTime.UtcNow.AddHours(2);

        await _context.SaveChangesAsync();

        return new LoginResponseDTO
        {
            Token = GenerateToken(existingToken.AppUser.Username, existingToken.AppUser.Role, accessTokenExpires),
            Role = existingToken.AppUser.Role,
            Username = existingToken.AppUser.Username,
            Email = existingToken.AppUser.Email,
            Expires = accessTokenExpires,
            RefreshToken = newRefreshToken.Token,
            RefreshTokenExpires = newRefreshToken.ExpiresAtUtc
        };
    }

    public async Task<bool> RevokeRefreshTokenAsync(RevokeTokenRequestDTO request)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (token == null || token.IsRevoked)
        {
            return false;
        }

        token.IsRevoked = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateToken(string username, string role, DateTime expiresUtc)
    {
        var key = _configuration["Jwt:Key"];
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException("JWT settings are missing in configuration.");
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresUtc,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static bool VerifyPassword(string providedPassword, string storedHash, out bool needsHashUpgrade)
    {
        needsHashUpgrade = false;

        if (string.IsNullOrWhiteSpace(storedHash))
        {
            return false;
        }

        // Supports transition from seeded plain-text passwords to BCrypt hashes.
        if (!storedHash.StartsWith("$2", StringComparison.Ordinal))
        {
            needsHashUpgrade = string.Equals(storedHash, providedPassword, StringComparison.Ordinal);
            return needsHashUpgrade;
        }

        return BCrypt.Net.BCrypt.Verify(providedPassword, storedHash);
    }

    private async Task<RefreshToken> CreateAndSaveRefreshTokenAsync(AppUser user)
    {
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid().ToString("N"),
            AppUserId = user.Id,
            Token = GenerateRefreshTokenValue(),
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        await _context.RefreshTokens.AddAsync(refreshToken);
        return refreshToken;
    }

    private static string GenerateRefreshTokenValue()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }
}
