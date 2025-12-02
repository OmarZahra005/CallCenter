namespace CallCenter.Domain.Common.Errors;

public class ForbiddenError : Error
{
    public ForbiddenError(string localizedMessage)
        : base("FORBIDDEN", localizedMessage, ErrorType.Forbidden)
    {
    }
}