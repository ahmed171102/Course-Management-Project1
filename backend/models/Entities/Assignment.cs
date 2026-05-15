namespace CourseManagement.Api.Models.Entities;

public class Assignment
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int MaxScore { get; set; } = 100;
    
    public int CourseModuleId { get; set; }
    public CourseModule CourseModule { get; set; } = null!;
    
    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
}
