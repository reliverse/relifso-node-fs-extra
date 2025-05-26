import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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
