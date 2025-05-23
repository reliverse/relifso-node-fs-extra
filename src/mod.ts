import type { Stats, Dirent } from "node:fs";

import {
  // Aliases
  renameSync as nodeRenameSync,
  unlinkSync as nodeUnlinkSync,
  // Direct imports from node:fs
  accessSync,
  constants,
  readdirSync,
  statSync,
  copyFileSync,
  appendFileSync,
  chmodSync,
  chownSync,
  closeSync,
  createReadStream,
  createWriteStream,
  fchmodSync,
  fchownSync,
  fdatasyncSync,
  fstatSync,
  fsyncSync,
  ftruncateSync,
  futimesSync,
  lchmodSync,
  lchownSync,
  linkSync,
  lstatSync,
  lutimesSync,
  mkdtempSync,
  openSync,
  opendirSync,
  readSync,
  readlinkSync,
  realpathSync,
  rmSync,
  rmdirSync,
  statfsSync,
  symlinkSync,
  truncateSync,
  unwatchFile,
  utimesSync,
  watchFile,
  writeFileSync,
  writeSync,
  readvSync,
  writevSync,
} from "node:fs";
import {
  // Aliases
  readdir as nodeReaddirInternal,
  stat as nodeStatInternal,
  rename as nodeRename,
  unlink as nodeUnlink,
  // Direct imports from node:fs/promises
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  lchmod,
  lchown,
  link,
  lstat,
  lutimes,
  mkdtemp,
  open,
  opendir,
  readdir,
  readlink,
  realpath,
  rm,
  rmdir,
  stat,
  statfs,
  symlink,
  truncate,
  utimes,
  watch,
  writeFile,
} from "node:fs/promises";
import { join as pathJoin, resolve } from "node:path";

import type { DiveOptions } from "./impl/dive.js";

import { copy, copySync } from "./impl/copy.js";
import { createFile, createFileSync } from "./impl/create-file.js";
import { diveSync } from "./impl/dive.js";
import { emptyDir, emptyDirSync } from "./impl/empty-dir.js";
import { mkdirs, mkdirsSync } from "./impl/mkdirs.js";
import { move, moveSync } from "./impl/move.js";
import { outputFile, outputFileSync } from "./impl/output-file.js";
import { outputJson, outputJsonSync } from "./impl/output-json.js";
import { pathExists, pathExistsSync } from "./impl/path-exists.js";
import { readFile, readFileSync } from "./impl/read-file.js";
import { readJson, readJsonSync, type ReadJsonOptions as _ReadJsonOptions } from "./impl/read-json.js";
import { remove, removeSync } from "./impl/remove.js";
import { writeJson, writeJsonSync } from "./impl/write-json.js";

// Helper async generator
async function* _diveWorker(
  currentPath: string,
  options: DiveOptions,
  currentDepth: number,
): AsyncGenerator<{ file: string; stat: Stats }> {
  const maxDepth = options.depth ?? Number.POSITIVE_INFINITY;
  if (currentDepth > maxDepth) {
    return;
  }

  let entries: Dirent[];
  try {
    entries = await nodeReaddirInternal(currentPath, { withFileTypes: true });
  } catch (_err) {
    // TODO: How to handle permission errors etc.? For now, maybe we can rethrow or log.
    // fs-extra's dive seems to swallow errors on readdir and continue, which might be desirable.
    // For now, it propagate, or user can wrap dive() in try-catch.
    // console.error(`Error reading directory ${currentPath}:`, err);
    return; // Silently stop processing this path on error for now
  }

  for (const entry of entries) {
    const entryPath = pathJoin(currentPath, entry.name);

    if (!(options.all ?? false) && entry.name.startsWith(".")) {
      continue;
    }

    if (options.ignore) {
      if (Array.isArray(options.ignore) && options.ignore.some((pattern) => entry.name.includes(pattern))) {
        continue;
      }
      if (options.ignore instanceof RegExp && options.ignore.test(entryPath)) {
        continue;
      }
    }

    let entryStat: Stats;
    try {
      entryStat = await nodeStatInternal(entryPath);
    } catch (_err) {
      // Failed to stat (e.g. broken symlink, permissions), skip this entry
      // console.error(`Error stating file ${entryPath}:`, err);
      continue; // Silently stop processing this path on error for now
    }

    if (entry.isDirectory()) {
      if (options.directories ?? false) {
        yield { file: entryPath, stat: entryStat };
      }
      if (options.recursive ?? true) {
        if (currentDepth < maxDepth) {
          // Ensure not to exceed depth
          yield* _diveWorker(entryPath, options, currentDepth + 1);
        }
      }
    } else if (entry.isFile()) {
      if (options.files ?? true) {
        yield { file: entryPath, stat: entryStat };
      }
    }
    // Not explicitly handling symlinks, block devices, etc., beyond what isFile/isDirectory covers.
    // User can inspect stat object if more detail is needed.
  }
}

