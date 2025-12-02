using CallCenter.Domain.Common.Errors;
using CallCenter.Domain.Common.Results;

namespace CallCenter.Domain.Exceptions;

/// <summary>
/// Exception that wraps an Error from a failed Result, allowing conversion from Result pattern to exception-based error handling.
/// This is useful when you need to throw exceptions based on Result failures, particularly in scenarios where
/// exception handling is required (e.g., framework constraints, legacy code integration).
/// </summary>
public class ResultException : Exception
{
    /// <summary>
    /// The Error object from the failed Result
    /// </summary>
    public Error Error { get; }

    /// <summary>
    /// The error code from the wrapped Error
    /// </summary>
    public string ErrorCode => Error.Code;

    /// <summary>
    /// The error type from the wrapped Error
    /// </summary>
    public ErrorType ErrorType => Error.Type;

    /// <summary>
    /// Creates a new ResultException wrapping the specified Error
    /// </summary>
    /// <param name="error">The Error object from a failed Result</param>
    /// <param name="innerException">Optional inner exception</param>
    public ResultException(Error error, Exception? innerException = null)
        : base(error.Message, innerException)
    {
        Error = error;
    }

    /// <summary>
    /// Creates a new ResultException wrapping the specified Error with additional message context
    /// </summary>
    /// <param name="error">The Error object from a failed Result</param>
    /// <param name="additionalMessage">Additional context message to append</param>
    /// <param name="innerException">Optional inner exception</param>
    public ResultException(Error error, string additionalMessage, Exception? innerException = null)
        : base($"{error.Message}. {additionalMessage}", innerException)
    {
        Error = error;
    }

    /// <summary>
    /// Creates a ResultException from a failed Result
    /// </summary>
    /// <param name="result">The failed Result to convert to exception</param>
    /// <returns>A new ResultException wrapping the Result's error</returns>
    /// <exception cref="ArgumentException">Thrown when the result is successful</exception>
    public static ResultException FromResult(Result result)
    {
        if (result.IsSuccess)
            throw new ArgumentException("Cannot create ResultException from a successful result", nameof(result));

        var exception = new ResultException(result.Error!);
        
        // Add Result message as additional context if available
        if (!string.IsNullOrEmpty(result.Message))
        {
            exception.Data["ResultMessage"] = result.Message;
        }

        return exception;
    }

    /// <summary>
    /// Creates a ResultException from a failed Result&lt;T&gt;
    /// </summary>
    /// <typeparam name="T">The type of the Result data</typeparam>
    /// <param name="result">The failed Result to convert to exception</param>
    /// <returns>A new ResultException wrapping the Result's error</returns>
    /// <exception cref="ArgumentException">Thrown when the result is successful</exception>
    public static ResultException FromResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
            throw new ArgumentException("Cannot create ResultException from a successful result", nameof(result));

        var exception = new ResultException(result.Error!);
        
        // Add Result message as additional context if available
        if (!string.IsNullOrEmpty(result.Message))
        {
            exception.Data["ResultMessage"] = result.Message;
        }

        // Add type information for debugging
        exception.Data["ResultType"] = typeof(T).Name;

        return exception;
    }

    /// <summary>
    /// Creates a ResultException with additional context data
    /// </summary>
    /// <param name="error">The Error object from a failed Result</param>
    /// <param name="contextData">Additional context data for debugging</param>
    /// <param name="innerException">Optional inner exception</param>
    /// <returns>A new ResultException with context data</returns>
    public static ResultException WithContext(Error error, Dictionary<string, object> contextData, Exception? innerException = null)
    {
        var exception = new ResultException(error, innerException);
        
        foreach (var kvp in contextData)
        {
            exception.Data[kvp.Key] = kvp.Value;
        }

        return exception;
    }

    /// <summary>
    /// Gets a string representation of the exception with error details
    /// </summary>
    /// <returns>Formatted string with error code, type, and message</returns>
    public override string ToString()
    {
        return $"ResultException [{ErrorCode}] ({ErrorType}): {Message}{Environment.NewLine}{base.ToString()}";
    }
}