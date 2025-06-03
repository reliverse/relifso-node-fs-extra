import {
  copyFileSync,
  statSync,
  constants as fsConstants,
  readdirSync,
  rmSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
} from "node:fs";
import {
  stat as statAsync,
  copyFile as copyFileAsync,
  constants as fsConstantsAsync,
  readdir,
  rm,
  lstat,
  readlink,
  symlink,
} from "node:fs/promises";
import { dirname, join as joinPath } from "node:path";

import { mkdirsSync } from "~/impl/mkdirs.js";
import { mkdirs } from "~/impl/mkdirs.js";
import { logInternal } from "~/utils/log.js";

import { isBun, getFileBun } from "./bun.js";
import { pathExists, pathExistsSync } from "./path-exists.js";
import { getStats, getStatsSync } from "./stats.js";

export interface CopyOptions {
  /** @deprecated Use `overwrite` instead. This option will be removed in a future. */
  force?: boolean;
  /** Whether to overwrite existing files. Default: true */
  overwrite?: boolean;
  /** @deprecated Use `overwrite`. */
  clobber?: boolean;
  /** Whether to preserve timestamps. Default: false */
  preserveTimestamps?: boolean;
  /** Whether to recursively copy directories. Default: false */
  recursive?: boolean;
  /** Whether to dereference symlinks. Default: false */
  dereference?: boolean;
  /** Whether to throw an error if the destination exists. Default: false */
  errorOnExist?: boolean;
  /** Whether to ensure source exists before copying (default: true) */
  ensureSource?: boolean;
  /** Whether to ensure destination directory exists (default: true) */
  ensureDest?: boolean;
  /** Whether to verify operation success (default: true) */
  verify?: boolean;
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
  const {
    overwrite = options.clobber ?? true,
    force = true,
    recursive = true,
    dereference = false,
    errorOnExist = false,
    ensureSource = true,
    ensureDest = true,
    verify = true,
  } = options;

  // Check if source exists
  if (ensureSource && !pathExistsSync(src)) {
    throw new Error(`Source ${src} does not exist.`);
  }

  // If running in Bun and it's a file (not a directory), use Bun's optimized copy
  if (isBun && !dereference) {
    try {
      const srcStat = getStatsSync(src);
      if (!srcStat.isDirectory()) {
        // Check if destination exists
        try {
          const destStat = getStatsSync(dest);
          if (destStat) {
            if (errorOnExist) {
              throw new Error(`Destination ${dest} already exists.`);
            }
            if (!force && !overwrite) {
              throw new Error(`Destination ${dest} already exists and overwrite is false.`);
            }
            // Remove existing file if force/overwrite is true
            if (force || overwrite) {
              rmSync(dest, { force: true });
            }
          }
        } catch (_error) {
          // Destination doesn't exist, which is fine
        }

        // Ensure destination directory exists
        if (ensureDest) {
          const destDir = dirname(dest);
          mkdirsSync(destDir);
        }

        try {
          // For sync version, use Node.js copyFileSync as fallback
          // since Bun.write is async-only
          copyFileSync(src, dest, fsConstants.COPYFILE_FICLONE);

          // Verify operation success
          if (verify && !pathExistsSync(dest)) {
            throw new Error(`Copy operation failed: destination ${dest} does not exist after copy`);
          }

          logInternal("[env] copySync was successfully executed in Bun");
          return;
        } catch (error) {
          logInternal(`Copy failed for ${dest}, falling back to Node.js implementation: ${error}`);
          // Continue to Node.js implementation
        }
      }
    } catch (error) {
      // If Bun's copy fails, fall back to Node.js implementation
      logInternal(`Bun copy failed for ${src}, falling back to Node.js implementation: ${error}`);
    }
  }

  // Node.js implementation
  const srcStat = dereference ? statSync(src, { throwIfNoEntry: true }) : lstatSync(src, { throwIfNoEntry: true });

