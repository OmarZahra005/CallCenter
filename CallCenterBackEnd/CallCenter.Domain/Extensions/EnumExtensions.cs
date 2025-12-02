using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace CallCenter.Domain.Extensions;

public static class EnumExtensions
{
    public static string ToSnakeCase(this Enum enumValue)
    {
        return ToSnakeCase(enumValue.ToString());
    }

    public static string GetDescription(this Enum enumValue)
    {
        var field = enumValue.GetType().GetField(enumValue.ToString());
        var attribute = field?.GetCustomAttribute<DescriptionAttribute>();
        return attribute?.Description ?? enumValue.ToString();
    }

    public static string GetTranslation(this Enum enumValue)
    {
        var field = enumValue.GetType().GetField(enumValue.ToString());
        var attribute = field?.GetCustomAttribute<DisplayAttribute>();
        return attribute?.GetName() ?? enumValue.ToString();
    }

    public static IDictionary<string, string> GetEnumValuesAndDescriptions(Type enumType)
    {
        if (!enumType.IsEnum)
            throw new ArgumentException("Type must be an enum");

        return Enum.GetValues(enumType)
            .Cast<Enum>()
            .ToDictionary(
                e => ToSnakeCase(e.ToString()),
                e => e.GetDescription()
            );
    }

    private static string ToSnakeCase(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;

        return string.Concat(text.Select((x, i) => i > 0 && char.IsUpper(x) && !char.IsUpper(text[i - 1])
            ? $"_{x}"
            : x.ToString()))
            .ToLower();
    }
}
