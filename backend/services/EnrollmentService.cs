using CourseManagement.Api.Data;
using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using CourseManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly AppDbContext _context;

    public EnrollmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EnrollmentResponseDTO?> GetEnrollmentAsync(int studentId, int courseId)
    {
        return await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.StudentId == studentId && e.CourseId == courseId)
            .Select(e => new EnrollmentResponseDTO
            {
                StudentId = e.StudentId,
                CourseId = e.CourseId,
                EnrollmentDate = e.EnrollmentDate,
                Student = e.Student == null
                    ? null
                    : new StudentBasicDTO
                    {
                        Id = e.Student.Id,
                        FullName = e.Student.FullName,
                        Email = e.Student.Email
                    },
                Course = e.Course == null
                    ? null
                    : new EnrollmentCourseDTO
                    {
                        Id = e.Course.Id,
                        Title = e.Course.Title,
                        Credits = e.Course.Credits,
                        InstructorId = e.Course.InstructorId
                    }
            })
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);
    }

    public async Task<IEnumerable<EnrollmentResponseDTO>> GetAllEnrollmentsAsync(int pageNumber = 1, int pageSize = 20)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        return await _context.Enrollments
            .AsNoTracking()
            .OrderBy(e => e.StudentId)
            .ThenBy(e => e.CourseId)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EnrollmentResponseDTO
            {
                StudentId = e.StudentId,
                CourseId = e.CourseId,
                EnrollmentDate = e.EnrollmentDate,
                Student = e.Student == null
                    ? null
                    : new StudentBasicDTO
                    {
                        Id = e.Student.Id,
                        FullName = e.Student.FullName,
                        Email = e.Student.Email
                    },
                Course = e.Course == null
                    ? null
                    : new EnrollmentCourseDTO
                    {
                        Id = e.Course.Id,
                        Title = e.Course.Title,
                        Credits = e.Course.Credits,
                        InstructorId = e.Course.InstructorId
                    }
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<EnrollmentResponseDTO>> GetStudentEnrollmentsAsync(int studentId, int pageNumber = 1, int pageSize = 20)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        return await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.StudentId == studentId)
            .OrderBy(e => e.EnrollmentDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EnrollmentResponseDTO
            {
                StudentId = e.StudentId,
                CourseId = e.CourseId,
                EnrollmentDate = e.EnrollmentDate,
                Student = e.Student == null
                    ? null
                    : new StudentBasicDTO
                    {
                        Id = e.Student.Id,
                        FullName = e.Student.FullName,
                        Email = e.Student.Email
                    },
                Course = e.Course == null
                    ? null
                    : new EnrollmentCourseDTO
                    {
                        Id = e.Course.Id,
                        Title = e.Course.Title,
                        Credits = e.Course.Credits,
                        InstructorId = e.Course.InstructorId
                    }
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<EnrollmentResponseDTO>> GetCourseEnrollmentsAsync(int courseId, int pageNumber = 1, int pageSize = 20)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        return await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.CourseId == courseId)
            .OrderBy(e => e.EnrollmentDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EnrollmentResponseDTO
            {
                StudentId = e.StudentId,
                CourseId = e.CourseId,
                EnrollmentDate = e.EnrollmentDate,
                Student = e.Student == null
                    ? null
                    : new StudentBasicDTO
                    {
                        Id = e.Student.Id,
                        FullName = e.Student.FullName,
                        Email = e.Student.Email
                    },
                Course = e.Course == null
                    ? null
                    : new EnrollmentCourseDTO
                    {
                        Id = e.Course.Id,
                        Title = e.Course.Title,
                        Credits = e.Course.Credits,
                        InstructorId = e.Course.InstructorId
                    }
            })
            .ToListAsync();
    }

    public async Task<bool> CreateEnrollmentAsync(CreateEnrollmentDTO createDto)
    {
        var studentExists = await _context.Students.AnyAsync(s => s.Id == createDto.StudentId);
        var courseExists = await _context.Courses.AnyAsync(c => c.Id == createDto.CourseId);
        if (!studentExists || !courseExists)
        {
            return false;
        }

        var alreadyEnrolled = await _context.Enrollments.AnyAsync(e =>
            e.StudentId == createDto.StudentId && e.CourseId == createDto.CourseId);
        if (alreadyEnrolled)
        {
            return false;
        }

        var enrollment = new Enrollment
        {
            StudentId = createDto.StudentId,
            CourseId = createDto.CourseId,
            EnrollmentDate = DateTime.UtcNow
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteEnrollmentAsync(int studentId, int courseId)
    {
        var enrollment = await _context.Enrollments.FindAsync(studentId, courseId);
        if (enrollment == null)
        {
            return false;
        }

        _context.Enrollments.Remove(enrollment);
        await _context.SaveChangesAsync();
        return true;
    }

}
