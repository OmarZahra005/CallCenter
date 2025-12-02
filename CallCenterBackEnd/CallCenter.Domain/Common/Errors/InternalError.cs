namespace CallCenter.Domain.Common.Errors;

public class InternalError : Error
{
    public string? Details { get; }
    
    public InternalError(string localizedMessage, string? details = null)
        : base("INTERNAL_ERROR", localizedMessage, ErrorType.InternalError)
    {
        Details = details;
    }
}