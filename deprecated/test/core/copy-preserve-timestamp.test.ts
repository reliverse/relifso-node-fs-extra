import assert from "node:assert";
import os from "node:os";
import path from "node:path";

import * as fs from "../../index.js";
import { utimesMillisSync as utimesSync } from "../../util/utimes.js";

if (process.arch === "ia32") console.warn("32 bit arch; skipping copy timestamp tests");
const describeIfPractical = process.arch === "ia32" ? describe.skip : describe;
describeIfPractical("copy() - preserve timestamp", () => {
  let TEST_DIR;
  let SRC;
  let DEST;
  let FILES;
  function setupFixture(readonly) {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "copy-preserve-timestamp");
    SRC = path.join(TEST_DIR, "src");
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
  afterEach((done) => fs.remove(TEST_DIR, done));
  describe("> when preserveTimestamps option is true", () => {
    [
      { subcase: "writable", readonly: false },
      { subcase: "readonly", readonly: true },
    ].forEach((params) => {
      describe(`>> with ${params.subcase} source files`, () => {
        beforeEach(() => setupFixture(params.readonly));
        it("should have the same timestamps on copy", (done) => {
          fs.copy(SRC, DEST, { preserveTimestamps: true }, (err) => {
            if (err) return done(err);
            FILES.forEach(testFile({ preserveTimestamps: true }));
            done();
          });
        });
      });
    });
  });
  function testFile(options) {
    return (file) => {
      const a = path.join(SRC, file);
      const b = path.join(DEST, file);
      const fromStat = fs.statSync(a);
      const toStat = fs.statSync(b);
      if (options.preserveTimestamps) {
        // Windows sub-second precision fixed: https://github.com/nodejs/io.js/issues/2069
        assert.strictEqual(toStat.mtime.getTime(), fromStat.mtime.getTime(), "different mtime values");
        assert.strictEqual(toStat.atime.getTime(), fromStat.atime.getTime(), "different atime values");
      } else {
        // the access time might actually be the same, so check only modification time
        assert.notStrictEqual(toStat.mtime.getTime(), fromStat.mtime.getTime(), "same mtime values");
      }
    };
  }
});
