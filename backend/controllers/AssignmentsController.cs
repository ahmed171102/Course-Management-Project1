using CourseManagement.Api.Data;
using CourseManagement.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Controllers;

[ApiController]
[Route("api")]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("modules/{moduleId}/assignments")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult> CreateAssignment(int moduleId, [FromBody] Assignment dto)
    {
        var module = await _context.CourseModules.Include(m => m.Course).FirstOrDefaultAsync(m => m.Id == moduleId);
        if (module == null) return NotFound("Module not found");

        var isInstructor = User.IsInRole("Instructor");
        if (isInstructor)
        {
            var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == User.Identity.Name);
            var instructor = await _context.Instructors.FirstOrDefaultAsync(i => i.Id == module.Course.InstructorId);
            if (appUser == null || instructor == null || instructor.Email != appUser.Email) return Forbid();
        }

        var assignment = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            MaxScore = dto.MaxScore,
            CourseModuleId = moduleId
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();
        return Ok(assignment);
    }

    [HttpDelete("assignments/{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var assignment = await _context.Assignments.Include(a => a.CourseModule).ThenInclude(m => m.Course).FirstOrDefaultAsync(a => a.Id == id);
        if (assignment == null) return NotFound();

        var isInstructor = User.IsInRole("Instructor");
        if (isInstructor)
        {
            var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == User.Identity.Name);
            var instructor = await _context.Instructors.FirstOrDefaultAsync(i => i.Id == assignment.CourseModule.Course.InstructorId);
            if (appUser == null || instructor == null || instructor.Email != appUser.Email) return Forbid();
        }

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("assignments/{id}/submit")]
    [Authorize(Roles = "User,Student")]
    public async Task<ActionResult> SubmitAssignment(int id, [FromBody] AssignmentSubmission dto)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound("Assignment not found");

        var username = User.Identity?.Name;
        var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == username);
        var student = await _context.Students.FirstOrDefaultAsync(s => s.Email == appUser.Email);
        if (student == null) return Unauthorized("Student profile not found.");

        var submission = await _context.AssignmentSubmissions.FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == student.Id);
        if (submission != null)
        {
            submission.Content = dto.Content;
            submission.SubmittedAt = DateTime.UtcNow;
        }
        else
        {
            submission = new AssignmentSubmission
            {
                AssignmentId = id,
                StudentId = student.Id,
                Content = dto.Content,
                SubmittedAt = DateTime.UtcNow
            };
            _context.AssignmentSubmissions.Add(submission);
        }

        await _context.SaveChangesAsync();
        return Ok(new { submission.Id, submission.Content, submission.SubmittedAt });
    }

    [HttpGet("assignments/{id}/submissions")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult> GetSubmissions(int id)
    {
        var submissions = await _context.AssignmentSubmissions
            .Where(s => s.AssignmentId == id)
            .Include(s => s.Student)
            .Select(s => new {
                s.Id, s.Content, s.SubmittedAt, s.Score, s.Feedback,
                Student = new { s.Student.Id, s.Student.FullName, s.Student.Email }
            })
            .ToListAsync();
        return Ok(submissions);
    }

    [HttpPut("submissions/{id}/grade")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult> GradeSubmission(int id, [FromBody] AssignmentSubmission dto)
    {
        var submission = await _context.AssignmentSubmissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.CourseModule)
            .ThenInclude(m => m.Course)
            .FirstOrDefaultAsync(s => s.Id == id);
            
        if (submission == null) return NotFound();

        var isInstructor = User.IsInRole("Instructor");
        if (isInstructor)
        {
            var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == User.Identity.Name);
            var instructor = await _context.Instructors.FirstOrDefaultAsync(i => i.Id == submission.Assignment.CourseModule.Course.InstructorId);
            if (appUser == null || instructor == null || instructor.Email != appUser.Email) return Forbid();
        }

        submission.Score = dto.Score;
        submission.Feedback = dto.Feedback;
        await _context.SaveChangesAsync();

        return Ok(new { submission.Id, submission.Score, submission.Feedback });
    }
}
