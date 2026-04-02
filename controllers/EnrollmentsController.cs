using CourseManagement.Api.Data;
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
    public async Task<ActionResult<IEnumerable<Enrollment>>> GetEnrollments()
    {
        return await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .ToListAsync();
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<IEnumerable<Enrollment>>> GetStudentEnrollments(int studentId)
    {
        return await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .Include(e => e.Course)
            .ToListAsync();
    }

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<IEnumerable<Enrollment>>> GetCourseEnrollments(int courseId)
    {
        return await _context.Enrollments
            .Where(e => e.CourseId == courseId)
            .Include(e => e.Student)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Enrollment>> CreateEnrollment(Enrollment enrollment)
    {
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
}
