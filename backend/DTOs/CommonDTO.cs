using System.ComponentModel.DataAnnotations;

namespace CourseManagement.Api.DTOs;

public class PaginationQueryDTO
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
}
