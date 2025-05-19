import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";

import { writeFileSync } from "./write-file.js";
import { writeFile } from "./write-file.js";

export function createFileSync(file: string, content = "") {
  if (existsSync(file)) {
    return;
  }

  return writeFileSync(file, content);
}

export async function createFile(file: string, content = ""): Promise<void> {
  try {
    await stat(file);
    // File exists, do nothing
    return;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File does not exist, write it
      return writeFile(file, content);
    }
    // Other error, rethrow
    throw error;
  }
}
