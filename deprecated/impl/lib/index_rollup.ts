// Export promisified graceful-fs:
export * from "deprecated/impl/fs/index.js";

// Export extra methods:
export * from "./copy/index.js";
export * from "./empty/index.js";
export * from "./ensure/index.js";
export * from "deprecated/impl/json.js";
export * from "./mkdirs/index.js";
export * from "./move/index.js";
export * from "./output-file/index.js";
export * from "./remove/index.js";
export { exists } from "deprecated/impl/fs/exists.js";
