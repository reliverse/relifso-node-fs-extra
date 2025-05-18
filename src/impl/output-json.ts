import { dirname } from "node:path";

import { mkdirsSync } from "./mkdirs.js";
import { writeJsonSync } from "./write-json.js";

/**
 * Ensures that the directory for the JSON file exists and then writes the JSON data to the file.
 *
 * @param file - The path to the file.
 * @param data - The JSON data to write.
 * @param options - Options for writing the JSON file (e.g., replacer, space).
 */
export function outputJsonSync(file: string, data: unknown, options?: unknown): void {
  const dir = dirname(file);
  mkdirsSync(dir);
  writeJsonSync(file, data, options);
}
