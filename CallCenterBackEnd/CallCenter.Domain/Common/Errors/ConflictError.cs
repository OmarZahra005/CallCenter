namespace CallCenter.Domain.Common.Errors;

public class ConflictError : Error
{
    public ConflictError(string localizedMessage)
        : base("CONFLICT", localizedMessage, ErrorType.Conflict)
    {
    }
}