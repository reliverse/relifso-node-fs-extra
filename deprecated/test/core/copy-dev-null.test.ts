import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

let TEST_DIR = "";
describe("+ copy() - copy /dev/null", () => {
  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), "test", "fs-extra", "copy-dev-null");
    fse.emptyDir(TEST_DIR, done);
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  describe("> when src is /dev/null", () => {
    it("should copy successfully", (done) => {
      // no /dev/null on windows
      if (process.platform === "win32") return done();
      const tmpFile = path.join(TEST_DIR, "foo");
      fse.copy("/dev/null", tmpFile, (err) => {
        assert.ifError(err);
        const stats = fs.lstatSync(tmpFile);
        assert.strictEqual(stats.size, 0);
        done();
      });
    });
  });
});