/**
 * Recursively dives into a directory and yields files and directories.
 * @param directory - The directory to dive into.
 * @param action - An optional callback function to execute for each file or directory.
 * @param options - An optional object containing options for the dive.
 * @returns A Promise that resolves to an array of file paths if no action is provided, or void if an action is provided.
 */
export async function dive(
  directory: string,
  action: (file: string, stat: Stats) => void | Promise<void>,
  options?: DiveOptions,
): Promise<void>;
export async function dive(directory: string, options?: DiveOptions): Promise<string[]>;
export async function dive(
  directory: string,
  actionOrOptions?: ((file: string, stat: Stats) => void | Promise<void>) | DiveOptions,
  optionsOnly?: DiveOptions,
): Promise<void | string[]> {
  let action: ((file: string, stat: Stats) => void | Promise<void>) | undefined;
  let options: DiveOptions | undefined;

  if (typeof actionOrOptions === "function") {
    action = actionOrOptions;
    options = optionsOnly;
  } else {
    options = actionOrOptions;
  }

  const currentOptions: DiveOptions = {
    recursive: true,
    files: true,
    directories: false,
    all: false,
    depth: Number.POSITIVE_INFINITY,
    ...options, // User options override defaults
  };

  if (action) {
    for await (const { file, stat: entryStat } of _diveWorker(directory, currentOptions, 0)) {
      await action(file, entryStat);
    }
    return;
  } else {
    const results: string[] = [];
    for await (const { file } of _diveWorker(directory, currentOptions, 0)) {
      results.push(file);
    }
    return results;
  }
}

// alias
const mkdirp = mkdirs;
const ensureDir = mkdirs;
const ensureFile = createFile;
const rimraf = remove;
const ncp = copy;
const mkdirpSync = mkdirsSync;
const ensureDirSync = mkdirsSync;
const ensureFileSync = createFileSync;
const rimrafSync = removeSync;
const ncpSync = copySync;
const mkdir = mkdirs;
const mkdirSync = mkdirsSync;
const unlink = remove;
const unlinkSync = removeSync;
const rename = move;
const renameSync = moveSync;
const readJSON = readJson;
const readJSONSync = readJsonSync;
const writeJSON = writeJson;
const writeJSONSync = writeJsonSync;
const outputJSON = outputJson;
const outputJSONSync = outputJsonSync;
const cp = copy;
const cpSync = copySync;
const exists = pathExists;
const existsSync = pathExistsSync;

