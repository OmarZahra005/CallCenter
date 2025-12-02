using System.ComponentModel;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using CallCenter.Domain.Common.Errors;

namespace CallCenter.Domain.Common.Results;

public class Result<T>
{
    public T? Data { get; }
    public bool IsSuccess { get; }
    public Error? Error { get; }
    public string? Message { get; } // Added property
    
    [JsonIgnore]
    [IgnoreDataMember]
    [Browsable(false)]
    [EditorBrowsable(EditorBrowsableState.Never)]
    public bool IsFailure => !IsSuccess;

    private Result(T? data, bool isSuccess, Error? error, string? message = null)
    {
        Data = data;
        IsSuccess = isSuccess;
        Error = error;
        Message = message;
    }

    public static Result<T> Success(T data, string? message = null) => new(data, true, null, message);
    public static Result<T> Failure(Error error, string? message = null) => new(default, false, error, message);

    // Functional extensions
    public Result<TNew> Map<TNew>(Func<T, TNew> mapper)
    {
        return IsSuccess
            ? Result<TNew>.Success(mapper(Data!), Message)
            : Result<TNew>.Failure(Error!, Message);
    }

    public async Task<Result<TNew>> MapAsync<TNew>(Func<T, Task<TNew>> mapper)
    {
        return IsSuccess
            ? Result<TNew>.Success(await mapper(Data!), Message)
            : Result<TNew>.Failure(Error!, Message);
    }

    public Result<T> OnSuccess(Action<T> action)
    {
        if (IsSuccess)
            action(Data!);
        return this;
    }

    public Result<T> OnFailure(Action<Error> action)
    {
        if (!IsSuccess)
            action(Error!);
        return this;
    }
    public Result<T> WithMessage(string message)
    {
        return new Result<T>(Data, IsSuccess, Error, message);
    }
}

public class Result
{
    public bool IsSuccess { get; }
    public Error? Error { get; }
    public string? Message { get; } // Added property
    public bool IsFailure => !IsSuccess;

    protected Result(bool isSuccess, Error? error, string? message = null)
    {
        IsSuccess = isSuccess;
        Error = error;
        Message = message;
    }

    public static Result Success(string? message = null) => new(true, null, message);
    public static Result Failure(Error error, string? message = null) => new(false, error, message);

    public Result OnSuccess(Action action)
    {
        if (IsSuccess)
            action();
        return this;
    }

    public Result OnFailure(Action<Error> action)
    {
        if (!IsSuccess)
            action(Error!);
        return this;
    }
}