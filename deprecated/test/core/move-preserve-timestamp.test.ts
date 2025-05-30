import assert from "node:assert";
import path from "node:path";
import os from "os";

import * as fs from "../../index.js";
import * as fse from "../../index.js";
import * as utimes from "../../util/utimes.js";
import { differentDevice, ifCrossDeviceEnabled } from "./cross-device-utils.js";

const utimesSync = { default: utimes }.default.utimesMillisSync;

if (process.arch === "ia32") console.warn("32 bit arch; skipping move timestamp tests");
const describeIfPractical = process.arch === "ia32" ? describe.skip : describe;
describeIfPractical("move() - across different devices", () => {
  let TEST_DIR;
  let SRC;
  let DEST;
  let FILES;
  function setupFixture(readonly) {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "move-sync-preserve-timestamp");
    SRC = path.join(differentDevice, "some/weird/dir-really-weird");
    DEST = path.join(TEST_DIR, "dest");
    FILES = ["a-file", path.join("a-folder", "another-file"), path.join("a-folder", "another-folder", "file3")];
    const timestamp = Date.now() / 1000 - 5;
    FILES.forEach((f) => {
      const filePath = path.join(SRC, f);
      fs.ensureFileSync(filePath);
      // rewind timestamps to make sure that coarser OS timestamp resolution
      // does not alter results
      utimesSync(filePath, timestamp, timestamp);
      if (readonly) {
        fs.chmodSync(filePath, 0o444);
      }
    });
  }
  afterEach(() => {
    fse.removeSync(TEST_DIR);
    fse.removeSync(SRC);
  });
  ifCrossDeviceEnabled(describe)("> default behaviour", () => {
    [
      { subcase: "writable", readonly: false },
      { subcase: "readonly", readonly: true },
    ].forEach((params) => {
      describe(`>> with ${params.subcase} source files`, () => {
        beforeEach(() => setupFixture(params.readonly));
        it("should have the same timestamps after move", (done) => {
          const originalTimestamps = FILES.map((file) => {
            const originalPath = path.join(SRC, file);
            const originalStat = fs.statSync(originalPath);
            return {
              mtime: originalStat.mtime.getTime(),
              atime: originalStat.atime.getTime(),
            };
          });
          fse.move(SRC, DEST, {}, (err) => {
            if (err) return done(err);
            FILES.forEach(testFile({}, originalTimestamps));
            done();
          });
        });
      });
    });
  });
  function testFile(options, originalTimestamps) {
    return (file, idx) => {
      const originalTimestamp = originalTimestamps[idx];
      const currentPath = path.join(DEST, file);
      const currentStats = fs.statSync(currentPath);
      assert.strictEqual(currentStats.mtime.getTime(), originalTimestamp.mtime, "different mtime values");
      assert.strictEqual(currentStats.atime.getTime(), originalTimestamp.atime, "different atime values");
    };
  }
});
