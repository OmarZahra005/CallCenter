namespace CallCenter.Domain.Common.Errors;

public class BusinessRuleError : Error
{
    public object? Metadata { get; }
    
    public BusinessRuleError(string code, string message, object? metadata = null)
        : base(code, message, ErrorType.BusinessRule)
    {
        Metadata = metadata;
    }
}