import { futimes, open, close, openSync, futimesSync, closeSync } from "deprecated/impl/fs/index.js";
import { fromPromise } from "universalify";

/**
 * @param {import("node:fs").PathLike} path
 * @param {import("node:fs").TimeLike} atime
 * @param {import("node:fs").TimeLike} mtime
 */
async function _utimesMillis(path, atime, mtime) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  const fd = await open(path, "r+");

  let closeErr = null;

  try {
    await futimes(fd, atime, mtime);
  } finally {
    try {
      await close(fd);
    } catch (e) {
      closeErr = e;
    }
  }

  if (closeErr) {
    throw closeErr;
  }
}

/**
 * @param {import("node:fs").PathLike} path
 * @param {import("node:fs").TimeLike} atime
 * @param {import("node:fs").TimeLike} mtime
 */
export function utimesMillisSync(path, atime, mtime) {
  const fd = openSync(path, "r+");
  futimesSync(fd, atime, mtime);
  return closeSync(fd);
}

export const utimesMillis = fromPromise(_utimesMillis);
