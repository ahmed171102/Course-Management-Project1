using CourseManagement.Api.DTOs;
namespace CourseManagement.Api.Interfaces;

public interface IInstructorService
{
    Task<InstructorResponseDTO?> GetInstructorByIdAsync(int id);
    Task<IEnumerable<InstructorResponseDTO>> GetAllInstructorsAsync(int pageNumber = 1, int pageSize = 20);
    Task<InstructorResponseDTO> CreateInstructorAsync(CreateInstructorDTO createDto);
    Task<bool> UpdateInstructorAsync(int id, UpdateInstructorDTO updateDto);
    Task<bool> DeleteInstructorAsync(int id);
}
