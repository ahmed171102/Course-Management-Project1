using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
}