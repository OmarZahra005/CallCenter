using System.Text.Json;
using CallCenter.Application.Interfaces;

namespace CallCenter.Infrastructure.Services;

public class LocalizationService : ILocalizationService
{
    private readonly Dictionary<string, Dictionary<string, string>> _translations;

    public LocalizationService()
    {
        _translations = LoadTranslations();
    }

    public string Translate(string key, string languageCode, Dictionary<string, object>? args = null)
    {
        // Try requested language
        if (_translations.TryGetValue(languageCode, out var langTranslations) &&
            langTranslations.TryGetValue(key, out var template))
        {
            return FormatTemplate(template, args);
        }

        // Fallback to English
        if (_translations.TryGetValue("en", out var enTranslations) &&
            enTranslations.TryGetValue(key, out var enTemplate))
        {
            return FormatTemplate(enTemplate, args);
        }

        // Last resort: return key
        return key;
    }

    private static string FormatTemplate(string template, Dictionary<string, object>? args)
    {
        if (args == null) return template;

        foreach (var arg in args)
        {
            template = template.Replace($"{{{arg.Key}}}", arg.Value?.ToString() ?? "");
        }

        return template;
    }

    private Dictionary<string, Dictionary<string, string>> LoadTranslations()
    {
        var translations = new Dictionary<string, Dictionary<string, string>>();

        var basePath = AppDomain.CurrentDomain.BaseDirectory;

        var arPath = Path.Combine(basePath, "Resources", "notifications.ar.json");
        var enPath = Path.Combine(basePath, "Resources", "notifications.en.json");

        if (File.Exists(arPath))
        {
            var arJson = File.ReadAllText(arPath);
            var arTranslations = JsonSerializer.Deserialize<Dictionary<string, string>>(arJson);
            if (arTranslations != null)
                translations["ar"] = arTranslations;
        }

        if (File.Exists(enPath))
        {
            var enJson = File.ReadAllText(enPath);
            var enTranslations = JsonSerializer.Deserialize<Dictionary<string, string>>(enJson);
            if (enTranslations != null)
                translations["en"] = enTranslations;
        }

        return translations;
    }
}
