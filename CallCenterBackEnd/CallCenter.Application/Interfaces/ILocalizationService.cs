namespace CallCenter.Application.Interfaces;

public interface ILocalizationService
{
    string Translate(string key, string languageCode, Dictionary<string, object>? args = null);
}
