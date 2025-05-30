import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("mkdirp / race", () => {
  let TEST_DIR;
  let file;
  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "mkdirp-race");
    fse.emptyDir(TEST_DIR, (err) => {
      assert.ifError(err);
      const ps = [TEST_DIR];
      for (let i = 0; i < 15; i++) {
        const dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
        ps.push(dir);
      }
      file = path.join(...ps);
      done();
    });
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  it("race", (done) => {
    let res = 2;
    mk(file, () => (--res === 0 ? done() : undefined));
    mk(file, () => (--res === 0 ? done() : undefined));
    function mk(file, callback) {
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
            if (callback) callback();
          });
        });
      });
    }
  });
});
