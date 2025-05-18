import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

export function emptyDirSync(dir: string) {
  if (!existsSync(dir)) {
    return;
  }

  for (const file of readdirSync(dir)) {
    rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}
