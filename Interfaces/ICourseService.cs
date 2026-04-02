using CourseManagement.Api.DTOs;
namespace CourseManagement.Api.Interfaces;

public interface ICourseService
{
    Task<CourseResponseDTO?> GetCourseByIdAsync(int id);
    Task<IEnumerable<CourseResponseDTO>> GetAllCoursesAsync(int pageNumber = 1, int pageSize = 20);
    Task<CourseResponseDTO> CreateCourseAsync(CreateCourseDTO createDto);
    Task<bool> UpdateCourseAsync(int id, UpdateCourseDTO updateDto);
    Task<bool> DeleteCourseAsync(int id);
}
