using CourseManagement.Api.DTOs;
namespace CourseManagement.Api.Interfaces;

public interface IStudentService
{
    Task<StudentResponseDTO?> GetStudentByIdAsync(int id);
    Task<IEnumerable<StudentResponseDTO>> GetAllStudentsAsync(int pageNumber = 1, int pageSize = 20);
    Task<StudentResponseDTO> CreateStudentAsync(CreateStudentDTO createDto);
    Task<bool> UpdateStudentAsync(int id, UpdateStudentDTO updateDto);
    Task<bool> DeleteStudentAsync(int id);
}
