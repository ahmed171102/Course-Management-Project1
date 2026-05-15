namespace CourseManagement.Api.Models.Entities;

public class CourseModule
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int CourseId { get; set; }
    
    public Course Course { get; set; } = null!;
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
