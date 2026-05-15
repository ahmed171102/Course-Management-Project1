using CourseManagement.Api.Data;
using CourseManagement.Api.DTOs;
using CourseManagement.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrollmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EnrollmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetEnrollments()
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Select(e => new
            {
                e.StudentId,
                e.CourseId,
                e.EnrollmentDate,
                Student = new { e.Student.Id, e.Student.FullName, e.Student.Email },
                Course = new { e.Course.Id, e.Course.Title, e.Course.Credits }
            })
            .ToListAsync();

        return Ok(enrollments);
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult> GetStudentEnrollments(int studentId)
    {
        var enrollments = await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .Include(e => e.Course)
            .Select(e => new
            {
                e.StudentId,
                e.CourseId,
                e.EnrollmentDate,
                Course = new { e.Course.Id, e.Course.Title, e.Course.Credits }
            })
            .ToListAsync();

        return Ok(enrollments);
    }

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult> GetCourseEnrollments(int courseId)
    {
        var enrollments = await _context.Enrollments
            .Where(e => e.CourseId == courseId)
            .Include(e => e.Student)
            .Select(e => new
            {
                e.StudentId,
                e.CourseId,
                e.EnrollmentDate,
                Student = new { e.Student.Id, e.Student.FullName, e.Student.Email }
            })
            .ToListAsync();

        return Ok(enrollments);
    }

    [HttpPost]
    public async Task<ActionResult<Enrollment>> CreateEnrollment(CreateEnrollmentDTO dto)
    {
        var enrollment = new Enrollment
        {
            StudentId = dto.StudentId,
            CourseId = dto.CourseId,
            EnrollmentDate = DateTime.UtcNow
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetEnrollments), enrollment);
    }

    [HttpDelete("{studentId}/{courseId}")]
    public async Task<IActionResult> DeleteEnrollment(int studentId, int courseId)
    {
        var enrollment = await _context.Enrollments.FindAsync(studentId, courseId);
        if (enrollment == null)
            return NotFound();

        _context.Enrollments.Remove(enrollment);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("self-enroll/{courseId}")]
    public async Task<ActionResult> SelfEnroll(int courseId)
    {
        var username = User.Identity?.Name;
        var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == username);
        if (appUser == null) return Unauthorized();

        var student = await _context.Students.FirstOrDefaultAsync(s => s.Email == appUser.Email);
        if (student == null) return NotFound("Student profile not found.");

        var alreadyEnrolled = await _context.Enrollments.AnyAsync(e => e.StudentId == student.Id && e.CourseId == courseId);
        if (alreadyEnrolled) return Conflict("Already enrolled.");

        _context.Enrollments.Add(new Enrollment { StudentId = student.Id, CourseId = courseId, EnrollmentDate = DateTime.UtcNow });
        await _context.SaveChangesAsync();
        return Ok();
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("self-drop/{courseId}")]
    public async Task<ActionResult> SelfDrop(int courseId)
    {
        var username = User.Identity?.Name;
        var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == username);
        if (appUser == null) return Unauthorized();

        var student = await _context.Students.FirstOrDefaultAsync(s => s.Email == appUser.Email);
        if (student == null) return NotFound("Student profile not found.");

        var enrollment = await _context.Enrollments.FindAsync(student.Id, courseId);
        if (enrollment == null) return NotFound("Not enrolled.");

        _context.Enrollments.Remove(enrollment);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
