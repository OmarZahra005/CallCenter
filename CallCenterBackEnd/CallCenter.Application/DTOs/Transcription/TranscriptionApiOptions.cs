namespace CallCenter.Application.DTOs.Transcription;

public class TranscriptionApiOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string Endpoint { get; set; } = "/api/Transcription";
    public int TimeoutSeconds { get; set; } = 300;
}
