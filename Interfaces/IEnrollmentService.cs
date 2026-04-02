using CourseManagement.Api.DTOs;
namespace CourseManagement.Api.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentResponseDTO?> GetEnrollmentAsync(int studentId, int courseId);
    Task<IEnumerable<EnrollmentResponseDTO>> GetAllEnrollmentsAsync(int pageNumber = 1, int pageSize = 20);
    Task<IEnumerable<EnrollmentResponseDTO>> GetStudentEnrollmentsAsync(int studentId, int pageNumber = 1, int pageSize = 20);
    Task<IEnumerable<EnrollmentResponseDTO>> GetCourseEnrollmentsAsync(int courseId, int pageNumber = 1, int pageSize = 20);
    Task<bool> CreateEnrollmentAsync(CreateEnrollmentDTO createDto);
    Task<bool> DeleteEnrollmentAsync(int studentId, int courseId);
}
