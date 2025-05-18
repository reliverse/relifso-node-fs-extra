import type { Stats, BigIntStats, PathLike } from "graceful-fs";

import {
  existsSync,
  statSync as _statSync,
  lstatSync,
  unlinkSync,
  copyFileSync,
  chmodSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  symlinkSync,
} from "graceful-fs";
import { dirname, join, resolve } from "node:path";

import { mkdirsSync } from "@/impl/lib/mkdirs/index.js";
import { checkParentPathsSync, checkPathsSync, isSrcSubdir } from "@/impl/lib/util/stat.js";
import { utimesMillisSync } from "@/impl/lib/util/utimes.js";

/* -------------------------------------------------------------------------- */
/*                                 Public API                                 */
/* -------------------------------------------------------------------------- */

export interface CopyOptions {
  /** Overwrite destination if it exists (falls back to `clobber`) */
  overwrite?: boolean;
  /** Throw if destination exists and won’t be overwritten                */
  errorOnExist?: boolean;
  /** Preserve atime / mtime – ⚠︎ slow on >4 GiB files on 32‑bit Node      */
  preserveTimestamps?: boolean;
  /** Follow symlinks instead of copying the link itself                   */
  dereference?: boolean;
  /** Filter callback: return false to skip a file/directory               */
  filter?: (src: string, dest: string) => boolean;
  /** Explicit chmod bits for new files/dirs                               */
  mode?: number;
  /** *Deprecated* in fs‑extra – kept for BC; default `true`               */
  clobber?: boolean;
}

/**
 * Synchronous, fully‑typed variant of `fs‑extra`’s `copySync`.
 *
 * ```ts
 * copySync('src', 'dest', { overwrite: false, filter: /\\.png$/i.test });
 * ```
 */
export function copySync(
  src: string,
  dest: string,
  options: CopyOptions | ((src: string, dest: string) => boolean) = {},
): void {
  const opts: CopyOptions = typeof options === "function" ? { filter: options } : { ...options };

  // historical default – planned to flip in the next major
  const clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = opts.overwrite ?? clobber;

  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning("Using preserveTimestamps on 32-bit Node is discouraged - it may overflow", {
      code: "FS_EXTRA_WARN0002",
      type: "Warning",
    });
  }

  const { srcStat, destStat } = checkPathsSync(src, dest, "copy", opts);
  checkParentPathsSync(src, srcStat, dest, "copy");

  if (opts.filter && !opts.filter(src, dest)) return;

  const destParent = dirname(dest);
  if (!existsSync(destParent)) mkdirsSync(destParent, {});

  processEntry(destStat, src, dest, opts);
}

export default copySync;

/* -------------------------------------------------------------------------- */
/*                             helpers & internals                            */
/* -------------------------------------------------------------------------- */

const processEntry = (destStat: Stats | BigIntStats | null, src: string, dest: string, opts: CopyOptions): void => {
  const statSync = opts.dereference ? _statSync : lstatSync;
  const srcStat = statSync(src);

  if (srcStat.isDirectory()) onDir(srcStat, destStat, src, dest, opts);
  else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
    onFile(srcStat, destStat, src, dest, opts);
  else if (srcStat.isSymbolicLink()) onLink(destStat, src, dest, opts);
  else if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`);
  else if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`);
  else throw new Error(`Unknown file type: ${src}`);
};

/* ---------------------------------- Files --------------------------------- */

const onFile = (
  srcStat: Stats,
  destStat: Stats | BigIntStats | null,
  src: PathLike,
  dest: PathLike,
  opts: CopyOptions,
): void => {
  // biome-ignore lint/correctness/noVoidTypeReturn: <explanation>
  if (!destStat) return copyFile(srcStat.mode, src, dest, opts);

  if (opts.overwrite) {
    unlinkSync(dest);
    // biome-ignore lint/correctness/noVoidTypeReturn: <explanation>
    return copyFile(srcStat.mode, src, dest, opts);
  }
  if (opts.errorOnExist) {
    throw new Error(`'${String(dest)}' already exists`);
  }
};

const copyFile = (
  srcMode: number,
  src: PathLike,
  dest: PathLike,
  opts: Pick<CopyOptions, "preserveTimestamps">,
): void => {
  copyFileSync(src, dest);
  if (opts.preserveTimestamps) handleTimestamps(srcMode, src, dest);
  chmodSync(dest, srcMode);
};

const handleTimestamps = (srcMode: number, src: PathLike, dest: PathLike): void => {
  // owner‑write bit so utimes doesn’t fail on RO files
  if ((srcMode & 0o200) === 0) chmodSync(dest, srcMode | 0o200);
  const { atime, mtime } = _statSync(src);
  utimesMillisSync(dest, atime, mtime);
};

/* --------------------------------- Dirs ----------------------------------- */

const onDir = (
  srcStat: Stats,
  destStat: Stats | BigIntStats | null,
  src: string,
  dest: string,
  opts: CopyOptions,
): void => {
  if (!destStat) {
    mkdirSync(dest);
    chmodSync(dest, srcStat.mode);
  }
  copyDir(src, dest, opts);
};

const copyDir = (src: string, dest: string, opts: CopyOptions): void => {
  for (const item of readdirSync(src)) {
    const srcItem = join(src, item);
    const destItem = join(dest, item);

    if (opts.filter && !opts.filter(srcItem, destItem)) continue;

    const { destStat } = checkPathsSync(srcItem, destItem, "copy", opts);
    processEntry(destStat, srcItem, destItem, opts);
  }
};

/* ------------------------------- Symlinks --------------------------------- */

const onLink = (destStat: Stats | BigIntStats | null, src: PathLike, dest: PathLike, opts: CopyOptions): void => {
  let resolvedSrc = readlinkSync(src);
  if (opts.dereference) resolvedSrc = resolve(process.cwd(), resolvedSrc);

  if (!destStat) {
    symlinkSync(resolvedSrc, dest);
    return;
  }

  let resolvedDest: string;
  try {
    resolvedDest = readlinkSync(dest);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "EINVAL" || e.code === "UNKNOWN") {
      symlinkSync(resolvedSrc, dest);
      return;
    }
    throw err;
  }

  if (opts.dereference) resolvedDest = resolve(process.cwd(), resolvedDest);

  if (isSrcSubdir(resolvedSrc, resolvedDest)) {
    throw new Error(`Cannot copy '${resolvedSrc}' into its own subdirectory '${resolvedDest}'.`);
  }
  if (isSrcSubdir(resolvedDest, resolvedSrc)) {
    throw new Error(`Cannot overwrite '${resolvedDest}' with its parent '${resolvedSrc}'.`);
  }

  unlinkSync(dest);
  symlinkSync(resolvedSrc, dest);
};
