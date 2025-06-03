import { dirname } from "node:path";
import { extname } from "node:path";

import { parseJsonc, isValidJsonc } from "~/utils/json/regular/jsonc";
import { jsonrepair } from "~/utils/json/regular/jsonrepair";

import type { WriteJsonOptions } from "./write-json.js";

import { mkdirsSync } from "./mkdirs.js";
import { mkdirs } from "./mkdirs.js";
import { writeJsonSync } from "./write-json.js";
import { writeJson } from "./write-json.js";

export interface JsonUtilsOptions extends WriteJsonOptions {
  /**
   * Whether to preserve comments when reading JSONC files
   * @default false
   */
  preserveComments?: boolean;

  /**
   * Whether to include comments when writing JSONC files
   * @default false
   */
  includeComments?: boolean;
}

/**
 * Validates and repairs JSON/JSONC data if necessary.
 * @param data - The JSON/JSONC data to validate and repair
 * @param options - Options for validation and repair
 * @returns The repaired JSON/JSONC data if needed, or the original data if valid
 */
export function validateAndRepairJson(data: unknown, options: JsonUtilsOptions = {}): unknown {
  if (typeof data === "string") {
    try {
      // First try standard JSON parse
      JSON.parse(data);
      return data;
    } catch {
      // If standard parse fails, check if it's JSONC
      const isJsonc = extname(data).toLowerCase() === ".jsonc" || isValidJsonc(data);
      if (isJsonc) {
        try {
          return parseJsonc(data, { preserveComments: options.preserveComments });
        } catch {
          // If JSONC parse fails, try to repair
          return jsonrepair(data);
        }
      } else {
        // If not JSONC, just try to repair
        return jsonrepair(data);
      }
    }
  }
  return data;
}

/**
 * Ensures that the directory for the JSON/JSONC file exists and then writes the data to the file.
 * This is a utility function to avoid circular dependencies.
 */
export function ensureJsonFileSync(file: string, data: unknown, options?: JsonUtilsOptions): void {
  const dir = dirname(file);
  mkdirsSync(dir);
  const repairedData = validateAndRepairJson(data, options);
  writeJsonSync(file, repairedData, {
    ...options,
    spaces: 2,
  });
}

/**
 * Ensures that the directory for the JSON/JSONC file exists and then asynchronously writes the data to the file.
 * This is a utility function to avoid circular dependencies.
 */
export async function ensureJsonFile(file: string, data: unknown, options?: JsonUtilsOptions): Promise<void> {
  const dir = dirname(file);
  await mkdirs(dir);
  const repairedData = validateAndRepairJson(data, options);
  await writeJson(file, repairedData, {
    ...options,
    spaces: 2,
  });
}
