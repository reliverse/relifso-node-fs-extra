import type { Stats, Dirent } from "node:fs";

import { readdir as nodeReaddirInternal, stat as nodeStatInternal, readdir, stat } from "node:fs/promises";
import { join as pathJoin } from "node:path";

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
import { writeFile, writeFileSync } from "./impl/write-file.js";
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
    // Use the internally imported readdir from node:fs/promises
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
      // Use the internally imported stat from node:fs/promises
      entryStat = await nodeStatInternal(entryPath);
    } catch (_err) {
      // Failed to stat (e.g. broken symlink, permissions), skip this entry
      // console.error(`Error stating file ${entryPath}:`, err);
      continue;
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

// dive is a generator, so toAsync isn't directly applicable.
// fs-extra's async dive is callback-based or uses streams, not a direct Promise wrapper of a generator.
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

export {
  // async methods
  readJson,
  writeJson,
  createFile,
  writeFile,
  readFile,
  mkdirs,
  emptyDir,
  pathExists,
  copy,
  move,
  remove,
  readdir,
  stat,
  // sync methods
  readJsonSync,
  writeJsonSync,
  createFileSync,
  writeFileSync,
  readFileSync,
  mkdirsSync,
  emptyDirSync,
  pathExistsSync,
  copySync,
  moveSync,
  removeSync,
  // alias
  mkdirp,
  mkdirpSync,
  rimraf,
  rimrafSync,
  ncp,
  ncpSync,
  ensureDir,
  ensureDirSync,
  ensureFile,
  ensureFileSync,
  outputJson,
  outputJsonSync,
  outputFile,
  outputFileSync,
  diveSync,
};

export type { CopyOptions } from "./impl/copy.js";
export type { MoveOptions } from "./impl/move.js";
export type { ReadFileOptions } from "./impl/read-file.js";
export type { ReadJsonOptions } from "./impl/read-json.js";
export type { JsonStringifyOptions } from "./impl/write-json.js";
export type { WriteJsonOptions } from "./impl/write-json.js";
