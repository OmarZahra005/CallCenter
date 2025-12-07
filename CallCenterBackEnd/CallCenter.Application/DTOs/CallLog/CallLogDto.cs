namespace CallCenter.Application.DTOs.CallLog;

public class CallLogDto
{
    public Guid Id { get; set; }
    public string RawData { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class LogCallDataRequest
{
    public object Data { get; set; } = new();
}
