import { fromPromise } from "universalify";

import { lstat, lstatSync } from "~/libs/core/core-impl/fs/index.js";

async function _symlinkType(srcpath, type) {
  if (type) return type;

  let stats;
  try {
    stats = await lstat(srcpath);
  } catch {
    return "file";
  }

  return stats?.isDirectory() ? "dir" : "file";
}

export const symlinkType = fromPromise(_symlinkType);

export function symlinkTypeSync(srcpath, type) {
  if (type) return type;

  let stats;
  try {
    stats = lstatSync(srcpath);
  } catch {
    return "file";
  }
  return stats?.isDirectory() ? "dir" : "file";
}
