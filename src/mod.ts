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
import { resolve } from "node:path";

import { getFileBun, getFileTypeBun, isBun } from "./impl/bun";
import { copy, copySync } from "./impl/copy";
import {
  createFile,
  createFileSync,
  createDir,
  createDirs,
  createFiles,
  createDirSync,
  createDirsSync,
  createFilesSync,
} from "./impl/create";
import { dive, diveSync } from "./impl/dive";
import { emptyDir, emptyDirSync, emptyObject, emptyFile, emptyFileSync } from "./impl/empty";
import {
  readText,
  readTextSync,
  readLines,
  readLinesSync,
  isDirectory,
  isDirectorySync,
  isSymlink,
  isSymlinkSync,
  execAsync,
  isDirectoryEmpty,
  isHiddenAttribute,
  rmEnsureDir,
  setHiddenAttribute,
} from "./impl/extras";
import { validateAndRepairJson } from "./impl/json-utils";
import { mkdirs, mkdirsSync } from "./impl/mkdirs";
import { move, moveSync } from "./impl/move";
import { outputFile, outputFileSync } from "./impl/output-file";
import { outputJson, outputJsonSync } from "./impl/output-json";
import { pathExists, pathExistsSync } from "./impl/path-exists";
import { readFile, readFileSync } from "./impl/read-file";
import { readJson, readJsonSync, type ReadJsonOptions as _ReadJsonOptions } from "./impl/read-json";
import { remove, removeSync } from "./impl/remove";
import { getFileExists, getFileLastModified, getFileSize, getStats, getStatsSync, toNodeStats } from "./impl/stats";
import { writeJson, writeJsonSync } from "./impl/write-json";
import { JSONRepairError } from "./utils/json/helpers/JSONRepairError";
import { JsonSchemaError } from "./utils/json/helpers/JsonSchemaError";
import { extractComments } from "./utils/json/regular/jsonc";
import { jsonrepair } from "./utils/json/regular/jsonrepair";
import { validateJson } from "./utils/json/regular/validate";
import { createInputBuffer } from "./utils/json/stream/buffer/InputBuffer";
import { createOutputBuffer } from "./utils/json/stream/buffer/OutputBuffer";
import { jsonrepairCore } from "./utils/json/stream/core";
import { createJsonlParser } from "./utils/json/stream/jsonl";
import { createJsonlWriter } from "./utils/json/stream/jsonl";
import { JsonStreamError } from "./utils/json/stream/JsonStreamError";
import { createJsonStreamParser } from "./utils/json/stream/parser";
import { jsonrepairTransform } from "./utils/json/stream/stream";
import { createJsonStreamWriter } from "./utils/json/stream/writer";

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
const jsonRepairRegular = jsonrepair;

export type { CopyOptions } from "./impl/copy";
export type { MoveOptions } from "./impl/move";
export type { ReadFileOptions } from "./impl/read-file";
export type { ReadJsonOptions } from "./impl/read-json";
export type { JsonStringifyOptions } from "./impl/write-json";
export type { WriteJsonOptions } from "./impl/write-json";
export type { WriteFileOptions } from "./impl/write-file";
export type { DiveOptions } from "./impl/dive";
export type { JsonRepairTransformOptions } from "./utils/json/stream/stream";
export type { OutputJsonOptions } from "./impl/output-json";
export type { JSONSchema } from "./utils/json/regular/validate";
export type { InputBuffer } from "./utils/json/stream/buffer/InputBuffer";
export type { OutputBuffer, OutputBufferOptions } from "./utils/json/stream/buffer/OutputBuffer";
export type { JsonRepairCoreOptions, JsonRepairCore } from "./utils/json/stream/core";
export type { Text } from "./utils/json/helpers/stringUtils";
export type { JsoncParseOptions, JsoncStringifyOptions } from "./utils/json/regular/jsonc";

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
  createDirSync,
  createDirsSync,
  createFilesSync,
  emptyFileSync,
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
  createDir,
  createDirs,
  createFiles,
  emptyFile,
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
  // Additional utility functions
  execAsync,
  setHiddenAttribute,
  isHiddenAttribute,
  isDirectoryEmpty,
  rmEnsureDir,
  dive,
  getFileExists,
  getFileLastModified,
  getFileSize,
  getStats,
  getStatsSync,
  emptyObject,
  // Bun-specific utilities
  getFileBun,
  getFileTypeBun,
  toNodeStats,
  isBun,
  // JSON utilities
  jsonrepair,
  jsonRepairRegular,
  createInputBuffer,
  createOutputBuffer,
  jsonrepairCore,
  JSONRepairError,
  jsonrepairTransform,
  validateAndRepairJson,
  validateJson,
  JsonSchemaError,
  createJsonStreamParser,
  createJsonStreamWriter,
  JsonStreamError,
  createJsonlParser,
  createJsonlWriter,
  extractComments,
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
  createDirSync,
  createDirsSync,
  createFilesSync,
  emptyFileSync,
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
  createDir,
  createDirs,
  createFiles,
  emptyFile,
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
  // Additional utility functions
  execAsync,
  setHiddenAttribute,
  isHiddenAttribute,
  isDirectoryEmpty,
  rmEnsureDir,
  dive,
  getFileExists,
  getFileLastModified,
  getFileSize,
  getStats,
  getStatsSync,
  emptyObject,
  // Bun-specific utilities
  getFileBun,
  getFileTypeBun,
  toNodeStats,
  isBun,
  // JSON utilities
  jsonrepair,
  jsonRepairRegular,
  createInputBuffer,
  createOutputBuffer,
  jsonrepairCore,
  JSONRepairError,
  jsonrepairTransform,
  validateAndRepairJson,
  validateJson,
  JsonSchemaError,
  createJsonStreamParser,
  createJsonStreamWriter,
  JsonStreamError,
  createJsonlParser,
  createJsonlWriter,
  extractComments,
};

export default fs;
