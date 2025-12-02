namespace CallCenter.Domain.Common.Errors;

public class UnauthorizedError : Error
{
    public UnauthorizedError(string localizedMessage)
        : base("UNAUTHORIZED", localizedMessage, ErrorType.Unauthorized)
    {
    }
}