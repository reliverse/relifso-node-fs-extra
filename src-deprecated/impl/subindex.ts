// export types
export type * from "../types.js";
export type {
  CopyOptions,
  CopyOptionsSync,
  EnsureDirOptions,
  SymlinkType,
  MoveOptions,
  JsonOutputOptions,
} from "fs-extra";
export * from "./fs/index.js";
export {
  // Async
  access,
  appendFile,
  chmod,
  chown,
  close,
  copyFile,
  cp,
  createReadStream,
  createWriteStream,
  fchmod,
  fchown,
  fdatasync,
  fstat,
  ftruncate,
  futimes,
  lchmod,
  lchown,
  link,
  lstat,
  lutimes,
  mkdir,
  mkdtemp,
  open,
  openAsBlob,
  opendir,
  read,
  readFile,
  readv,
  readdir,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  statfs,
  symlink,
  truncate,
  unlink,
  unwatchFile,
  utimes,
  watch,
  watchFile,
  write,
  writev,
  // Sync
  accessSync,
  appendFileSync,
  chmodSync,
  chownSync,
  closeSync,
  copyFileSync,
  cpSync,
  existsSync,
  fchmodSync,
  fchownSync,
  fdatasyncSync,
  fstatSync,
  fsync,
  fsyncSync,
  ftruncateSync,
  futimesSync,
  lchmodSync,
  lchownSync,
  linkSync,
  lstatSync,
  lutimesSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  opendirSync,
  readSync,
  readFileSync,
  readlinkSync,
  readvSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  rmdirSync,
  statSync,
  statfsSync,
  symlinkSync,
  truncateSync,
  unlinkSync,
  utimesSync,
  writeFileSync,
  writeSync,
  writevSync,
} from "./fs/index.js";

// export other stuff
export { default as vacuum } from "./external/vacuum.js";
export { copy, copySync } from "./lib/copy/index.js";
export { emptyDir, emptyDirSync } from "./lib/empty/index.js";
export {
  ensureFile,
  ensureFileSync,
  ensureLink,
  ensureLinkSync,
  ensureSymlink,
  ensureSymlinkSync,
} from "./lib/ensure/index.js";
export {
  mkdirs,
  mkdirsSync,
  mkdirs as ensureDir,
  mkdirsSync as ensureDirSync,
} from "./lib/mkdirs/index.js";
export { move, moveSync } from "./lib/move/index.js";
export { outputFile, outputFileSync } from "./lib/output-file/index.js";
export { remove, removeSync } from "./lib/remove/index.js";
export { exists, exists as pathExists } from "./fs/exists.js";
export { dive, diveSync } from "./fs/dive.js";
export { forEachChild, forEachChildSync } from "./fs/for-each-child.js";
export { isDirectory, isDirectorySync } from "./fs/is-directory.js";
export { mapChildren } from "./fs/map-children.js";
export { mapStructure, mapStructureOrdered } from "./fs/map-structure.js";
export { readLines, readLinesSync } from "./fs/read-lines.js";
export { readText, readTextSync } from "./fs/read-text.js";
export { writeFile } from "./fs/write-file.js";

import * as fs from "./fs/index.js";

export {
  readJson,
  readJson as readJSON, // Alias
  readJsonSync,
  readJsonSync as readJSONSync, // Alias
  writeJson,
  writeJson as writeJSON, // Alias
  writeJsonSync,
  writeJsonSync as writeJSONSync, // Alias
  outputJson,
  outputJson as outputJSON, // Alias
  outputJsonSync,
  outputJsonSync as outputJSONSync, // Alias
} from "./json.js";

/**
 * Resolve a child file of a folder.
 * @param path The parent folder path
 * @param child The child filesystem entry path (can be a file or folder)
 * @returns `path` and `child` concatenated, delimited by whatever path separator is already used in the string,
 * defaulting to `/`; a delimiter is never added if it's not necessary.
 */
export function resolve(path: string, child: string): string {
  if (path.endsWith("/") || path.endsWith("\\")) {
    return path + child;
  }
  if (path.includes("/")) {
    return `${path}/${child}`;
  }
  if (path.includes("\\")) {
    return `${path}\\${child}`;
  }
  return `${path}/${child}`;
}

/**
 * Check if the file at a path is a symbolic link.
 * @param path the path to the file to check
 * @param callback callback function to call with whether or not the file is a symbolic link, or a value for `err` if the
 * operation fails
 */
export function isSymlink(file: string): Promise<boolean>;
export function isSymlink(
  file: string,
  callback?: (err: NodeJS.ErrnoException | null, isSymblink?: boolean) => void,
): void;
export function isSymlink(
  file: string,
  callback?: (err: NodeJS.ErrnoException | null, isSymblink?: boolean) => void,
): Promise<boolean> | void {
  return callback
    ? fs.lstat(file, (err, stats) => (err ? callback(err) : callback(null, stats.isSymbolicLink())))
    : fs.lstat(file).then((stats) => stats.isSymbolicLink());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function combine<T extends unknown[]>(
  fn1?: (...args: T) => boolean,
  fn2?: (...args: T) => boolean,
): (...args: T) => boolean {
  if (fn1) {
    if (fn2) return (...args) => fn1(...args) && fn2(...args);
    return fn1;
  } else {
    if (fn2) return fn2;
    return () => true;
  }
}
