import { mkdir, mkdirSync } from "deprecated/impl/fs/index.js";

import { checkPath } from "./utils.js";

const getMode = (options) => {
  const defaults = { mode: 0o777 };
  if (typeof options === "number") return options;
  return { ...defaults, ...options }.mode;
};

export async function makeDir(dir, options) {
  checkPath(dir);

  return mkdir(dir, {
    mode: getMode(options),
    recursive: true,
  });
}

export function makeDirSync(dir, options) {
  checkPath(dir);

  return mkdirSync(dir, {
    mode: getMode(options),
    recursive: true,
  });
}
