using CourseManagement.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.AppUsers
            .Select(u => new { u.Id, u.Username, u.Email, u.Role })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.AppUsers.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        if (!string.IsNullOrWhiteSpace(dto.Username))
        {
            // Check for uniqueness
            var existing = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == dto.Username && u.Id != id);
            if (existing != null) return Conflict("Username already taken.");
            
            user.Username = dto.Username;
        }

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();
        return Ok(new { user.Id, user.Username, user.Email, user.Role });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        // Get the current admin's username from the JWT claims
        var currentUsername = User.Identity?.Name;
        
        var user = await _context.AppUsers.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        // Prevent admin from deleting themselves
        if (user.Username == currentUsername)
            return BadRequest("You cannot delete your own account.");

        _context.AppUsers.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class UpdateUserDto
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}
