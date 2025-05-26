import { dirname } from "node:path";

import { mkdirsSync } from "./mkdirs.js";
import { mkdirs } from "./mkdirs.js";
import { writeFileSync } from "./write-file.js";
import { writeFile } from "./write-file.js";

/**
 * Ensures that the directory for the file exists and then writes the data to the file.
 *
 * @param file - The path to the file.
 * @param data - The data to write.
 * @param options - Options for writing the file (e.g., encoding, mode, flag).
 */
export function outputFileSync(file: string, data: string | Uint8Array, options?: unknown): void {
  const dir = dirname(file);
  mkdirsSync(dir);
  writeFileSync(file, data, options);
}

/**
 * Ensures that the directory for the file exists and then asynchronously writes the data to the file.
 *
 * @param file - The path to the file.
 * @param data - The data to write.
 * @param options - Options for writing the file (e.g., encoding, mode, flag).
 */
export async function outputFile(file: string, data: string | Uint8Array, options?: unknown): Promise<void> {
  const dir = dirname(file);
  await mkdirs(dir);
  await writeFile(file, data, options);
}
