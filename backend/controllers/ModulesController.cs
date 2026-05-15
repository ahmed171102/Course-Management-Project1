using CourseManagement.Api.Data;
using CourseManagement.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CourseManagement.Api.Controllers;

[ApiController]
[Route("api/courses/{courseId}/modules")]
public class ModulesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ModulesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetCourseModules(int courseId)
    {
        var modules = await _context.CourseModules
            .Where(m => m.CourseId == courseId)
            .OrderBy(m => m.OrderIndex)
            .Include(m => m.Assignments)
            .Select(m => new {
                m.Id, m.Title, m.Description, m.OrderIndex, m.CourseId,
                Assignments = m.Assignments.Select(a => new { a.Id, a.Title, a.DueDate, a.MaxScore })
            })
            .ToListAsync();
            
        return Ok(modules);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult> CreateModule(int courseId, [FromBody] CourseModule dto)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound("Course not found");

        var isInstructor = User.IsInRole("Instructor");
        if (isInstructor)
        {
            var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == User.Identity.Name);
            var instructor = await _context.Instructors.FirstOrDefaultAsync(i => i.Id == course.InstructorId);
            if (appUser == null || instructor == null || instructor.Email != appUser.Email) return Forbid();
        }

        var module = new CourseModule
        {
            Title = dto.Title,
            Description = dto.Description,
            OrderIndex = dto.OrderIndex,
            CourseId = courseId
        };

        _context.CourseModules.Add(module);
        await _context.SaveChangesAsync();
        return Ok(module);
    }
}

[ApiController]
[Route("api/modules")]
[Authorize(Roles = "Admin,Instructor")]
public class ModuleActionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ModuleActionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteModule(int id)
    {
        var module = await _context.CourseModules.Include(m => m.Course).FirstOrDefaultAsync(m => m.Id == id);
        if (module == null) return NotFound();

        var isInstructor = User.IsInRole("Instructor");
        if (isInstructor)
        {
            var appUser = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == User.Identity.Name);
            var instructor = await _context.Instructors.FirstOrDefaultAsync(i => i.Id == module.Course.InstructorId);
            if (appUser == null || instructor == null || instructor.Email != appUser.Email) return Forbid();
        }

        _context.CourseModules.Remove(module);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
