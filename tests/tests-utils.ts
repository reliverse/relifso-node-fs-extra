import fs from "graceful-fs";
import _assert from "node:assert";
import path from "node:path";

// @ts-expect-error TODO: fix ts
export const assert: {
  [Properties in keyof typeof _assert]: (typeof _assert)[Properties];
} & ((done: (err?: any) => void) => typeof _assert) = (
  done: (err?: any) => void,
  ...args: any[]
) => {
  if (typeof done !== "function") {
    return _assert(done, ...args);
  }

  const record: Record<string | symbol, unknown> = {};
  return new Proxy(_assert, {
    get(target, p, receiver) {
      if (p in record) {
        return record[p];
      }

      if (p in target) {
        const v = target[p as keyof typeof target];
        if (typeof v === "function") {
          // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
          return (record[p] = (...args: unknown[]) => {
            try {
              // @ts-expect-error TODO: fix ts
              v.apply(receiver, args);
              // done();
            } catch (err) {
              done(err);
              throw err;
            }
          });
        }
      }
    },
  });
};

Object.assign(assert, _assert);

const { CROSS_DEVICE_PATH } = process.env;
let runCrossDeviceTests = !!CROSS_DEVICE_PATH;

if (runCrossDeviceTests) {
  // make sure we have permission on device
  try {
    fs.writeFileSync(path.join(CROSS_DEVICE_PATH, "file"), "hi");
  } catch {
    runCrossDeviceTests = false;
    throw new Error(`Can't write to device ${CROSS_DEVICE_PATH}`);
  }
} else console.log("Skipping cross-device move tests");
export const ifCrossDeviceEnabled = (fn) =>
  runCrossDeviceTests ? fn : fn.skip;
export { CROSS_DEVICE_PATH as differentDevice };

export default {
  assert,
  differentDevice: CROSS_DEVICE_PATH,
  ifCrossDeviceEnabled,
};
