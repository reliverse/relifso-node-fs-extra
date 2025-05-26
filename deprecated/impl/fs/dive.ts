import type { DiveActionCallback, DiveActionPromise, DiveOptions } from "deprecated/types.js";

// dive.ts
import { resolve as pathResolve } from "node:path";

import * as fs from "./index.js";

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
/* -------------------------------------------------------------------------- */

const DEFAULT_OPTS: Required<Pick<DiveOptions, "recursive" | "all" | "files">> = {
  recursive: true,
  all: true,
  files: true,
};

const matches = (str: string, test?: string | RegExp): boolean =>
  test ? (typeof test === "string" ? str.includes(test) : test.test(str)) : false;

/* -------------------------------------------------------------------------- */
/*                          Asynchronous generator                            */
/* -------------------------------------------------------------------------- */

export async function* _diveWorker(
  directory: string,
  options: DiveOptions = {},
): AsyncGenerator<[file: string, stat: fs.Stats]> {
  const opts = { ...DEFAULT_OPTS, ...options };

  const children = await fs.readdir(directory, { withFileTypes: true });

  // Empty dir: maybe yield itself
  if (children.length === 0 && opts.directories) {
    yield [directory, await fs.stat(directory)];
  }

  for (const dirent of children) {
    if (!opts.all && dirent.name.startsWith(".")) continue;

    const path = pathResolve(dirent.path ?? directory, dirent.name);
    if (opts.ignore && matches(path, opts.ignore)) continue;

    if (dirent.isDirectory()) {
      if (opts.recursive) {
        yield* _diveWorker(path, opts);
      } else if (opts.directories) {
        yield [path, await fs.stat(path)];
      }
    } else if (opts.files) {
      yield [path, await fs.stat(path)];
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                       Promise‑based public helpers                         */
/* -------------------------------------------------------------------------- */

async function _diveHelper(directory: string, action: DiveActionPromise, options: DiveOptions = {}): Promise<void> {
  for await (const [file, stat] of _diveWorker(directory, options)) {
    await action(file, stat);
  }
}

async function _diveWorkerCallback(
  directory: string,
  action: DiveActionCallback,
  options: DiveOptions = {},
): Promise<void> {
  let children: fs.Dirent[];
  try {
    children = await fs.readdir(directory, { withFileTypes: true });
  } catch (err) {
    action(err as Error);
    return;
  }

  if (children.length === 0 && options.directories) {
    action(null, directory, await fs.stat(directory));
  }

  for (const dirent of children) {
    if (!options.all && dirent.name.startsWith(".")) continue;

    const path = pathResolve(dirent.path ?? directory, dirent.name);
    if (options.ignore && matches(path, options.ignore)) continue;

    try {
      if (dirent.isDirectory()) {
        if (options.recursive) {
          await _diveWorkerCallback(path, action, options);
        } else if (options.directories) {
          action(null, path, await fs.stat(path));
        }
      } else if (options.files) {
        action(null, path, await fs.stat(path));
      }
    } catch (err) {
      action(err as Error);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                               Public API                                   */
/* -------------------------------------------------------------------------- */

// Overload signatures
export function dive(directory: string, options: DiveOptions, action: DiveActionCallback, complete: () => void): void;
export function dive(directory: string, options: DiveOptions, action: DiveActionPromise): Promise<void>;
export function dive(directory: string, action: DiveActionCallback, complete: () => void): void;
export function dive(directory: string, action: DiveActionPromise): Promise<void>;
export function dive(
  directory: string,
  o1: DiveOptions | DiveActionCallback | DiveActionPromise,
  o2?: DiveActionCallback | DiveActionPromise | (() => void),
  o3?: () => void,
): void | Promise<void> {
  const options = (typeof o1 === "object" ? o1 : undefined) ?? {};
  const action = (options === o1 ? o2 : o1) as DiveActionCallback | DiveActionPromise;
  const complete = (options === o1 ? o3 : o2) as (() => void) | undefined;

  const opts: DiveOptions = { ...DEFAULT_OPTS, ...options };

  if (!complete) {
    return _diveHelper(directory, action as DiveActionPromise, opts);
  }

  void _diveWorkerCallback(directory, action as DiveActionCallback, opts).finally(complete);
}

/* -------------------------------------------------------------------------- */
/*                             Synchronous API                                */
/* -------------------------------------------------------------------------- */

function* _diveSyncWorker(directory: string, options: DiveOptions = {}): Generator<string> {
  const opts = { ...DEFAULT_OPTS, ...options };
  const children = fs.readdirSync(directory, { withFileTypes: true });

  if (children.length === 0 && opts.directories) yield directory;

  for (const dirent of children) {
    if (!opts.all && dirent.name.startsWith(".")) continue;

    const path = pathResolve(dirent.path ?? directory, dirent.name);
    if (opts.ignore && matches(path, opts.ignore)) continue;

    if (dirent.isDirectory()) {
      if (opts.recursive) yield* _diveSyncWorker(path, opts);
      else if (opts.directories) yield path;
    } else if (opts.files) {
      yield path;
    }
  }
}

export function diveSync(directory: string, options: DiveOptions = {}): string[] {
  return [..._diveSyncWorker(directory, options)];
}
