import { writeFile, stat, readdir, statSync, readdirSync, writeFileSync } from "deprecated/impl/fs/index.js";
import { mkdirs, mkdirsSync } from "deprecated/impl/lib/mkdirs/index.js";
import { dirname } from "node:path";
import { fromPromise } from "universalify";

async function _createFile(file) {
  let stats;
  try {
    stats = await stat(file);
  } catch {
    /* empty */
  }
  if (stats?.isFile()) return;

  const dir = dirname(file);

  let dirStats = null;
  try {
    dirStats = await stat(dir);
  } catch (err) {
    // if the directory doesn't exist, make it
    // @ts-expect-error TODO: fix ts
    if (err.code === "ENOENT") {
      await mkdirs(dir);
      await writeFile(file, "");
      return;
    } else {
      throw err;
    }
  }

  if (dirStats.isDirectory()) {
    await writeFile(file, "");
  } else {
    // parent is not a directory
    // This is just to cause an internal ENOTDIR error to be thrown
    await readdir(dir);
  }
}
export const createFile = fromPromise(_createFile);

export function createFileSync(file) {
  let stats;
  try {
    stats = statSync(file);
  } catch {
    /* empty */
  }
  if (stats?.isFile()) return;

  const dir = dirname(file);
  try {
    if (!statSync(dir).isDirectory()) {
      // parent is not a directory
      // This is just to cause an internal ENOTDIR error to be thrown
      readdirSync(dir);
    }
  } catch (err) {
    // If the stat call above failed because the directory doesn't exist, create it
    // @ts-expect-error TODO: fix ts
    if (err && err.code === "ENOENT") mkdirsSync(dir);
    else throw err;
  }

  writeFileSync(file, "");
}
