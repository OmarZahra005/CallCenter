namespace CallCenter.Domain.Common.Errors;

public enum ErrorType
{
    Validation,
    BusinessRule,
    NotFound,
    Unauthorized,
    Forbidden,
    Conflict,
    InternalError
}