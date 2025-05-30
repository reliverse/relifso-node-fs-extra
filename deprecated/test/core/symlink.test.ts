import assert from "@fs/../test-helpers";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../../index.js";
import ncp from "../../copy.js";

describe("ncp / symlink", () => {
  const TEST_DIR = path.join(os.tmpdir(), "fs-extra", "ncp-symlinks");
  const src = path.join(TEST_DIR, "src");
  const out = path.join(TEST_DIR, "out");
  beforeEach((done) => {
    fse.emptyDir(TEST_DIR, (err) => {
      assert.ifError(err);
      createFixtures(src, done);
    });
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  it("copies symlinks by default", (done) => {
    ncp(src, out, (err) => {
      assert(done).ifError(err);
      assert(done).strictEqual(fs.readlinkSync(path.join(out, "file-symlink")), path.join(src, "foo"));
      assert(done).strictEqual(fs.readlinkSync(path.join(out, "dir-symlink")), path.join(src, "dir"));
      done();
    });
  });
  it("copies file contents when dereference=true", (done) => {
    ncp(src, out, { dereference: true }, (err) => {
      assert(done).ifError(err);
      const fileSymlinkPath = path.join(out, "file-symlink");
      assert(done).ok(fs.lstatSync(fileSymlinkPath).isFile());
      assert(done).strictEqual(fs.readFileSync(fileSymlinkPath, "utf8"), "foo contents");
      const dirSymlinkPath = path.join(out, "dir-symlink");
      assert(done).ok(fs.lstatSync(dirSymlinkPath).isDirectory());
      assert(done).deepStrictEqual(fs.readdirSync(dirSymlinkPath), ["bar"]);
      done();
    });
  });
});
function createFixtures(srcDir, callback) {
  fs.mkdir(srcDir, (err) => {
    if (err) return callback(err);
    // note: third parameter in symlinkSync is type e.g. 'file' or 'dir'
    // https://nodejs.org/api/fs.html#fs_fs_symlink_srcpath_dstpath_type_callback
    try {
      const fooFile = path.join(srcDir, "foo");
      const fooFileLink = path.join(srcDir, "file-symlink");
      fs.writeFileSync(fooFile, "foo contents");
      fs.symlinkSync(fooFile, fooFileLink, "file");
      const dir = path.join(srcDir, "dir");
      const dirFile = path.join(dir, "bar");
      const dirLink = path.join(srcDir, "dir-symlink");
      fs.mkdirSync(dir);
      fs.writeFileSync(dirFile, "bar contents");
      fs.symlinkSync(dir, dirLink, "dir");
    } catch (err) {
      callback(err);
    }
    callback();
  });
}
