import { renameSync, statSync, unlinkSync, copyFileSync } from "node:fs";
import { dirname, basename, join as joinPath } from "node:path";

import { mkdirsSync } from "./mkdirs.js";

export interface MoveOptions {
  overwrite?: boolean;
  /** @deprecated Use `overwrite`. */
  clobber?: boolean;
}

/**
 * Moves a file or directory. If the destination is a directory, the source is moved into it.
 * If the destination exists and is a file, it will be overwritten if `overwrite` is true.
 *
 * @param src - The source path.
 * @param dest - The destination path.
 * @param options - Options for the move operation.
 */
export function moveSync(src: string, dest: string, options: MoveOptions = {}): void {
  let overwrite: boolean;
  if (options.overwrite !== undefined) {
    overwrite = options.overwrite;
  } else if (options.clobber !== undefined) {
    console.warn(
      "Warning: The 'clobber' option in moveSync is deprecated and will be removed in a future version. Please use 'overwrite' instead.",
    );
    overwrite = options.clobber;
  } else {
    overwrite = false;
  }

  const srcStat = statSync(src, { throwIfNoEntry: true });
  if (!srcStat) {
    // Source does not exist, fs-extra throws an ENOENT error here via native fs.renameSync
    // Currently we let renameSync handle this.
  }

  let destFinal = dest;
  const destStat = statSync(dest, { throwIfNoEntry: false });

  if (destStat?.isDirectory()) {
    destFinal = joinPath(dest, basename(src));
  }

  if (statSync(destFinal, { throwIfNoEntry: false }) && !overwrite) {
    throw new Error(`Destination ${destFinal} already exists and overwrite is false.`);
  }

  const destDir = dirname(destFinal);
  mkdirsSync(destDir);

  try {
    renameSync(src, destFinal);
  } catch (err: any) {
    if (err.code === "EXDEV") {
      copyFileSync(src, destFinal);
      unlinkSync(src);
    } else if (err.code === "EISDIR" || err.code === "EPERM") {
      // On Windows, renameSync fails if dest is an existing directory (even if empty).
      // fs-extra seems to just copy and remove in this case too.
      copyFileSync(src, destFinal);
      unlinkSync(src);
    } else {
      throw err;
    }
  }
}
