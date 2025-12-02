namespace CallCenter.Domain.Common.Errors;

public class NotFoundError : Error
{
    public string EntityName { get; }
    public object Key { get; }
    
    public NotFoundError(string entityName, string localizedMessage, object key)
        : base("NOT_FOUND", localizedMessage, ErrorType.NotFound)
    {
        EntityName = entityName;
        Key = key;
    }
}