import type { Stats } from "node:fs";

import { statSync } from "node:fs";
import { stat } from "node:fs/promises";

import { logInternal } from "~/utils/log.js";

import { isBun } from "./bun.js";

/**
 * Convert Bun file stats to Node.js Stats object
 * Uses Bun's optimized API when available, falls back to Node.js
 */
export async function toNodeStats(path: string): Promise<Stats> {
  if (!isBun) {
    return stat(path);
  }
  try {
    const file = Bun.file(path);
    const size = file.size;
    const lastModified = new Date(file.lastModified);

    // Create a minimal Stats object with the information we have
    return {
      dev: 0,
      ino: 0,
      mode: 0,
      nlink: 0,
      uid: 0,
      gid: 0,
      rdev: 0,
      size,
      blksize: 0,
      blocks: 0,
      atimeMs: lastModified.getTime(),
      mtimeMs: lastModified.getTime(),
      ctimeMs: lastModified.getTime(),
      birthtimeMs: lastModified.getTime(),
      atime: lastModified,
      mtime: lastModified,
      ctime: lastModified,
      birthtime: lastModified,
      isDirectory: () => false, // Bun doesn't provide this info directly
      isFile: () => true,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isSymbolicLink: () => false,
      isFIFO: () => false,
      isSocket: () => false,
    };
  } catch (error) {
    logInternal(`Failed to convert stats for ${path}: ${error}`);
    return stat(path);
  }
}

/**
 * Get file stats with fallback to Node.js
 * Uses Bun's optimized API when available
 */
export async function getStats(path: string): Promise<Stats> {
  if (!isBun) {
    return stat(path);
  }
  try {
    return await toNodeStats(path);
  } catch (error) {
    logInternal(`Bun stats failed for ${path}, falling back to Node.js: ${error}`);
    return stat(path);
  }
}

/**
 * Get file stats synchronously with fallback to Node.js
 * Uses Bun's optimized API when available
 */
export function getStatsSync(path: string): Stats {
  if (!isBun) {
    return statSync(path);
  }
  try {
    const file = Bun.file(path);
    const size = file.size;
    const lastModified = new Date(file.lastModified);

    return {
      dev: 0,
      ino: 0,
      mode: 0,
      nlink: 0,
      uid: 0,
      gid: 0,
      rdev: 0,
      size,
      blksize: 0,
      blocks: 0,
      atimeMs: lastModified.getTime(),
      mtimeMs: lastModified.getTime(),
      ctimeMs: lastModified.getTime(),
      birthtimeMs: lastModified.getTime(),
      atime: lastModified,
      mtime: lastModified,
      ctime: lastModified,
      birthtime: lastModified,
      isDirectory: () => false,
      isFile: () => true,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isSymbolicLink: () => false,
      isFIFO: () => false,
      isSocket: () => false,
    };
  } catch (error) {
    logInternal(`Bun sync stats failed for ${path}, falling back to Node.js: ${error}`);
    return statSync(path);
  }
}

/**
 * Check if a file exists
 * Uses Bun's optimized API when available, falls back to Node.js
 */
export async function getFileExists(path: string): Promise<boolean> {
  if (!isBun) {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }
  try {
    const file = Bun.file(path);
    return await file.exists();
  } catch (error) {
    logInternal(`Failed to check existence for ${path}: ${error}`);
    return false;
  }
}

/**
 * Get file size
 * Uses Bun's optimized API when available, falls back to Node.js
 */
export async function getFileSize(path: string): Promise<number> {
  if (!isBun) {
    try {
      const stats = await stat(path);
      return stats.size;
    } catch (error) {
      logInternal(`Failed to get size for ${path}: ${error}`);
      return 0;
    }
  }
  try {
    const file = Bun.file(path);
    return file.size;
  } catch (error) {
    logInternal(`Failed to get size for ${path}: ${error}`);
    return 0;
  }
}

/**
 * Get file last modified time
 * Uses Bun's optimized API when available, falls back to Node.js
 */
export async function getFileLastModified(path: string): Promise<Date> {
  if (!isBun) {
    try {
      const stats = await stat(path);
      return stats.mtime;
    } catch (error) {
      logInternal(`Failed to get last modified time for ${path}: ${error}`);
      return new Date(0);
    }
  }
  try {
    const file = Bun.file(path);
    return new Date(file.lastModified);
  } catch (error) {
    logInternal(`Failed to get last modified time for ${path}: ${error}`);
    return new Date(0);
  }
}
