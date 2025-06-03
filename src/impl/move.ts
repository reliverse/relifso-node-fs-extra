import { renameSync, statSync, unlinkSync, copyFileSync } from "node:fs";
import { rename, stat, unlink, copyFile } from "node:fs/promises";
import { dirname, basename, join as joinPath } from "node:path";

import { mkdirsSync } from "./mkdirs.js";
import { mkdirs } from "./mkdirs.js";
import { pathExists, pathExistsSync } from "./path-exists.js";

export interface MoveOptions {
  /** @deprecated Use `overwrite` instead. This option will be removed in a future. */
  force?: boolean;
  /** Whether to overwrite existing files. Default: false */
  overwrite?: boolean;
  /** @deprecated Use `overwrite`. */
  clobber?: boolean;
  /** Maximum number of retries for EBUSY errors (default: 3) */
  maxRetries?: number;
  /** Delay between retries in milliseconds (default: 100) */
  retryDelay?: number;
  /** Whether to ensure source exists before moving (default: true) */
  ensureSource?: boolean;
  /** Whether to ensure destination directory exists (default: true) */
  ensureDest?: boolean;
  /** Whether to verify operation success (default: true) */
  verify?: boolean;
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
  const {
    overwrite = options.clobber ?? false,
    maxRetries = 3,
    retryDelay = 100,
    ensureSource = true,
    ensureDest = true,
    verify = true,
  } = options;

  // Check if source exists
  if (ensureSource && !pathExistsSync(src)) {
    throw new Error(`Source ${src} does not exist.`);
  }

  const srcStat = statSync(src, { throwIfNoEntry: false });
  if (!srcStat) {
    throw new Error(`Source ${src} does not exist.`);
  }

  let destFinal = dest;
  const destStat = statSync(dest, { throwIfNoEntry: false });

  if (destStat?.isDirectory()) {
    destFinal = joinPath(dest, basename(src));
  }

  if (statSync(destFinal, { throwIfNoEntry: false }) && !overwrite) {
    throw new Error(`Destination ${destFinal} already exists and overwrite is false.`);
  }

  // Ensure destination directory exists
  if (ensureDest) {
    const destDir = dirname(destFinal);
    mkdirsSync(destDir);
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      renameSync(src, destFinal);

      // Verify operation success
      if (verify && !pathExistsSync(destFinal)) {
        throw new Error(`Move operation failed: destination ${destFinal} does not exist after move`);
      }

      return;
    } catch (err: any) {
      lastError = err;
      if (err.code === "EXDEV") {
        copyFileSync(src, destFinal);
        unlinkSync(src);

        // Verify operation success
        if (verify && !pathExistsSync(destFinal)) {
          throw new Error(`Copy and unlink operation failed: destination ${destFinal} does not exist after operation`);
        }

        return;
      } else if (err.code === "EISDIR" || err.code === "EPERM") {
        // On Windows, renameSync fails if dest is an existing directory (even if empty).
        // fs-extra seems to just copy and remove in this case too.
        copyFileSync(src, destFinal);
        unlinkSync(src);

        // Verify operation success
        if (verify && !pathExistsSync(destFinal)) {
          throw new Error(`Copy and unlink operation failed: destination ${destFinal} does not exist after operation`);
        }

        return;
      } else if (err.code === "EBUSY" && attempt < maxRetries - 1) {
        // Wait before retrying
        const start = Date.now();
        while (Date.now() - start < retryDelay) {
          // Busy wait
        }
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function move(src: string, dest: string, options: MoveOptions = {}): Promise<void> {
  const {
    overwrite = options.clobber ?? false,
    maxRetries = 3,
    retryDelay = 100,
    ensureSource = true,
    ensureDest = true,
    verify = true,
  } = options;

  // Check if source exists
  if (ensureSource && !(await pathExists(src))) {
    throw new Error(`Source ${src} does not exist.`);
  }

  const srcStat = await stat(src).catch((e: any) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });
  if (!srcStat) {
    throw new Error(`Source ${src} does not exist.`);
  }

  let destFinal = dest;
  const destStat = await stat(dest).catch((e: any) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });

  if (destStat?.isDirectory()) {
    destFinal = joinPath(dest, basename(src));
  }

  const destFinalStat = await stat(destFinal).catch((e: any) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });
  if (destFinalStat && !overwrite) {
    throw new Error(`Destination ${destFinal} already exists and overwrite is false.`);
  }

  // Ensure destination directory exists
  if (ensureDest) {
    const destDir = dirname(destFinal);
    await mkdirs(destDir);
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await rename(src, destFinal);

      // Verify operation success
      if (verify && !(await pathExists(destFinal))) {
        throw new Error(`Move operation failed: destination ${destFinal} does not exist after move`);
      }

      return;
    } catch (err: any) {
      lastError = err;
      if (err.code === "EXDEV") {
        await copyFile(src, destFinal);
        await unlink(src);

        // Verify operation success
        if (verify && !(await pathExists(destFinal))) {
          throw new Error(`Copy and unlink operation failed: destination ${destFinal} does not exist after operation`);
        }

        return;
      } else if (err.code === "EISDIR" || err.code === "EPERM") {
        await copyFile(src, destFinal);
        await unlink(src);

        // Verify operation success
        if (verify && !(await pathExists(destFinal))) {
          throw new Error(`Copy and unlink operation failed: destination ${destFinal} does not exist after operation`);
        }

        return;
      } else if (err.code === "EBUSY" && attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
