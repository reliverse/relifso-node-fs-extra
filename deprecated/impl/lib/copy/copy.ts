import { exists as pathExists } from "deprecated/impl/fs/exists.js";
import {
  stat as _stat,
  lstat,
  unlink,
  copyFile as _copyFile,
  chmod,
  mkdir,
  readdir,
  readlink,
  symlink,
} from "deprecated/impl/fs/index.js";
import { mkdirs } from "deprecated/impl/lib/mkdirs/index.js";
import { checkPaths, checkParentPaths, isSrcSubdir } from "deprecated/impl/lib/util/stat.js";
import { utimesMillis } from "deprecated/impl/lib/util/utimes.js";
import { dirname, join, resolve } from "node:path";
import { fromPromise } from "universalify";

export interface CopyOptions {
  clobber?: boolean;
}

/**
 * @param {string} src
 * @param {string} dest
 * @param {import('fs-extra').CopyOptions & { clobber?: boolean, overwrite?: boolean }} [opts]
 */
export default fromPromise(async function copy(src, dest, opts = {}) {
  if (typeof opts === "function") {
    opts = { filter: opts };
  }

  opts.clobber = "clobber" in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning(
      "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n" +
        "\tsee https://github.com/jprichardson/node-fs-extra/issues/269",
      "Warning",
      "fs-extra-WARN0001",
    );
  }

  const { srcStat, destStat } = await checkPaths(src, dest, "copy", opts);

  await checkParentPaths(src, srcStat, dest, "copy");

  const include = await runFilter(src, dest, opts);

  if (!include) return;

  // check if the parent of dest exists, and create it if it doesn't exist
  const destParent = dirname(dest);
  const dirExists = await pathExists(destParent);
  if (!dirExists) {
    await mkdirs(destParent);
  }

  await getStatsAndPerformCopy(destStat, src, dest, opts);
});

/**
 * @param {string} src
 * @param {string} dest
 * @param {import('fs-extra').CopyOptions & { clobber?: boolean, overwrite?: boolean }} opts
 */
async function runFilter(src, dest, opts) {
  if (!opts.filter) return true;
  return opts.filter(src, dest);
}

/**
 * @param {import("node:fs").BigIntStats | null} destStat
 * @param {string} src
 * @param {string} dest
 * @param {import('fs-extra').CopyOptions & { clobber?: boolean, overwrite?: boolean }} opts
 */
async function getStatsAndPerformCopy(destStat, src, dest, opts) {
  const statFn = opts.dereference ? _stat : lstat;
  const srcStat = await statFn(src);

  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts);

  if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
    return onFile(srcStat, destStat, src, dest, opts);

  if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts);
  if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`);
  if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`);
  throw new Error(`Unknown file: ${src}`);
}

/**
 * @param {import("node:fs").Stats} srcStat
 * @param {any} destStat
 * @param {any} src
 * @param {import("node:fs").PathLike} dest
 * @param {import('fs-extra').CopyOptions & { clobber?: boolean, overwrite?: boolean }} opts
 */
async function onFile(srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts);

  if (opts.overwrite) {
    await unlink(dest);
    return copyFile(srcStat, src, dest, opts);
  }
  if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`);
  }
}

/**
 * @param {{ mode: number; }} srcStat
 * @param {import("node:fs").PathLike} src
 * @param {import("node:fs").PathLike} dest
 * @param {import('fs-extra').CopyOptions & { clobber?: boolean, overwrite?: boolean }} opts
 */
async function copyFile(srcStat, src, dest, opts) {
  await _copyFile(src, dest);
  if (opts.preserveTimestamps) {
    // Make sure the file is writable before setting the timestamp
    // otherwise open fails with EPERM when invoked with 'r+'
    // (through utimes call)
    if (fileIsNotWritable(srcStat.mode)) {
      await makeFileWritable(dest, srcStat.mode);
    }

    // Set timestamps and mode correspondingly

    // Note that The initial srcStat.atime cannot be trusted
    // because it is modified by the read(2) system call
    // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
    const updatedSrcStat = await _stat(src);
    await utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
  }

  return chmod(dest, srcStat.mode);
}

/**
 * @param {number} srcMode
 */
function fileIsNotWritable(srcMode) {
  return (srcMode & 0o200) === 0;
}

/**
 * @param {import("node:fs").PathLike} dest
 * @param {number} srcMode
 */
function makeFileWritable(dest, srcMode) {
  return chmod(dest, srcMode | 0o200);
}

/**
 * @param {import("node:fs").Stats} srcStat
 * @param {any} destStat
 * @param {string} src
 * @param {string} dest
 * @param {{ dereference?: boolean | undefined; }} opts
 */
async function onDir(srcStat, destStat, src, dest, opts) {
  // the dest directory might not exist, create it
  if (!destStat) {
    await mkdir(dest);
  }

  const items = await readdir(src);

  // loop through the files in the current directory to copy everything
  await Promise.all(
    items.map(async (item) => {
      const srcItem = join(src, item);
      const destItem = join(dest, item);

      // skip the item if it is matches by the filter function
      const include = await runFilter(srcItem, destItem, opts);
      if (!include) return;

      const { destStat } = await checkPaths(srcItem, destItem, "copy", opts);

      // If the item is a copyable file, `getStatsAndPerformCopy` will copy it
      // If the item is a directory, `getStatsAndPerformCopy` will call `onDir` recursively
      return getStatsAndPerformCopy(destStat, srcItem, destItem, opts);
    }),
  );

  if (!destStat) {
    await chmod(dest, srcStat.mode);
  }
}

/**
 * @param {any} destStat
 * @param {import("node:fs").PathLike} src
 * @param {import("node:fs").PathLike} dest
 * @param {import('fs-extra').CopyOptions & { clobber?: boolean, overwrite?: boolean }} opts
 */
async function onLink(destStat, src, dest, opts) {
  let resolvedSrc = await readlink(src);
  if (opts.dereference) {
    resolvedSrc = resolve(process.cwd(), resolvedSrc);
  }
  if (!destStat) {
    return symlink(resolvedSrc, dest);
  }

  let resolvedDest = null;
  try {
    resolvedDest = await readlink(dest);
  } catch (e) {
    // dest exists and is a regular file or directory,
    // Windows may throw UNKNOWN error. If dest already exists,
    // fs throws error anyway, so no need to guard against it here.
    if (
      // @ts-expect-error TODO: fix ts
      /** @type {NodeJS.ErrnoException} */ (e).code === "EINVAL" ||
      // @ts-expect-error TODO: fix ts
      /** @type {NodeJS.ErrnoException} */ (e).code === "UNKNOWN"
    )
      return symlink(resolvedSrc, dest);
    throw e;
  }
  if (opts.dereference) {
    resolvedDest = resolve(process.cwd(), resolvedDest);
  }
  if (isSrcSubdir(resolvedSrc, resolvedDest)) {
    throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
  }

  // do not copy if src is a subdir of dest since unlinking
  // dest in this case would result in removing src contents
  // and therefore a broken symlink would be created.
  if (isSrcSubdir(resolvedDest, resolvedSrc)) {
    throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
  }

  // copy the link
  await unlink(dest);
  return symlink(resolvedSrc, dest);
}
