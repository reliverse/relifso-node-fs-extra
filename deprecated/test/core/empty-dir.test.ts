import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("+ emptyDir()", () => {
  let TEST_DIR;
  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), "test-fs-extra", "empty-dir");
    if (fs.existsSync(TEST_DIR)) {
      fse.removeSync(TEST_DIR);
    }
    fse.ensureDirSync(TEST_DIR);
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  describe("> when directory exists and contains items", () => {
    it("should delete all of the items", (done) => {
      // verify nothing
      assert.strictEqual(fs.readdirSync(TEST_DIR).length, 0);
      fse.ensureFileSync(path.join(TEST_DIR, "some-file"));
      fse.ensureFileSync(path.join(TEST_DIR, "some-file-2"));
      fse.ensureDirSync(path.join(TEST_DIR, "some-dir"));
      assert.strictEqual(fs.readdirSync(TEST_DIR).length, 3);
      fse.emptyDir(TEST_DIR, (err) => {
        assert.ifError(err);
        assert.strictEqual(fs.readdirSync(TEST_DIR).length, 0);
        done();
      });
    });
  });
  describe("> when directory exists and contains no items", () => {
    it("should do nothing", (done) => {
      assert.strictEqual(fs.readdirSync(TEST_DIR).length, 0);
      fse.emptyDir(TEST_DIR, (err) => {
        assert.ifError(err);
        assert.strictEqual(fs.readdirSync(TEST_DIR).length, 0);
        done();
      });
    });
  });
  describe("> when directory does not exist", () => {
    it("should create it", (done) => {
      fse.removeSync(TEST_DIR);
      assert(!fs.existsSync(TEST_DIR));
      fse.emptyDir(TEST_DIR, (err) => {
        assert.ifError(err);
        assert.strictEqual(fs.readdirSync(TEST_DIR).length, 0);
        done();
      });
    });
  });
});
