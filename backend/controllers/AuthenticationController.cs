using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using CourseManagement.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppAuthorizationService = CourseManagement.Api.Interfaces.IAuthorizationService;

namespace CourseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    private readonly AppAuthorizationService _authorizationService;

    public AuthenticationController(AppAuthorizationService authorizationService)
    {
        _authorizationService = authorizationService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO dto)
    {
        var result = await _authorizationService.LoginAsync(dto);
        if (result is null)
        {
            return Unauthorized("Invalid username or password.");
        }

        Response.Headers.Append("Authorization", $"Bearer {result.Token}");

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("register")]
    public async Task<ActionResult<LoginResponseDTO>> Register([FromBody] RegisterDTO dto)
    {
        var result = await _authorizationService.RegisterAsync(dto);
        if (result is null)
        {
            return Conflict("Username already exists.");
        }

        Response.Headers.Append("Authorization", $"Bearer {result.Token}");

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponseDTO>> Refresh([FromBody] RefreshTokenRequestDTO dto)
    {
        var result = await _authorizationService.RefreshTokenAsync(dto);
        if (result is null)
        {
            return Unauthorized("Invalid or expired refresh token.");
        }

        Response.Headers.Append("Authorization", $"Bearer {result.Token}");

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] RevokeTokenRequestDTO dto)
    {
        var revoked = await _authorizationService.RevokeRefreshTokenAsync(dto);
        if (!revoked)
        {
            return NotFound("Refresh token not found.");
        }

        return NoContent();
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromServices] AppDbContext context, [FromBody] ChangePasswordDTO dto)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username)) return Unauthorized();

        var user = await context.AppUsers.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest("Incorrect current password.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully." });
    }
}