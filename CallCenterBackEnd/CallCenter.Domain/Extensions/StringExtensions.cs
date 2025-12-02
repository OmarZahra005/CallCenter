namespace CallCenter.Domain.Extensions;
public static class StringExtensions
{
    // Helper method to replace the first occurrence of a specified value in a string
    public static string ReplaceFirstOccurrence(this string source, string oldValue, string newValue)
    {
        int index = source.IndexOf(oldValue, StringComparison.OrdinalIgnoreCase);
        if (index < 0)
        {
            return source; // oldValue not found, return the original string
        }

        return source.Substring(0, index) + newValue + source.Substring(index + oldValue.Length);
    }
}
