import { exists as pathExists } from "deprecated/impl/fs/exists.js";
import { writeFile, existsSync, writeFileSync } from "deprecated/impl/fs/index.js";
import { mkdirs, mkdirsSync } from "deprecated/impl/lib/mkdirs/index.js";
import { dirname } from "node:path";
import { fromPromise } from "universalify";

/**
 * @param {string} file
 * @param {string | NodeJS.ArrayBufferView} data
 * @param {import('fs').WriteFileOptions} encoding
 * @returns
 */
async function _outputFile(file, data, encoding = "utf-8") {
  const dir = dirname(file);

  if (!(await pathExists(dir))) {
    await mkdirs(dir);
  }

  // @ts-expect-error TODO: fix ts
  return writeFile(file, data, encoding);
}
export const outputFile = fromPromise(_outputFile);

/**
 * @param {string} file
 * @param {[string | NodeJS.ArrayBufferView, import('fs').WriteFileOptions | undefined]} args
 */
export function outputFileSync(file, ...args) {
  const dir = dirname(file);
  if (!existsSync(dir)) {
    // @ts-expect-error TODO: fix ts
    mkdirsSync(dir);
  }

  // @ts-expect-error TODO: fix ts
  writeFileSync(file, ...args);
}
