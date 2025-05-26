import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";

export function pathExistsSync(path: string) {
  return existsSync(path);
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}
