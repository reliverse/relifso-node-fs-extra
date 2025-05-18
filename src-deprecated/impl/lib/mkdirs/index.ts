import { fromPromise as u } from "universalify";

import { makeDir as _makeDir } from "./make-dir.js";
export { makeDirSync as mkdirsSync } from "./make-dir.js";
export const mkdirs = u(_makeDir);
