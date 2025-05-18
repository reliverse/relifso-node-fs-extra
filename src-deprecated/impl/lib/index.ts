// Export promisified graceful-fs:
export * from "@/impl/fs/index.js";

// Export extra methods:
export * from "@/impl/lib/copy/index.js";
export * from "@/impl/lib/empty/index.js";
export * from "@/impl/lib/ensure/index.js";
export * from "@/impl/json.js";
export * from "@/impl/lib/mkdirs/index.js";
export * from "@/impl/lib/move/index.js";
export * from "@/impl/lib/output-file/index.js";
export * from "@/impl/lib/remove/index.js";
export { exists } from "@/impl/fs/exists.js";

// Export aliases used by fs-extra tests:
export { existsSync as pathExistsSync } from "@/impl/fs/index.js";
export { exists as pathExists } from "@/impl/fs/exists.js";
export {
  readJson as readJSON,
  readJsonSync as readJSONSync,
  writeJson as writeJSON,
  writeJsonSync as writeJSONSync,
  outputJson as outputJSON,
  outputJsonSync as outputJSONSync,
} from "@/impl/json.js";

export {
  mkdirs as mkdirp,
  mkdirsSync as mkdirpSync,
  mkdirs as ensureDir,
  mkdirsSync as ensureDirSync,
} from "@/impl/lib/mkdirs/index.js";

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
