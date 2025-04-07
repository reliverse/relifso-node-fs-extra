import { join } from "node:path";
import { fromPromise as u } from "universalify";

import { readdir, readdirSync } from "~/libs/core/core-impl/fs/index.js";
import { mkdirs, mkdirsSync } from "~/libs/core/core-impl/lib/mkdirs/index.js";
import {
  remove as _remove,
  removeSync,
} from "~/libs/core/core-impl/lib/remove/index.js";

export const emptyDir = u(async function emptyDir(dir) {
  let items: string[];
  try {
    items = await readdir(dir);
  } catch {
    return mkdirs(dir);
  }

  return Promise.all(items.map((item) => _remove(join(dir, item))));
});

/**
 * @param {string} dir
 * @returns
 */
export function emptyDirSync(dir) {
  let items: string[];
  try {
    items = readdirSync(dir);
  } catch {
    return mkdirsSync(dir);
  }

  for (let item of items) {
    item = join(dir, item);
    removeSync(item);
  }
}
