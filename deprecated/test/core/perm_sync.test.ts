import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("mkdirp / perm_sync", () => {
  let TEST_DIR;
  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "mkdirp-perm-sync");
    fse.emptyDir(TEST_DIR, done);
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  it("sync perm", (done) => {
    const file = path.join(TEST_DIR, (Math.random() * (1 << 30)).toString(16) + ".json");
    fse.mkdirpSync(file, 0o755);
    fse.pathExists(file, (err, ex) => {
      assert.ifError(err);
      assert.ok(ex, "file created");
      fs.stat(file, (err, stat) => {
        assert.ifError(err);
        if (os.platform().startsWith("win")) {
          assert.strictEqual(stat.mode & 0o777, 0o666);
        } else {
          assert.strictEqual(stat.mode & 0o777, 0o755);
        }
        assert.ok(stat.isDirectory(), "target not a directory");
        done();
      });
    });
  });
  it("sync root perm", (done) => {
    const file = TEST_DIR;
    fse.mkdirpSync(file, 0o755);
    fse.pathExists(file, (err, ex) => {
      assert.ifError(err);
      assert.ok(ex, "file created");
      fs.stat(file, (err, stat) => {
        assert.ifError(err);
        assert.ok(stat.isDirectory(), "target not a directory");
        done();
      });
    });
  });
});
