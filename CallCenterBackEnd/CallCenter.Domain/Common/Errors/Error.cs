namespace CallCenter.Domain.Common.Errors;

public abstract class Error
{
    public string Code { get; }
    public string Message { get; }
    public ErrorType Type { get; }
    
    protected Error(string code, string message, ErrorType type)
    {
        Code = code;
        Message = message;
        Type = type;
    }
}