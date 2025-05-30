import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("mkdirp / clobber", () => {
  let TEST_DIR;
  let file;
  before((done) => {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "mkdirp-clobber");
    fse.emptyDir(TEST_DIR, (err) => {
      assert.ifError(err);
      const ps = [TEST_DIR];
      for (let i = 0; i < 15; i++) {
        const dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
        ps.push(dir);
      }
      file = ps.join(path.sep);
      // a file in the way
      const itw = ps.slice(0, 2).join(path.sep);
      fs.writeFileSync(itw, "I AM IN THE WAY, THE TRUTH, AND THE LIGHT.");
      fs.stat(itw, (err, stat) => {
        assert.ifError(err);
        assert.ok(stat && stat.isFile(), "should be file");
        done();
      });
    });
  });
  it("should clobber", (done) => {
    fse.mkdirp(file, 0o755, (err) => {
      assert.ok(err);
      assert.strictEqual(err.code, "ENOTDIR");
      done();
    });
  });
});
