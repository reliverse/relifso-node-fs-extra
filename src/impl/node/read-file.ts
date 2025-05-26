import { readFileSync as nodeReadFileSync } from "node:fs";
import { readFile as nodeReadFileAsync } from "node:fs/promises";

export interface ReadFileOptions {
  encoding?: BufferEncoding | null;
  flag?: string;
}

/**
 * Reads the entire contents of a file.
 *
 * @param path - The path to the file.
 * @param options - Options for reading the file. Can be an encoding string or an object.
 * @returns The file content as a string or Buffer.
 */
// Overload for when encoding is specified (returns string)
export function readFileSync(
  path: string,
  options: BufferEncoding | (ReadFileOptions & { encoding: BufferEncoding }),
): string;
// Overload for when encoding is not specified or is null (returns Buffer)
export function readFileSync(path: string, options?: (ReadFileOptions & { encoding?: null }) | null): Buffer;
// Implementation
export function readFileSync(path: string, options?: BufferEncoding | ReadFileOptions): string | Buffer {
  let encoding: BufferEncoding | null | undefined;
  let flag: string | undefined;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding; // Can be BufferEncoding, null, or undefined
    flag = options.flag;
  }

  // Pass encoding as is; nodeReadFileSync handles it.
  // If encoding is a valid BufferEncoding, it returns string.
  // If encoding is null, undefined, or not a valid BufferEncoding, it returns Buffer.
  // The overloads help TypeScript understand this.
  if (encoding) {
    return nodeReadFileSync(path, { encoding: encoding as BufferEncoding, flag });
  }
  return nodeReadFileSync(path, { encoding: null, flag });
}

/**
 * Asynchronously reads the entire contents of a file.
 *
 * @param path - The path to the file.
 * @param options - Options for reading the file. Can be an encoding string or an object.
 * @returns A promise that resolves with the file content as a string or Buffer.
 */
// Overload for when encoding is specified (returns string)
export async function readFile(
  path: string,
  options: BufferEncoding | (ReadFileOptions & { encoding: BufferEncoding }),
): Promise<string>;
// Overload for when encoding is not specified or is null (returns Buffer)
export async function readFile(path: string, options?: (ReadFileOptions & { encoding?: null }) | null): Promise<Buffer>;
// Implementation
export async function readFile(path: string, options?: BufferEncoding | ReadFileOptions): Promise<string | Buffer> {
  let encoding: BufferEncoding | null | undefined;
  let flag: string | undefined;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding; // Can be BufferEncoding, null, or undefined
    flag = options.flag;
  }

  // Pass encoding as is; nodeReadFileAsync handles it.
  // If encoding is a valid BufferEncoding, it returns Promise<string>.
  // If encoding is null, undefined, or not a valid BufferEncoding, it returns Promise<Buffer>.
  // The overloads help TypeScript understand this.
  if (encoding) {
    return nodeReadFileAsync(path, { encoding: encoding as BufferEncoding, flag });
  }
  return nodeReadFileAsync(path, { encoding: null, flag });
}
