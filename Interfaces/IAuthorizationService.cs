using CourseManagement.Api.DTOs;
namespace CourseManagement.Api.Interfaces;

public interface IAuthorizationService
{
    Task<LoginResponseDTO?> LoginAsync(LoginDTO loginDto);
    Task<LoginResponseDTO?> RefreshTokenAsync(RefreshTokenRequestDTO request);
    Task<bool> RevokeRefreshTokenAsync(RevokeTokenRequestDTO request);
}
