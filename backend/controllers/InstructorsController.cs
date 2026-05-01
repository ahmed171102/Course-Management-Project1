using CourseManagement.Api.DTOs;
using CourseManagement.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InstructorsController : ControllerBase
{
    private readonly IInstructorService _instructorService;

    public InstructorsController(IInstructorService instructorService)
    {
        _instructorService = instructorService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<IEnumerable<InstructorResponseDTO>>> GetInstructors([FromQuery] PaginationQueryDTO pagination)
    {
        var instructors = await _instructorService.GetAllInstructorsAsync(pagination.PageNumber, pagination.PageSize);
        return Ok(instructors);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Instructor,User")]
    public async Task<ActionResult<InstructorResponseDTO>> GetInstructor(int id)
    {
        var instructor = await _instructorService.GetInstructorByIdAsync(id);

        if (instructor == null)
        {
            return NotFound();
        }

        return Ok(instructor);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InstructorResponseDTO>> CreateInstructor(CreateInstructorDTO createDto)
    {
        var created = await _instructorService.CreateInstructorAsync(createDto);
        return CreatedAtAction(nameof(GetInstructor), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateInstructor(int id, UpdateInstructorDTO updateDto)
    {
        var updated = await _instructorService.UpdateInstructorAsync(id, updateDto);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteInstructor(int id)
    {
        var deleted = await _instructorService.DeleteInstructorAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
