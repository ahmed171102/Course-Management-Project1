using CourseManagement.Api.Data;
using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using CourseManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Services;

public class StudentService : IStudentService
{
    private readonly AppDbContext _context;

    public StudentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<StudentResponseDTO?> GetStudentByIdAsync(int id)
    {
        return await _context.Students
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new StudentResponseDTO
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email,
                Enrollments = s.Enrollments.Select(e => new EnrollmentResponseDTO
                {
                    StudentId = e.StudentId,
                    CourseId = e.CourseId,
                    EnrollmentDate = e.EnrollmentDate,
                    Course = new EnrollmentCourseDTO
                    {
                        Id = e.Course.Id,
                        Title = e.Course.Title,
                        Credits = e.Course.Credits,
                        InstructorId = e.Course.InstructorId
                    }
                }).ToList()
            })
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<StudentResponseDTO>> GetAllStudentsAsync(int pageNumber = 1, int pageSize = 20)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        return await _context.Students
            .AsNoTracking()
            .OrderBy(s => s.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new StudentResponseDTO
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email,
                Enrollments = s.Enrollments.Select(e => new EnrollmentResponseDTO
                {
                    StudentId = e.StudentId,
                    CourseId = e.CourseId,
                    EnrollmentDate = e.EnrollmentDate,
                    Course = new EnrollmentCourseDTO
                    {
                        Id = e.Course.Id,
                        Title = e.Course.Title,
                        Credits = e.Course.Credits,
                        InstructorId = e.Course.InstructorId
                    }
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<StudentResponseDTO> CreateStudentAsync(CreateStudentDTO createDto)
    {
        var student = new Student
        {
            FullName = createDto.FullName,
            Email = createDto.Email
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return new StudentResponseDTO
        {
            Id = student.Id,
            FullName = student.FullName,
            Email = student.Email,
            Enrollments = new List<EnrollmentResponseDTO>()
        };
    }

    public async Task<bool> UpdateStudentAsync(int id, UpdateStudentDTO updateDto)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == id);
        if (student == null)
        {
            return false;
        }

        student.FullName = updateDto.FullName;
        student.Email = updateDto.Email;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteStudentAsync(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
        {
            return false;
        }

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();
        return true;
    }

}
