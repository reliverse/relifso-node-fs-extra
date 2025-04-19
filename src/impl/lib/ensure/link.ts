import { dirname } from "node:path";
import { fromPromise } from "universalify";

import { exists as pathExists } from "~/impl/fs/exists.js";
import {
  link,
  lstat,
  lstatSync,
  existsSync,
  linkSync,
} from "~/impl/fs/index.js";
import { mkdirs, mkdirsSync } from "~/impl/lib/mkdirs/index.js";
import { areIdentical } from "~/impl/lib/util/stat.js";

async function _createLink(srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = await lstat(dstpath);
  } catch {
    // ignore error
  }

  let srcStat;
  try {
    srcStat = await lstat(srcpath);
  } catch (err) {
    // @ts-expect-error TODO: fix ts
    err.message = err.message.replace("lstat", "ensureLink");
    throw err;
  }

  if (dstStat && areIdentical(srcStat, dstStat)) return;

  const dir = dirname(dstpath);

  const dirExists = await pathExists(dir);

  if (!dirExists) {
    await mkdirs(dir);
  }

  await link(srcpath, dstpath);
}

export const createLink = fromPromise(_createLink);

export function createLinkSync(srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = lstatSync(dstpath);
  } catch {
    /* empty */
  }

  try {
    const srcStat = lstatSync(srcpath);
    if (dstStat && areIdentical(srcStat, dstStat)) return;
  } catch (err) {
    // @ts-expect-error TODO: fix ts
    err.message = err.message.replace("lstat", "ensureLink");
    throw err;
  }

  const dir = dirname(dstpath);
  const dirExists = existsSync(dir);
  if (dirExists) return linkSync(srcpath, dstpath);
  // @ts-expect-error TODO: fix ts
  mkdirsSync(dir);

  return linkSync(srcpath, dstpath);
}
