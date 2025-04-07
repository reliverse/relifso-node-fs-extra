import { dirname } from "node:path";
import { fromPromise } from "universalify";

import { exists as pathExists } from "~/libs/core/core-impl/fs/exists.js";
import {
  lstat,
  stat,
  symlink,
  lstatSync,
  statSync,
  existsSync,
  symlinkSync,
} from "~/libs/core/core-impl/fs/index.js";
import { mkdirs, mkdirsSync } from "~/libs/core/core-impl/lib/mkdirs";
import { areIdentical } from "~/libs/core/core-impl/lib/util/stat";

import { symlinkPaths, symlinkPathsSync } from "./symlink-paths";
import { symlinkType, symlinkTypeSync } from "./symlink-type";

async function _createSymlink(srcpath, dstpath, type) {
  let stats;
  try {
    stats = await lstat(dstpath);
  } catch {}

  if (stats?.isSymbolicLink()) {
    const [srcStat, dstStat] = await Promise.all([
      stat(srcpath),
      stat(dstpath),
    ]);

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
  } catch {}
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
  mkdirsSync(dir);
  return symlinkSync(srcpath, dstpath, type);
}
