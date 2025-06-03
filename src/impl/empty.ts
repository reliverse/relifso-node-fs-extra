import { existsSync, readdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { readdir, rm, stat, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

interface EmptyFileOptions {
  /**
   * If true, will replace all object literals with empty objects {}
   * Only works with JSON files
   */
  emptyObjects?: boolean;
}

export function emptyDirSync(dir: string) {
  if (!existsSync(dir)) {
    return;
  }

  for (const file of readdirSync(dir)) {
    rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

export async function emptyDir(dir: string): Promise<void> {
  try {
    await stat(dir);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Directory does not exist, do nothing
      return;
    }
    throw error;
  }

  for (const file of await readdir(dir)) {
    await rm(path.resolve(dir, file), { recursive: true, force: true });
  }
}

/**
 * Empties an object by removing all its properties
 * @param obj The object to empty
 * @returns The empty object
 */
export function emptyObject<T extends object>(obj: T): T {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      delete obj[key];
    }
  }
  return obj;
}

/**
 * Empties a file by removing all its contents
 * @param filePath Path to the file
 * @param options Options for emptying the file
 */
export async function emptyFile(filePath: string, options: EmptyFileOptions = {}): Promise<void> {
  try {
    await stat(filePath);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File does not exist, do nothing
      return;
    }
    throw error;
  }

  if (options.emptyObjects && filePath.toLowerCase().endsWith(".json")) {
    try {
      // Read the file content
      const content = await readFile(filePath, "utf-8");
      // Parse as JSON
      const data = JSON.parse(content);

      // If it's an object, empty it
      if (typeof data === "object" && data !== null) {
        const emptyData = emptyObject(data);
        // Write back the empty object
        await writeFile(filePath, JSON.stringify(emptyData, null, 2));
        return;
      }
    } catch (error) {
      // If JSON parsing fails, fall back to regular file emptying
      console.warn(`Failed to parse JSON file ${filePath}, falling back to regular file emptying:`, error);
    }
  }

  // Regular file emptying - write empty string
  await writeFile(filePath, "");
}

/**
 * Synchronous version of emptyFile
 * @param filePath Path to the file
 * @param options Options for emptying the file
 */
export function emptyFileSync(filePath: string, options: EmptyFileOptions = {}): void {
  if (!existsSync(filePath)) {
    return;
  }

  if (options.emptyObjects && filePath.toLowerCase().endsWith(".json")) {
    try {
      // Read the file content
      const content = readFileSync(filePath, "utf-8");
      // Parse as JSON
      const data = JSON.parse(content);

      // If it's an object, empty it
      if (typeof data === "object" && data !== null) {
        const emptyData = emptyObject(data);
        // Write back the empty object
        writeFileSync(filePath, JSON.stringify(emptyData, null, 2));
        return;
      }
    } catch (error) {
      // If JSON parsing fails, fall back to regular file emptying
      console.warn(`Failed to parse JSON file ${filePath}, falling back to regular file emptying:`, error);
    }
  }

  // Regular file emptying - write empty string
  writeFileSync(filePath, "");
}
