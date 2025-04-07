import { existsSync, renameSync } from "graceful-fs";
import { dirname, parse } from "node:path";

import { copySync } from "~/libs/core/core-impl/lib/copy/index.js";
import { mkdirsSync } from "~/libs/core/core-impl/lib/mkdirs/index.js";
import { removeSync } from "~/libs/core/core-impl/lib/remove/index.js";
import {
  checkParentPathsSync,
  checkPathsSync,
} from "~/libs/core/core-impl/lib/util/stat.js";

export default function moveSync(src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;

  const { srcStat, isChangingCase = false } = checkPathsSync(
    src,
    dest,
    "move",
    opts,
  );
  checkParentPathsSync(src, srcStat, dest, "move");
  if (!isParentRoot(dest)) mkdirsSync(dirname(dest));
  return doRename(src, dest, overwrite, isChangingCase);
}

function isParentRoot(dest) {
  const parent = dirname(dest);
  const parsedPath = parse(parent);
  return parsedPath.root === parent;
}

function doRename(src, dest, overwrite, isChangingCase) {
  if (isChangingCase) return rename(src, dest, overwrite);
  if (overwrite) {
    removeSync(dest);
    return rename(src, dest, overwrite);
  }
  if (existsSync(dest)) throw new Error("dest already exists.");
  return rename(src, dest, overwrite);
}

function rename(src, dest, overwrite) {
  try {
    renameSync(src, dest);
  } catch (err) {
    if (err.code !== "EXDEV") throw err;
    return moveAcrossDevice(src, dest, overwrite);
  }
}

function moveAcrossDevice(src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true,
    preserveTimestamps: true,
  };
  copySync(src, dest, opts);
  return removeSync(src);
}
