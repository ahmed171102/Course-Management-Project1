namespace CourseManagement.Api.Models.Entities;

public class AssignmentSubmission
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    
    public string Content { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    
    public int? Score { get; set; }
    public string Feedback { get; set; } = string.Empty;

    public Assignment Assignment { get; set; } = null!;
    public Student Student { get; set; } = null!;
}
