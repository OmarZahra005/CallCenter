namespace CallCenter.Domain.Extensions;
public static class AsyncExtensions
{
    /// <summary>
    /// Executes an async Task method synchronously and returns the result.
    /// IMPORTANT: Use with caution. This can cause deadlocks in UI applications.
    /// Best practice is to use async/await all the way through your application.
    /// </summary>
    /// <typeparam name="T">Type of the result</typeparam>
    /// <param name="task">Task to execute</param>
    /// <returns>Result of the task</returns>
    /// <exception cref="AggregateException">Thrown when task execution fails</exception>
    public static T RunSync<T>(this Task<T> task)
    {
        return AsyncContext.Run(async () => await task.ConfigureAwait(false));
    }

    /// <summary>
    /// Executes an async Task method synchronously
    /// </summary>
    /// <param name="task">Task to execute</param>
    public static void RunSync(this Task task)
    {
        AsyncContext.Run(async () => await task.ConfigureAwait(false));
    }

    private static class AsyncContext
    {
        private static readonly TaskFactory TaskFactory = new(
            CancellationToken.None,
            TaskCreationOptions.None,
            TaskContinuationOptions.None,
            TaskScheduler.Default);

        public static T Run<T>(Func<Task<T>> func)
        {
            return TaskFactory
                .StartNew(func)
                .Unwrap()
                .GetAwaiter()
                .GetResult();
        }

        public static void Run(Func<Task> func)
        {
            TaskFactory
                .StartNew(func)
                .Unwrap()
                .GetAwaiter()
                .GetResult();
        }
    }
}
