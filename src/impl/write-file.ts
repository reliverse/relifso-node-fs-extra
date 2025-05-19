import { existsSync, mkdirSync, writeFileSync as nodeWriteFileSync, type PathLike } from "node:fs";
import { mkdir, writeFile as nodeWriteFileAsync, stat } from "node:fs/promises";
import path from "node:path";

export type WriteFileOptions = import("node:fs").WriteFileOptions;

/**
 * Synchronously writes data to a file, replacing the file if it already exists.
 * Ensures the directory exists before writing.
 *
 * @param file - Path to the file.
 * @param data - The data to write. If something other than a Buffer or Uint8Array is provided, it is converted to a string.
 * @param options - Options for writing the file. Can be an encoding string or an object.
 */
export function writeFileSync(
  file: PathLike | number,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions,
): void {
  const dir = path.dirname(file.toString());
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  nodeWriteFileSync(file, data, options);
}

/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 * Ensures the directory exists before writing.
 *
 * @param file - Path to the file.
 * @param data - The data to write. If something other than a Buffer or Uint8Array is provided, it is converted to a string.
 * @param options - Options for writing the file. Can be an encoding string or an object.
 */
export async function writeFile(
  file: PathLike | number,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions,
): Promise<void> {
  const dir = path.dirname(file.toString());
  try {
    await stat(dir);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      await mkdir(dir, { recursive: true });
    } else {
      throw error;
    }
  }

  return nodeWriteFileAsync(file as import("node:fs/promises").FileHandle | PathLike, data, options);
}
