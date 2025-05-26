import { exists as pathExists } from "deprecated/impl/fs/exists.js";
import { lstat, stat, symlink, lstatSync, statSync, existsSync, symlinkSync } from "deprecated/impl/fs/index.js";
import { mkdirs, mkdirsSync } from "deprecated/impl/lib/mkdirs/index.js";
import { areIdentical } from "deprecated/impl/lib/util/stat.js";
import { dirname } from "node:path";
import { fromPromise } from "universalify";

import { symlinkPaths, symlinkPathsSync } from "./symlink-paths.js";
import { symlinkType, symlinkTypeSync } from "./symlink-type.js";

async function _createSymlink(srcpath, dstpath, type) {
  let stats;
  try {
    stats = await lstat(dstpath);
  } catch {
    /* empty */
  }

  if (stats?.isSymbolicLink()) {
    const [srcStat, dstStat] = await Promise.all([stat(srcpath), stat(dstpath)]);

    if (areIdentical(srcStat, dstStat)) return;
  }

  const relative = await symlinkPaths(srcpath, dstpath);
  srcpath = relative.toDst;
  const toType = await symlinkType(relative.toCwd, type);
  const dir = dirname(dstpath);

  if (!(await pathExists(dir))) {
    await mkdirs(dir);
  }

  return symlink(srcpath, dstpath, toType);
}

export const createSymlink = fromPromise(_createSymlink);

export function createSymlinkSync(srcpath, dstpath, type) {
  let stats;
  try {
    stats = lstatSync(dstpath);
  } catch {
    /* empty */
  }
  if (stats?.isSymbolicLink()) {
    const srcStat = statSync(srcpath);
    const dstStat = statSync(dstpath);
    if (areIdentical(srcStat, dstStat)) return;
  }
  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type = symlinkTypeSync(relative.toCwd, type);
  const dir = dirname(dstpath);
  const exists = existsSync(dir);
  if (exists) return symlinkSync(srcpath, dstpath, type);
  // @ts-expect-error TODO: fix ts
  mkdirsSync(dir);
  return symlinkSync(srcpath, dstpath, type);
}
