import type { Stats, Dirent } from "node:fs";

import { readdirSync, statSync } from "node:fs";
import { readdir as nodeReaddirInternal, stat as nodeStatInternal } from "node:fs/promises";
import { join } from "node:path";
import { join as pathJoin } from "node:path";

import { isBun } from "./bun.js";
import { getStats } from "./stats.js";

export interface DiveOptions {
  all?: boolean; // Include files and directories starting with '.'
  recursive?: boolean; // Recurse into subdirectories
  directories?: boolean; // Report directories
  files?: boolean; // Report files
  ignore?: string[] | RegExp; // Patterns to ignore
  depth?: number; // Max depth to recurse
}

/**
 * Synchronously walks a directory and yields each file and/or directory path.
 *
 * @param dir - The directory to walk.
 * @param callbackOrOptions - A callback function to execute for each entry, or options object.
 * @param options - Options for the dive operation if a callback is provided as the second argument.
 */
export function* diveSync(
  dir: string,
  callbackOrOptions?: ((path: string, stat: ReturnType<typeof statSync>) => void) | DiveOptions,
  options?: DiveOptions,
): Generator<string, void, unknown> {
  const currentDepth = 0;
  let actualOptions: DiveOptions = {
    recursive: true,
    files: true,
    directories: false, // fs-extra's dive by default only yields files
  };
  let callback: ((path: string, stat: ReturnType<typeof statSync>) => void) | undefined;

  if (typeof callbackOrOptions === "function") {
    callback = callbackOrOptions;
    if (options) {
      actualOptions = { ...actualOptions, ...options };
    }
  } else if (typeof callbackOrOptions === "object") {
    actualOptions = { ...actualOptions, ...callbackOrOptions };
  }

  function* walk(currentPath: string, depth: number): Generator<string, void, unknown> {
    if (actualOptions.depth !== undefined && depth > actualOptions.depth) {
      return;
    }

    const entries = readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(currentPath, entry.name);

      if (!actualOptions.all && entry.name.startsWith(".")) {
        continue;
      }

      if (actualOptions.ignore) {
        if (Array.isArray(actualOptions.ignore) && actualOptions.ignore.includes(entry.name)) {
          continue;
        }
        if (actualOptions.ignore instanceof RegExp && actualOptions.ignore.test(entryPath)) {
          continue;
        }
      }

      const stat = statSync(entryPath); // statSync follows symlinks by default

      if (entry.isFile()) {
        if (actualOptions.files) {
          if (callback) callback(entryPath, stat);
          yield entryPath;
        }
      } else if (entry.isDirectory()) {
        if (actualOptions.directories) {
          if (callback) callback(entryPath, stat);
          yield entryPath;
        }
        if (actualOptions.recursive) {
          yield* walk(entryPath, depth + 1);
        }
      }
      // Not handling symlinks, block devices, etc., similar to fs-extra's basic dive
    }
  }

  yield* walk(dir, currentDepth);
}

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
      // Use Bun's optimized stats if available
      if (isBun) {
        try {
          entryStat = await getStats(entryPath);
        } catch (_error) {
          // Fall back to Node.js implementation
          entryStat = await nodeStatInternal(entryPath);
        }
      } else {
        entryStat = await nodeStatInternal(entryPath);
      }
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
