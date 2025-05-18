import { existsSync } from "node:fs";

import { writeFileSync } from "./write-file.js";

export function createFileSync(file: string, content = "") {
  if (existsSync(file)) {
    return;
  }

  return writeFileSync(file, content);
}
