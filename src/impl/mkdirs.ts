import { mkdirSync, existsSync } from "node:fs";
import { mkdir, stat } from "node:fs/promises";

export function mkdirsSync(dir: string) {
  if (existsSync(dir)) {
    return;
  }

  return mkdirSync(dir, { recursive: true });
}

export async function mkdirs(dir: string): Promise<string | undefined> {
  try {
    await stat(dir);
    return undefined; // Directory already exists
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Directory does not exist, create it
      return mkdir(dir, { recursive: true });
    }
    // Other error, rethrow
    throw error;
  }
}
