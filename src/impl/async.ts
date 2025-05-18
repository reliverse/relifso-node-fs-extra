/**
 * Converts a synchronous function into an asynchronous function that returns a Promise.
 *
 * @param fn - The synchronous function to convert.
 * @returns An asynchronous function that wraps the original synchronous function.
 */
export function toAsync<T extends (...args: any[]) => any>(
  fn: T,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> =>
    new Promise((resolve, reject) => {
      try {
        resolve(fn(...args));
      } catch (error) {
        reject(error);
      }
    });
}
