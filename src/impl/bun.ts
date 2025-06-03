import { logInternal } from "~/utils/log.js";

// Check if running in Bun environment
export const isBun = typeof process !== "undefined" && process.versions.bun;

/**
 * Get a file reference with validation and error handling
 * Uses Bun's optimized API when available, throws error otherwise
 */
export function getFileBun(path: string) {
  if (!isBun) {
    throw new Error("Bun runtime not detected");
  }
  try {
    return Bun.file(path);
  } catch (error) {
    logInternal(`Failed to get file for ${path}: ${error}`);
    throw error;
  }
}

/**
 * Get file type
 * Uses Bun's optimized API when available, throws error otherwise
 */
export async function getFileTypeBun(path: string): Promise<string> {
  if (!isBun) {
    throw new Error("Bun runtime not detected");
  }
  try {
    const file = Bun.file(path);
    return file.type;
  } catch (error) {
    logInternal(`Failed to get type for ${path}: ${error}`);
    throw error;
  }
}
