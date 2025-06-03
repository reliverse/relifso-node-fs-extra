import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import path from "node:path";
import fs from "~/mod";

let TEST_DIR = path.join(process.cwd(), "test-hidden-dir");

const activateHardcodedPathCheck = false;

if (activateHardcodedPathCheck) {
  TEST_DIR = path.join(process.cwd(), "tests-runtime", "rseit");
}

describe("filesystem helpers", () => {
  beforeEach(async () => {
    if (!activateHardcodedPathCheck) {
      await fs.ensuredir(TEST_DIR);
    }
  });

  afterEach(async () => {
    if (!activateHardcodedPathCheck) {
      await fs.remove(TEST_DIR);
    }
  });

  if (activateHardcodedPathCheck) {
    test("check and set hidden attribute on hardcoded path", async () => {
      const initialHiddenStatus = await fs.isHiddenAttribute(TEST_DIR);
      if (!initialHiddenStatus) {
        await fs.setHiddenAttribute(TEST_DIR);
      }
      // No assertion needed - this is a utility test
    });
  } else {
    test("setHiddenAttribute sets hidden attribute on Windows", async () => {
      await fs.setHiddenAttribute(TEST_DIR);

      if (process.platform === "win32") {
        const isHiddenAttributeResult = await fs.isHiddenAttribute(TEST_DIR);
        expect(isHiddenAttributeResult).toBe(true);
      } else {
        // On non-Windows platforms, function should run without error
        expect(true).toBe(true);
      }
    });

    test("isHiddenAttribute returns correct hidden status", async () => {
      // First check - should not be hidden
      let hiddenStatus = await fs.isHiddenAttribute(TEST_DIR);
      expect(hiddenStatus).toBe(false);

      // Set hidden and check again (Windows only)
      if (process.platform === "win32") {
        await fs.setHiddenAttribute(TEST_DIR);
        hiddenStatus = await fs.isHiddenAttribute(TEST_DIR);
        expect(hiddenStatus).toBe(true);
      }
    });

    test("handles non-existent paths gracefully", async () => {
      const nonExistentPath = path.join(TEST_DIR, "does-not-exist");
      await fs.setHiddenAttribute(nonExistentPath); // Should not throw
      const result = await fs.isHiddenAttribute(nonExistentPath);
      expect(result).toBe(false);
    });
  }
});
