// Export promisified graceful-fs:
export * from "deprecated/impl/fs/index.js";

// Export extra methods:
export * from "deprecated/impl/lib/copy/index.js";
export * from "deprecated/impl/lib/empty/index.js";
export * from "deprecated/impl/lib/ensure/index.js";
export * from "deprecated/impl/json.js";
export * from "deprecated/impl/lib/mkdirs/index.js";
export * from "deprecated/impl/lib/move/index.js";
export * from "deprecated/impl/lib/output-file/index.js";
export * from "deprecated/impl/lib/remove/index.js";
export { exists } from "deprecated/impl/fs/exists.js";

// Export aliases used by fs-extra tests:
export { existsSync as pathExistsSync } from "deprecated/impl/fs/index.js";
export { exists as pathExists } from "deprecated/impl/fs/exists.js";
export {
  readJson as readJSON,
  readJsonSync as readJSONSync,
  writeJson as writeJSON,
  writeJsonSync as writeJSONSync,
  outputJson as outputJSON,
  outputJsonSync as outputJSONSync,
} from "deprecated/impl/json.js";

export {
  mkdirs as mkdirp,
  mkdirsSync as mkdirpSync,
  mkdirs as ensureDir,
  mkdirsSync as ensureDirSync,
} from "deprecated/impl/lib/mkdirs/index.js";

export {
  // file
  ensureFile as createFile,
  ensureFileSync as createFileSync,
  // link
  ensureLink as createLink,
  ensureLinkSync as createLinkSync,
  // symlink
  ensureSymlink as createSymlink,
  ensureSymlinkSync as createSymlinkSync,
} from "./ensure/index.js";
