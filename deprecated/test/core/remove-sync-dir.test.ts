import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("remove/sync", () => {
  let TEST_DIR;
  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "remove-sync");
    fse.emptyDir(TEST_DIR, done);
  });
  describe("+ removeSync()", () => {
    it("should delete directories and files synchronously", () => {
      assert(fs.existsSync(TEST_DIR));
      fs.writeFileSync(path.join(TEST_DIR, "somefile"), "somedata");
      fse.removeSync(TEST_DIR);
      assert(!fs.existsSync(TEST_DIR));
    });
    it("should delete an empty directory synchronously", () => {
      assert(fs.existsSync(TEST_DIR));
      fse.removeSync(TEST_DIR);
      assert(!fs.existsSync(TEST_DIR));
    });
  });
});
