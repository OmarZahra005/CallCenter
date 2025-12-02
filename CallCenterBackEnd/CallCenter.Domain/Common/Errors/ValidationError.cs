namespace CallCenter.Domain.Common.Errors;

public class ValidationError : Error
{
    public Dictionary<string, string[]> Errors { get; }
    
    public ValidationError(Dictionary<string, string[]> errors, string localizedMessage) 
        : base("VALIDATION_ERROR", localizedMessage, ErrorType.Validation)
    {
        Errors = errors;
    }
}