import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "os";

import * as fse from "../../index.js";

describe("jsonfile-integration", () => {
  let TEST_DIR;
  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), "fs-extra", "json");
    fse.emptyDir(TEST_DIR, done);
  });
  afterEach((done) => fse.remove(TEST_DIR, done));
  describe("+ writeJsonSync / spaces", () => {
    it("should read a file and parse the json", () => {
      const obj1 = {
        firstName: "JP",
        lastName: "Richardson",
      };
      const file = path.join(TEST_DIR, "file.json");
      fse.writeJsonSync(file, obj1);
      const data = fs.readFileSync(file, "utf8");
      assert.strictEqual(data, JSON.stringify(obj1) + "\n");
    });
  });
  describe("+ writeJsonSync / EOL", () => {
    it("should read a file and parse the json", () => {
      const obj1 = {
        firstName: "JP",
        lastName: "Richardson",
      };
      const file = path.join(TEST_DIR, "file.json");
      fse.writeJsonSync(file, obj1, { spaces: 2, EOL: "\r\n" });
      const data = fs.readFileSync(file, "utf8");
      assert.strictEqual(data, JSON.stringify(obj1, null, 2).replace(/\n/g, "\r\n") + "\r\n");
    });
  });
});
