import { mkdirSync, existsSync } from "node:fs";
import { mkdir, stat } from "node:fs/promises";

interface MakeDirectoryOptions {
  recursive?: boolean;
  mode?: number | string;
}

export function mkdirsSync(dir: string, options?: MakeDirectoryOptions) {
  try {
    if (existsSync(dir)) {
      return;
    }
    // mkdirsSync is inherently recursive, so we always pass recursive: true.
    // We pass the mode if provided in options.
    return mkdirSync(dir, { recursive: true, mode: options?.mode });
  } catch (error: any) {
    if (error.code === "EEXIST") {
      // Directory was created by another process between our check and mkdir
      return;
    }
    throw error;
  }
}

export async function mkdirs(dir: string, options?: MakeDirectoryOptions): Promise<string | undefined> {
  try {
    // Check if directory exists using stat
    const dirStat = await stat(dir);
    if (dirStat.isDirectory()) {
      return undefined; // Directory already exists
    }
    // If path exists but is not a directory, this is an error case fs-extra would throw in.
    // For now, we let it proceed to mkdir which will likely error, or handle as needed.
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      // Re-throw errors other than "file not found"
      throw error;
    }
    // If error is ENOENT, directory does not exist, so we proceed to create it.
  }

  // mkdirs is inherently recursive, so we always pass recursive: true.
  // We pass the mode if provided in options.
  return mkdir(dir, { recursive: true, mode: options?.mode });
}
