import { existsSync, mkdirSync, writeFileSync as nodeWriteFileSync, type PathLike } from "node:fs";
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
