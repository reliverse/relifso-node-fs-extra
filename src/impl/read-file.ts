import { readFileSync as nodeReadFileSync } from "node:fs";

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
export function readFileSync(path: string, options?: BufferEncoding | ReadFileOptions): string | Buffer {
  let encoding: BufferEncoding | undefined;
  let flag: string | undefined;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding ?? undefined;
    flag = options.flag;
  }

  return nodeReadFileSync(path, { encoding: encoding as BufferEncoding, flag });
}
