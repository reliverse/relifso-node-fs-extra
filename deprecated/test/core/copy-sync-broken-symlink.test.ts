import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("copy-sync / broken symlink", () => {
  const TEST_DIR = path.join(os.tmpdir(), "fs-extra", "copy-sync-broken-symlink");
  const src = path.join(TEST_DIR, "src");
  const dest = path.join(TEST_DIR, "dest");
  beforeEach((done) => {
    fse.emptyDir(TEST_DIR, (err) => {
      assert.ifError(err);
      createFixtures(src, done);
    });
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  describe("when symlink is broken", () => {
    it("should not throw error if dereference is false", () => {
      let err = null;
      try {
        fse.copySync(src, dest);
      } catch (e) {
        err = e;
      }
      assert.strictEqual(err, null);
    });
    it("should throw error if dereference is true", () => {
      assert.throws(
        () => fse.copySync(src, dest, { dereference: true }),
        (err) => err.code === "ENOENT",
      );
    });
  });
});
function createFixtures(srcDir, callback) {
  fs.mkdir(srcDir, (err) => {
    let brokenFile;
    let brokenFileLink;
    if (err) return callback(err);
    try {
      brokenFile = path.join(srcDir, "does-not-exist");
      brokenFileLink = path.join(srcDir, "broken-symlink");
      fs.writeFileSync(brokenFile, "does not matter");
      fs.symlinkSync(brokenFile, brokenFileLink, "file");
    } catch (err) {
      callback(err);
    }
    // break the symlink now
    fse.remove(brokenFile, callback);
  });
}
