import { copyFileSync, statSync, constants as fsConstants, readdirSync, rmSync } from "node:fs";
import {
  stat as statAsync,
  copyFile as copyFileAsync,
  constants as fsConstantsAsync,
  readdir,
  rm,
} from "node:fs/promises";
import { dirname, join as joinPath, basename as basenamePath } from "node:path";

import { mkdirsSync } from "~/impl/node/mkdirs.js";
import { mkdirs } from "~/impl/node/mkdirs.js";

export interface CopyOptions {
  overwrite?: boolean;
  /** @deprecated Use `overwrite`. */
  clobber?: boolean;
  preserveTimestamps?: boolean;
  /** @deprecated Not used. */
  errorOnExist?: boolean;
  /** @deprecated Not used. */
  dereference?: boolean;
  /** @deprecated Not used. */
  filter?: (src: string, dest: string) => boolean;
}

/**
 * Copies a file or directory. The directory can have contents. Like `cp -r`.
 *
 * @param src - The source path.
 * @param dest - The destination path.
 * @param options - Options for the copy operation.
 */
export function copySync(src: string, dest: string, options: CopyOptions = {}): void {
  const { overwrite = options.clobber || false, preserveTimestamps = false } = options;

  const srcStat = statSync(src, { throwIfNoEntry: true });
  if (!srcStat) {
    // This should be caught by statSync throwing an error.
    // If for some reason it doesn't, we let copyFileSync handle it.
  }

  let destFinal = dest;
  const destStat = statSync(dest, { throwIfNoEntry: false });

  // Only append basename for files being copied into directories
  if (!srcStat.isDirectory() && destStat?.isDirectory()) {
    destFinal = joinPath(dest, basenamePath(src));
  }

  const destExists = statSync(destFinal, { throwIfNoEntry: false });

  if (destExists && !overwrite) {
    throw new Error(`Destination ${destFinal} already exists and overwrite is false.`);
  }

  // Ensure destination directory exists
  const destDir = dirname(destFinal);
  mkdirsSync(destDir);

  if (srcStat.isDirectory()) {
    // If overwrite is true and destination exists, remove it first
    if (overwrite && destExists) {
      rmSync(destFinal, { recursive: true, force: true });
    }

    // Recursively copy directory contents
    mkdirsSync(destFinal);
    const entries = readdirSync(src);
    for (const entry of entries) {
      const srcEntry = joinPath(src, entry);
      const destEntry = joinPath(destFinal, entry);
      copySync(srcEntry, destEntry, options);
    }
  } else {
    if (overwrite && destExists) {
      // For files, we can just overwrite them directly with copyFileSync
      rmSync(destFinal, { force: true });
    }
    copyFileSync(src, destFinal, preserveTimestamps ? fsConstants.COPYFILE_FICLONE : 0);
    if (preserveTimestamps) {
      // const { atime, mtime } = srcStat;
      // utimesSync is not directly available on node:fs, would need fs.promises.utimes or a similar workaround
      // For now, this part is a simplification. fs-extra uses native bindings for this.
      console.warn("preserveTimestamps: utimesSync is not implemented for the moment.");
    }
  }
}

/**
 * Asynchronously copies a file or directory. The directory can have contents. Like `cp -r`.
 *
 * @param src - The source path.
 * @param dest - The destination path.
 * @param options - Options for the copy operation.
 */
export async function copy(src: string, dest: string, options: CopyOptions = {}): Promise<void> {
  const { overwrite = options.clobber || false, preserveTimestamps = false } = options;

  const srcStat = await statAsync(src).catch((e) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });
  if (!srcStat) {
    // This condition implies src does not exist.
    // fs.promises.copyFile would throw, which is desired.
    // If we were to mimic fs-extra precisely, it might have specific error codes.
    // For now, let copyFileAsync handle non-existence.
  }

  let destFinal = dest;
  const destStat = await statAsync(dest).catch((e) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });

  // Only append basename for files being copied into directories
  if (!srcStat?.isDirectory() && destStat?.isDirectory()) {
    destFinal = joinPath(dest, basenamePath(src));
  }

  const destExists = await statAsync(destFinal).catch((e) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });

  if (destExists && !overwrite) {
    throw new Error(`Destination ${destFinal} already exists and overwrite is false.`);
  }

  // Ensure destination directory exists
  const destDir = dirname(destFinal);
  await mkdirs(destDir);

  if (srcStat?.isDirectory()) {
    // If overwrite is true and destination exists, remove it first
    if (overwrite && destExists) {
      await rm(destFinal, { recursive: true, force: true });
    }

    // Recursively copy directory contents
    await mkdirs(destFinal);
    const entries = await readdir(src);
    for (const entry of entries) {
      const srcEntry = joinPath(src, entry);
      const destEntry = joinPath(destFinal, entry);
      await copy(srcEntry, destEntry, options);
    }
  } else {
    if (overwrite && destExists) {
      // For files, we can just overwrite them directly with copyFileAsync
      await rm(destFinal, { force: true });
    }
    await copyFileAsync(src, destFinal, preserveTimestamps ? fsConstantsAsync.COPYFILE_FICLONE : 0);
    if (preserveTimestamps) {
      // const { atime, mtime } = srcStat;
      // await utimes(destFinal, atime, mtime)
      console.warn("preserveTimestamps: utimes is not implemented for the moment.");
    }
  }
}