  if (srcStat.isDirectory()) {
    if (!recursive) {
      throw new Error(`Cannot copy directory ${src} without recursive flag`);
    }

    // Create destination directory if it doesn't exist
    if (ensureDest) {
      mkdirsSync(dest);
    }

    // Read source directory
    const entries = readdirSync(src, { withFileTypes: true });

    // Copy each entry
    for (const entry of entries) {
      const srcPath = joinPath(src, entry.name);
      const destPath = joinPath(dest, entry.name);

      if (entry.isDirectory()) {
        copySync(srcPath, destPath, options);
      } else if (entry.isFile()) {
        copyFileSync(srcPath, destPath, fsConstants.COPYFILE_FICLONE);
      } else if (entry.isSymbolicLink()) {
        const target = readlinkSync(srcPath);
        symlinkSync(target, destPath);
      }
    }

    // Verify operation success for directories
    if (verify && !pathExistsSync(dest)) {
      throw new Error(`Copy operation failed: destination directory ${dest} does not exist after copy`);
    }
    logInternal("[env] copySync was successfully executed in Node.js");
  } else {
    // Ensure destination directory exists
    if (ensureDest) {
      mkdirsSync(dirname(dest));
    }

    // Check if destination exists
    const destExists = statSync(dest, { throwIfNoEntry: false });
    if (destExists) {
      if (errorOnExist) {
        throw new Error(`Destination ${dest} already exists.`);
      }
      if (!force && !overwrite) {
        throw new Error(`Destination ${dest} already exists and overwrite is false.`);
      }
      // Remove existing file if force/overwrite is true
      if (force || overwrite) {
        rmSync(dest, { force: true });
      }
    }

    // Copy the file
    copyFileSync(src, dest, fsConstants.COPYFILE_FICLONE);

    // Verify operation success for files
    if (verify && !pathExistsSync(dest)) {
      throw new Error(`Copy operation failed: destination file ${dest} does not exist after copy`);
    }
    logInternal("[env] copySync was successfully executed in Node.js");
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
  const {
    overwrite = options.clobber ?? true,
    force = true,
    recursive = true,
    dereference = false,
    errorOnExist = false,
    ensureSource = true,
    ensureDest = true,
    verify = true,
  } = options;

  // Check if source exists
  if (ensureSource && !(await pathExists(src))) {
    throw new Error(`Source ${src} does not exist.`);
  }

  // If running in Bun and it's a file (not a directory), use Bun's optimized copy
  if (isBun && !dereference) {
    try {
      const srcStat = await getStats(src);
      if (!srcStat.isDirectory()) {
        // For files, use Bun's optimized copy
        const srcFile = getFileBun(src);
        const destFile = getFileBun(dest);

        // Check if destination exists
        try {
          const destStat = await getStats(dest);
          if (destStat) {
            if (errorOnExist) {
              throw new Error(`Destination ${dest} already exists.`);
            }
            if (!force && !overwrite) {
              throw new Error(`Destination ${dest} already exists and overwrite is false.`);
            }
            // Remove existing file if force/overwrite is true
            if (force || overwrite) {
              await rm(dest, { force: true });
            }
          }
        } catch (_error) {
          // Destination doesn't exist, which is fine
        }

        // Ensure destination directory exists
        if (ensureDest) {
          const destDir = dirname(dest);
          await mkdirs(destDir);
        }

        try {
          // Read the source file content first
          const content = await srcFile?.text();

          // Use Bun's optimized write with explicit text content
          await Bun.write(destFile, content);

          // Verify operation success
          if (verify && !(await pathExists(dest))) {
            throw new Error(`Bun write failed: destination ${dest} does not exist after write`);
          }

          logInternal("[env] copy was successfully executed in Bun");
          return;
        } catch (error) {
          logInternal(`Bun write failed for ${dest}, falling back to Node.js implementation: ${error}`);
          // Continue to Node.js implementation
        }
      }
    } catch (error) {
      // If Bun's copy fails, fall back to Node.js implementation
      logInternal(`Bun copy failed for ${src}, falling back to Node.js implementation: ${error}`);
    }
  }

  // Node.js implementation
  const srcStat = await (dereference ? statAsync(src) : lstat(src)).catch((e: NodeJS.ErrnoException) => {
    if (e.code === "ENOENT") return null;
    throw e;
  });

  if (!srcStat) {
    throw new Error(`Source ${src} does not exist`);
  }

  if (srcStat.isDirectory()) {
    if (!recursive) {
      throw new Error(`Cannot copy directory ${src} without recursive flag`);
    }

    // Create destination directory if it doesn't exist
    if (ensureDest) {
      await mkdirs(dest);
    }

    // Read source directory
    const entries = await readdir(src, { withFileTypes: true });

    // Copy each entry
    for (const entry of entries) {
      const srcPath = joinPath(src, entry.name);
      const destPath = joinPath(dest, entry.name);

      if (entry.isDirectory()) {
        await copy(srcPath, destPath, options);
      } else if (entry.isFile()) {
        await copyFileAsync(srcPath, destPath, fsConstantsAsync.COPYFILE_FICLONE);
      } else if (entry.isSymbolicLink()) {
        const target = await readlink(srcPath);
        await symlink(target, destPath);
      }
    }

    // Verify operation success for directories
    if (verify && !(await pathExists(dest))) {
      throw new Error(`Copy operation failed: destination directory ${dest} does not exist after copy`);
    }
    logInternal("[env] copy was successfully executed in Node.js");
  } else {
    // Ensure destination directory exists
    if (ensureDest) {
      await mkdirs(dirname(dest));
    }

    // Check if destination exists
    const destExists = await statAsync(dest).catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return null;
      throw e;
    });

    if (destExists) {
      if (errorOnExist) {
        throw new Error(`Destination ${dest} already exists.`);
      }
      if (!force && !overwrite) {
        throw new Error(`Destination ${dest} already exists and overwrite is false.`);
      }
      // Remove existing file if force/overwrite is true
      if (force || overwrite) {
        await rm(dest, { force: true });
      }
    }

    // Copy the file
    await copyFileAsync(src, dest, fsConstantsAsync.COPYFILE_FICLONE);

    // Verify operation success for files
    if (verify && !(await pathExists(dest))) {
      throw new Error(`Copy operation failed: destination file ${dest} does not exist after copy`);
    }
    logInternal("[env] copy was successfully executed in Node.js");
  }
}
