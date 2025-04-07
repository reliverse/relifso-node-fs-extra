// Export promisified graceful-fs:
export * from "~/libs/core/core-impl/fs/index.js";

// Export extra methods:
export * from "./copy.js";
export * from "./empty.js";
export * from "./ensure/index.js";
export * from "~/libs/core/core-impl/json.js";
export * from "./mkdirs.js";
export * from "./move.js";
export * from "./output-file.js";
export * from "./remove.js";
export { exists } from "~/libs/core/core-impl/fs/exists.js";

// Export aliases used by fs-extra tests:
export { existsSync as pathExistsSync } from "~/libs/core/core-impl/fs/index.js";
export { exists as pathExists } from "~/libs/core/core-impl/fs/exists.js";
export {
  readJson as readJSON,
  readJsonSync as readJSONSync,
  writeJson as writeJSON,
  writeJsonSync as writeJSONSync,
  outputJson as outputJSON,
  outputJsonSync as outputJSONSync,
} from "~/libs/core/core-impl/json.js";

export {
  mkdirs as mkdirp,
  mkdirsSync as mkdirpSync,
  mkdirs as ensureDir,
  mkdirsSync as ensureDirSync,
} from "./mkdirs.js";

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
