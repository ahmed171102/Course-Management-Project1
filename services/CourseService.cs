using CourseManagement.Api.Data;
using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using CourseManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Services;

public class CourseService : ICourseService
{
    private readonly AppDbContext _context;

    public CourseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CourseResponseDTO?> GetCourseByIdAsync(int id)
    {
        return await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CourseResponseDTO
            {
                Id = c.Id,
                Title = c.Title,
                Credits = c.Credits,
                InstructorId = c.InstructorId,
                Instructor = c.Instructor == null
                    ? null
                    : new InstructorInfoDTO
                    {
                        Id = c.Instructor.Id,
                        Name = c.Instructor.Name,
                        Email = c.Instructor.Email
                    },
                Enrollments = c.Enrollments.Select(e => new EnrollmentResponseDTO
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
                        }
                }).ToList()
            })
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<CourseResponseDTO>> GetAllCoursesAsync(int pageNumber = 1, int pageSize = 20)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        return await _context.Courses
            .AsNoTracking()
            .OrderBy(c => c.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CourseResponseDTO
            {
                Id = c.Id,
                Title = c.Title,
                Credits = c.Credits,
                InstructorId = c.InstructorId,
                Instructor = c.Instructor == null
                    ? null
                    : new InstructorInfoDTO
                    {
                        Id = c.Instructor.Id,
                        Name = c.Instructor.Name,
                        Email = c.Instructor.Email
                    },
                Enrollments = c.Enrollments.Select(e => new EnrollmentResponseDTO
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
                        }
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<CourseResponseDTO> CreateCourseAsync(CreateCourseDTO createDto)
    {
        var instructorExists = await _context.Instructors.AnyAsync(i => i.Id == createDto.InstructorId);
        if (!instructorExists)
        {
            throw new InvalidOperationException("Instructor not found.");
        }

        var course = new Course
        {
            Title = createDto.Title,
            Credits = createDto.Credits,
            InstructorId = createDto.InstructorId
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == course.Id)
            .Select(c => new CourseResponseDTO
            {
                Id = c.Id,
                Title = c.Title,
                Credits = c.Credits,
                InstructorId = c.InstructorId,
                Instructor = c.Instructor == null
                    ? null
                    : new InstructorInfoDTO
                    {
                        Id = c.Instructor.Id,
                        Name = c.Instructor.Name,
                        Email = c.Instructor.Email
                    },
                Enrollments = c.Enrollments.Select(e => new EnrollmentResponseDTO
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
                        }
                }).ToList()
            })
            .FirstAsync(c => c.Id == course.Id);
    }

    public async Task<bool> UpdateCourseAsync(int id, UpdateCourseDTO updateDto)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id);
        if (course == null)
        {
            return false;
        }

        var instructorExists = await _context.Instructors.AnyAsync(i => i.Id == updateDto.InstructorId);
        if (!instructorExists)
        {
            return false;
        }

        course.Title = updateDto.Title;
        course.Credits = updateDto.Credits;
        course.InstructorId = updateDto.InstructorId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCourseAsync(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
        {
            return false;
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return true;
    }

}
