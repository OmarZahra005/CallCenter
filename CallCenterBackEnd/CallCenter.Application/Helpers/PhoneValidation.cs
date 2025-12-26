using System.Text.RegularExpressions;

namespace CallCenter.Application.Helpers;

/// <summary>
/// Helper class for phone number validation and normalization to E.164 format
/// </summary>
public static partial class PhoneValidation
{
    // E.164 format: + followed by 7-15 digits, starting with country code (1-9)
    private static readonly Regex E164Pattern = E164Regex();

    [GeneratedRegex(@"^\+[1-9]\d{6,14}$", RegexOptions.Compiled)]
    private static partial Regex E164Regex();

    /// <summary>
    /// Validates if a phone number is in E.164 format
    /// </summary>
    public static bool IsValidE164(string phoneNumber)
    {
        return !string.IsNullOrWhiteSpace(phoneNumber) && E164Pattern.IsMatch(phoneNumber);
    }

    /// <summary>
    /// Normalizes a phone number to E.164 format
    /// </summary>
    /// <param name="phoneNumber">Input phone number in various formats</param>
    /// <param name="defaultCountryCode">Default country code to use (default: +966 for Saudi Arabia)</param>
    /// <returns>Normalized E.164 phone number, or null if invalid</returns>
    /// <remarks>
    /// Supported input formats:
    /// - +966512345678 (already E.164)
    /// - 00966512345678 (international format with 00)
    /// - 0512345678 (local Saudi format)
    /// - 512345678 (without leading zero)
    /// </remarks>
    public static string? NormalizeToE164(string? phoneNumber, string defaultCountryCode = "+966")
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return null;

        // Remove spaces, dashes, parentheses, and dots
        var cleaned = Regex.Replace(phoneNumber, @"[\s\-\(\)\.]", "");

        // If already starts with +, validate and return
        if (cleaned.StartsWith('+'))
        {
            return E164Pattern.IsMatch(cleaned) ? cleaned : null;
        }

        // If starts with 00, replace with + (international dialing prefix)
        if (cleaned.StartsWith("00"))
        {
            cleaned = "+" + cleaned.Substring(2);
        }
        // If starts with country code without + (e.g., 966512345678), just add +
        else if (cleaned.StartsWith("966") && cleaned.Length >= 12)
        {
            cleaned = "+" + cleaned;
        }
        // If starts with 0, it's a local number - add country code
        else if (cleaned.StartsWith('0'))
        {
            cleaned = defaultCountryCode + cleaned.Substring(1);
        }
        // Otherwise, assume it's a local number without leading zero - add country code
        else
        {
            cleaned = defaultCountryCode + cleaned;
        }

        // Validate the result
        return E164Pattern.IsMatch(cleaned) ? cleaned : null;
    }

    /// <summary>
    /// Formats an E.164 number for display (e.g., +966 51 234 5678)
    /// </summary>
    public static string FormatForDisplay(string e164Number)
    {
        if (string.IsNullOrWhiteSpace(e164Number) || !IsValidE164(e164Number))
            return e164Number ?? string.Empty;

        // For Saudi numbers (+966), format as: +966 5X XXX XXXX
        if (e164Number.StartsWith("+966") && e164Number.Length == 13)
        {
            return $"+966 {e164Number[4]}{e164Number[5]} {e164Number.Substring(6, 3)} {e164Number.Substring(9)}";
        }

        // For other numbers, just add space after country code
        return e164Number;
    }
}
