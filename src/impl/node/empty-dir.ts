import { existsSync, readdirSync, rmSync } from "node:fs";
import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

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
