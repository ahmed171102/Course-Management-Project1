using CourseManagement.Api.Data;
using CourseManagement.Api.DTOs;
using CourseManagement.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CoursesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetCourses()
    {
        var courses = await _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Enrollments)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Credits,
                c.InstructorId,
                Instructor = c.Instructor == null ? null : new { c.Instructor.Id, c.Instructor.Name, c.Instructor.Email },
                EnrollmentCount = c.Enrollments.Count,
                Enrollments = c.Enrollments.Select(e => new { e.StudentId, e.CourseId, e.EnrollmentDate })
            })
            .ToListAsync();

        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetCourse(int id)
    {
        var course = await _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Enrollments)
                .ThenInclude(e => e.Student)
            .Where(c => c.Id == id)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Credits,
                c.InstructorId,
                Instructor = c.Instructor == null ? null : new { c.Instructor.Id, c.Instructor.Name, c.Instructor.Email },
                EnrollmentCount = c.Enrollments.Count,
                Enrollments = c.Enrollments.Select(e => new
                {
                    e.StudentId,
                    e.CourseId,
                    e.EnrollmentDate,
                    Student = new { e.Student.Id, e.Student.FullName, e.Student.Email }
                })
            })
            .FirstOrDefaultAsync();

        if (course == null)
            return NotFound();

        return Ok(course);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateCourse(CreateCourseDTO dto)
    {
        var course = new Course
        {
            Title = dto.Title,
            Credits = dto.Credits,
            InstructorId = dto.InstructorId
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        // Reload with Instructor included so the response has instructor name
        await _context.Entry(course).Reference(c => c.Instructor).LoadAsync();

        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, new
        {
            course.Id,
            course.Title,
            course.Credits,
            course.InstructorId,
            Instructor = course.Instructor == null ? null : new { course.Instructor.Id, course.Instructor.Name, course.Instructor.Email },
            EnrollmentCount = 0
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> UpdateCourse(int id, UpdateCourseDTO dto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound();

        var isInstructor = User.IsInRole("Instructor");
        if (isInstructor)
        {
            var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == User.Identity.Name);
            if (appUser == null) return Unauthorized();

            var instructorEntity = await _context.Instructors.FirstOrDefaultAsync(i => i.Id == course.InstructorId);
            if (instructorEntity == null || instructorEntity.Email != appUser.Email)
            {
                return Forbid();
            }

            // Instructors cannot change the instructorId
            if (dto.InstructorId != course.InstructorId)
            {
                return BadRequest("Instructors cannot reassign courses to other instructors.");
            }
        }

        course.Title = dto.Title;
        course.Credits = dto.Credits;
        course.InstructorId = dto.InstructorId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound();

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
