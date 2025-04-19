import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("mkdirp / mkdirp", () => {
  let TEST_DIR;
  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "mkdirp");
    fse.emptyDir(TEST_DIR, done);
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  it("should make the dir", (done) => {
    const x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    const y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    const z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    const file = path.join(TEST_DIR, x, y, z);
    fse.mkdirp(file, 0o755, (err) => {
      assert.ifError(err);
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
  });
});
