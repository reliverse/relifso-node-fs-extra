import { rmSync } from "node:fs";
import { rm } from "node:fs/promises";

export function removeSync(path: string) {
  return rmSync(path, { recursive: true, force: true });
}

export async function remove(path: string): Promise<void> {
  return rm(path, { recursive: true, force: true });
}
