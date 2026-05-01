using CourseManagement.Api.Data;
using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using CourseManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Services;

public class InstructorService : IInstructorService
{
    private readonly AppDbContext _context;

    public InstructorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InstructorResponseDTO?> GetInstructorByIdAsync(int id)
    {
        return await _context.Instructors
            .AsNoTracking()
            .Where(i => i.Id == id)
            .Select(i => new InstructorResponseDTO
            {
                Id = i.Id,
                Name = i.Name,
                Email = i.Email,
                Profile = i.Profile == null
                    ? null
                    : new InstructorProfileDTO
                    {
                        Bio = i.Profile.Bio,
                        OfficeLocation = i.Profile.OfficeLocation
                    },
                Courses = i.Courses.Select(c => new InstructorCourseDTO
                {
                    Id = c.Id,
                    Title = c.Title,
                    Credits = c.Credits
                }).ToList()
            })
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<IEnumerable<InstructorResponseDTO>> GetAllInstructorsAsync(int pageNumber = 1, int pageSize = 20)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        return await _context.Instructors
            .AsNoTracking()
            .OrderBy(i => i.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InstructorResponseDTO
            {
                Id = i.Id,
                Name = i.Name,
                Email = i.Email,
                Profile = i.Profile == null
                    ? null
                    : new InstructorProfileDTO
                    {
                        Bio = i.Profile.Bio,
                        OfficeLocation = i.Profile.OfficeLocation
                    },
                Courses = i.Courses.Select(c => new InstructorCourseDTO
                {
                    Id = c.Id,
                    Title = c.Title,
                    Credits = c.Credits
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<InstructorResponseDTO> CreateInstructorAsync(CreateInstructorDTO createDto)
    {
        var instructor = new Instructor
        {
            Name = createDto.Name,
            Email = createDto.Email,
            Profile = new InstructorProfile
            {
                Bio = createDto.Bio,
                OfficeLocation = createDto.OfficeLocation
            }
        };

        _context.Instructors.Add(instructor);
        await _context.SaveChangesAsync();

        return new InstructorResponseDTO
        {
            Id = instructor.Id,
            Name = instructor.Name,
            Email = instructor.Email,
            Profile = new InstructorProfileDTO
            {
                Bio = instructor.Profile.Bio,
                OfficeLocation = instructor.Profile.OfficeLocation
            },
            Courses = new List<InstructorCourseDTO>()
        };
    }

    public async Task<bool> UpdateInstructorAsync(int id, UpdateInstructorDTO updateDto)
    {
        var instructor = await _context.Instructors
            .Include(i => i.Profile)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instructor == null)
        {
            return false;
        }

        instructor.Name = updateDto.Name;
        instructor.Email = updateDto.Email;

        if (instructor.Profile == null)
        {
            instructor.Profile = new InstructorProfile
            {
                InstructorId = instructor.Id
            };
        }

        instructor.Profile.Bio = updateDto.Bio;
        instructor.Profile.OfficeLocation = updateDto.OfficeLocation;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteInstructorAsync(int id)
    {
        var instructor = await _context.Instructors.FindAsync(id);
        if (instructor == null)
        {
            return false;
        }

        _context.Instructors.Remove(instructor);
        await _context.SaveChangesAsync();
        return true;
    }

}