// Simple implementations
async function readText(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = "utf8",
) {
  return readFile(filePath, options as any);
}
function readTextSync(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = "utf8",
) {
  return readFileSync(filePath, options as any);
}
async function readLines(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = { encoding: "utf8" },
) {
  const effectiveOptions = typeof options === "string" ? { encoding: options } : options;
  const contentBuffer = await readFile(filePath, { ...effectiveOptions, encoding: null });
  return contentBuffer.split(/\r?\n/);
}
function readLinesSync(
  filePath: string,
  options: BufferEncoding | { encoding?: BufferEncoding | null; flag?: string } = { encoding: "utf8" },
) {
  const effectiveOptions = typeof options === "string" ? { encoding: options } : options;
  const contentBuffer = readFileSync(filePath, { ...effectiveOptions, encoding: null });
  const content = contentBuffer;
  return content.split(/\r?\n/);
}
async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath); // Uses our stat, which uses node:fs/promises
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }
    throw error;
  }
}
function isDirectorySync(filePath: string): boolean {
  try {
    const stats = statSync(filePath); // Uses our statSync, which uses node:fs
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }
    throw error;
  }
}
async function isSymlink(filePath: string): Promise<boolean> {
  try {
    const stats = await lstat(filePath); // uses node:fs/promises lstat
    return stats.isSymbolicLink();
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function isSymlinkSync(filePath: string): boolean {
  try {
    const stats = lstatSync(filePath); // uses node:fs lstatSync
    return stats.isSymbolicLink();
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export type { CopyOptions } from "./impl/copy.js";
export type { MoveOptions } from "./impl/move.js";
export type { ReadFileOptions } from "./impl/read-file.js";
export type { ReadJsonOptions } from "./impl/read-json.js";
export type { JsonStringifyOptions } from "./impl/write-json.js";
export type { WriteJsonOptions } from "./impl/write-json.js";

// Named exports
export {
  // Sync direct exports (node:fs)
  accessSync,
  appendFileSync,
  chmodSync,
  chownSync,
  closeSync,
  copyFileSync,
  createReadStream,
  createWriteStream,
  fchmodSync,
  fchownSync,
  fdatasyncSync,
  fstatSync,
  fsyncSync,
  ftruncateSync,
  futimesSync,
  lchmodSync,
  lchownSync,
  linkSync,
  lstatSync,
  lutimesSync,
  mkdtempSync,
  openSync,
  opendirSync,
  readFileSync,
  readlinkSync,
  readSync,
  readdirSync,
  realpathSync,
  nodeRenameSync,
  rmSync,
  rmdirSync,
  statSync,
  statfsSync,
  symlinkSync,
  truncateSync,
  nodeUnlinkSync,
  unwatchFile,
  utimesSync,
  watchFile,
  writeFileSync,
  writeSync,
  readvSync,
  writevSync,
  readJsonSync,
  writeJsonSync,
  createFileSync,
  mkdirsSync,
  emptyDirSync,
  pathExistsSync,
  copySync,
  moveSync,
  removeSync,
  outputJsonSync,
  outputFileSync,
  diveSync,
  // Sync aliases
  cpSync,
  ensureDirSync as ensuredirSync,
  ensureDirSync,
  ensureFileSync,
  existsSync,
  mkdirpSync,
  mkdirSync,
  ncpSync,
  outputJSONSync,
  readJSONSync,
  renameSync,
  rimrafSync,
  unlinkSync,
  writeJSONSync,
  // Simple sync custom implementations
  isDirectorySync,
  isSymlinkSync,
  readLinesSync,
  readTextSync,
  // Async direct exports (node:fs/promises)
  readJson,
  writeJson,
  createFile,
  mkdirs,
  emptyDir,
  pathExists,
  copy,
  move,
  remove,
  outputJson,
  outputFile,
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  lchmod,
  lchown,
  link,
  lstat,
  lutimes,
  mkdtemp,
  open,
  opendir,
  readFile,
  readdir,
  readlink,
  realpath,
  nodeRename,
  rm,
  rmdir,
  stat,
  statfs,
  symlink,
  truncate,
  nodeUnlink,
  utimes,
  watch,
  writeFile,
  // Async aliases
  constants,
  cp,
  ensureDir as ensuredir,
  ensureDir,
  ensureFile,
  exists,
  mkdir,
  mkdirp,
  ncp,
  outputJSON,
  readJSON,
  rename,
  resolve,
  rimraf,
  unlink,
  writeJSON,
  // Simple async custom implementations
  isDirectory,
  isSymlink,
  readLines,
  readText,
};

// default export - ensure this mirrors the named exports
const fs = {
  // Sync direct exports (node:fs)
  accessSync,
  appendFileSync,
  chmodSync,
  chownSync,
  closeSync,
  copyFileSync,
  createReadStream,
  createWriteStream,
  fchmodSync,
  fchownSync,
  fdatasyncSync,
  fstatSync,
  fsyncSync,
  ftruncateSync,
  futimesSync,
  lchmodSync,
  lchownSync,
  linkSync,
  lstatSync,
  lutimesSync,
  mkdtempSync,
  openSync,
  opendirSync,
  readFileSync,
  readlinkSync,
  readSync,
  readdirSync,
  realpathSync,
  nodeRenameSync,
  rmSync,
  rmdirSync,
  statSync,
  statfsSync,
  symlinkSync,
  truncateSync,
  nodeUnlinkSync,
  unwatchFile,
  utimesSync,
  watchFile,
  writeFileSync,
  writeSync,
  readvSync,
  writevSync,
  readJsonSync,
  writeJsonSync,
  createFileSync,
  mkdirsSync,
  emptyDirSync,
  pathExistsSync,
  copySync,
  moveSync,
  removeSync,
  outputJsonSync,
  outputFileSync,
  diveSync,
  // Sync aliases
  cpSync,
  ensuredirSync: ensureDirSync,
  ensureDirSync,
  ensureFileSync,
  existsSync,
  mkdirpSync,
  mkdirSync,
  ncpSync,
  outputJSONSync,
  readJSONSync,
  renameSync,
  rimrafSync,
  unlinkSync,
  writeJSONSync,
  // Simple sync custom implementations
  isDirectorySync,
  isSymlinkSync,
  readLinesSync,
  readTextSync,
  // Async direct exports (node:fs/promises)
  readJson,
  writeJson,
  createFile,
  mkdirs,
  emptyDir,
  pathExists,
  copy,
  move,
  remove,
  outputJson,
  outputFile,
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  lchmod,
  lchown,
  link,
  lstat,
  lutimes,
  mkdtemp,
  open,
  opendir,
  readFile,
  readdir,
  readlink,
  realpath,
  nodeRename,
  rm,
  rmdir,
  stat,
  statfs,
  symlink,
  truncate,
  nodeUnlink,
  utimes,
  watch,
  writeFile,
  // Async aliases
  constants,
  cp,
  ensureDir,
  ensuredir: ensureDir,
  ensureFile,
  exists,
  mkdir,
  mkdirp,
  ncp,
  outputJSON,
  readJSON,
  rename,
  resolve,
  rimraf,
  unlink,
  writeJSON,
  // Simple async custom implementations
  isDirectory,
  isSymlink,
  readLines,
  readText,
};

export default fs;
