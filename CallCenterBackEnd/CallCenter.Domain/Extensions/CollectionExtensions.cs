namespace CallCenter.Domain.Extensions;
public static class CollectionExtensions
{
    /// <summary>
    /// Removes all elements that match the conditions defined by the specified predicate from the ICollection.
    /// </summary>
    /// <typeparam name="TSource">The type of elements in the collection.</typeparam>
    /// <param name="source">The collection to remove elements from.</param>
    /// <param name="predicate">The delegate that defines the conditions of the elements to remove.</param>
    /// <returns>The number of elements removed from the collection.</returns>
    /// <exception cref="ArgumentNullException">collection or predicate is null.</exception>
    public static ICollection<TSource> RemoveWhere<TSource>(this ICollection<TSource> source, Func<TSource, bool> predicate)
    {
        ArgumentNullException.ThrowIfNull(source, nameof(source));
        ArgumentNullException.ThrowIfNull(predicate, nameof(predicate));

        var itemsToRemove = source.Where(item => predicate(item)).ToList();

        foreach (var item in itemsToRemove)
        {
            source.Remove(item);
        }

        return source;
    }
}
