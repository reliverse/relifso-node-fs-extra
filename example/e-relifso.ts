// This script demonstrates the various features of the 'relifso' library.
// It showcases happy-path scenarios for file and directory manipulations,
// including async and sync operations, JSON handling, and directory traversal.

// 👉 `bun dev`

import { join } from "node:path";

import {
  // async
  ensureDir,
  ensureFile,
  outputFile,
  outputJson,
  writeJson,
  readJson,
  emptyDir,
  remove,
  copy,
  move,
  writeFile,
  readFile,
  dive,
  // sync
  outputJsonSync,
  readJsonSync,
  copySync,
  moveSync,
  removeSync,
  diveSync,
  pathExists,
  pathExistsSync,
} from "~/mod.js";

export async function eRelifso(): Promise<void> {
  /* ---------------------------------------------------------------------- */
  /*                               Setup dir                                */
  /* ---------------------------------------------------------------------- */

  const testsRuntime = "./tests-runtime";

  try {
    if (await pathExists(testsRuntime)) {
      await remove(testsRuntime);
    }
  } catch (err) {
    console.error(`Failed to clean up existing test directory: ${err}`);
  }

  await ensureDir(testsRuntime);
  logStep("Created directory", testsRuntime);

  /* ---------------------------------------------------------------------- */
  /*                         JSON – async versions                          */
  /* ---------------------------------------------------------------------- */

  const jsonPath = join(testsRuntime, "config.json");
  const jsonBackup = join(testsRuntime, "config.old.json");
  const jsonCopy = join(testsRuntime, "config.copy.json");

  const data = { hello: "world", ts: new Date().toISOString() };
  await outputJson(jsonPath, data);
  logStep("Wrote JSON", jsonPath);

  const readData = await readJson<typeof data>(jsonPath);
  logStep("Read JSON", JSON.stringify(readData));

  await move(jsonPath, jsonBackup, { overwrite: true, maxRetries: 3, retryDelay: 100 });
  await copy(jsonBackup, jsonCopy, { clobber: true });
  logStep("Moved → Copied (with overwrite)", `${jsonBackup} → ${jsonCopy}`);

  /* ---------------------------------------------------------------------- */
  /*                            Plain text files                            */
  /* ---------------------------------------------------------------------- */

  const textPath = join(testsRuntime, "hello.txt");
  await writeFile(textPath, "Hello Relifso!");
  const txt = await readFile(textPath, "utf8");
  logStep("Wrote & read text file", txt.toString());

  /* ---------------------------------------------------------------------- */
  /*                            Utility calls                             */
  /* ---------------------------------------------------------------------- */

  const nestedFile = join(testsRuntime, "nested/deep/file.txt");
  await ensureFile(nestedFile);
  await writeFile(nestedFile, "Deep content");
  await outputFile(join(testsRuntime, "output-file.txt"), "OutputFile content");
  logStep("Ensured nested & output files");

  const config2 = join(testsRuntime, "config2.json");
  await writeJson(config2, { foo: "bar" });
  const config2Data = await readJson<{ foo: string }>(config2);
  logStep("writeJson / readJson round-trip", JSON.stringify(config2Data));

  /* ---------------------------------------------------------------------- */
  /*                            JSONC demonstration                          */
  /* ---------------------------------------------------------------------- */

  const jsoncPath = join(testsRuntime, "config.jsonc");
  const jsoncData = {
    // This is a comment in JSONC
    name: "relifso",
    version: "1.0.0",
    features: [
      "file operations",
      "directory operations",
      // Comments work in arrays too
      "JSONC support",
    ],
    // Trailing commas are allowed in JSONC
    settings: {
      debug: true,
      verbose: false,
    },
  };

  await outputJson(jsoncPath, jsoncData, { includeComments: true });
  logStep("Wrote JSONC", jsoncPath);

  const readJsoncData = await readJson<typeof jsoncData>(jsoncPath, { preserveComments: true });
  logStep("Read JSONC", JSON.stringify(readJsoncData, null, 2));

  const emptyDirPath = join(testsRuntime, "empty-me");
  await ensureDir(emptyDirPath);
  await writeFile(join(emptyDirPath, "temp.txt"), "temp");
  await emptyDir(emptyDirPath);
  logStep("Emptied directory", emptyDirPath);

  /* ---------------------------------------------------------------------- */
  /*                         Sync API sanity checks                         */
  /* ---------------------------------------------------------------------- */

  const syncJson = join(testsRuntime, "config-sync.json");
  try {
    const syncData = readJsonSync<{ sync: boolean }>(syncJson);
    logStep("Sync JSON round-trip", JSON.stringify(syncData));
  } catch (err) {
    console.error(`Failed to handle sync JSON operations: ${err}`);
  }

  try {
    if (!pathExistsSync(config2)) {
      outputJsonSync(config2, { foo: "bar" });
    }

    const syncCopy = join(testsRuntime, "sync-copy.json");
    copySync(config2, syncCopy, { preserveTimestamps: true });

    const syncMoved = join(testsRuntime, "sync-moved.json");
    moveSync(syncCopy, syncMoved, { overwrite: true, maxRetries: 3, retryDelay: 100 });
    removeSync(syncMoved);
    logStep("copySync → moveSync → removeSync chain complete");
  } catch (err) {
    console.error(`Failed to complete sync operations chain: ${err}`);
  }

  /* ---------------------------------------------------------------------- */
  /*                              Directory walk                            */
  /* ---------------------------------------------------------------------- */

  logStep("Directory structure via dive");
  await dive(testsRuntime, (file) => console.log(" •", file));

  logStep("Directory structure via diveSync");
  for (const file of diveSync(testsRuntime)) {
    console.log(" •", file);
  }

  /* ---------------------------------------------------------------------- */
  /*                                 Cleanup                                */
  /* ---------------------------------------------------------------------- */

  try {
    await remove(testsRuntime);
    logStep("Removed directory", testsRuntime);
  } catch (err) {
    console.error(`\x1b[31m[Cleanup Step] Failed to remove directory ${testsRuntime}:\x1b[0m`, err);
    throw err;
  }
}

/* ------------------------------------------------------------------------ */
/*                             Helper utilities                             */
/* ------------------------------------------------------------------------ */

const logStep = (msg: string, detail?: string): void => console.log("\x1b[36m%s\x1b[0m", msg, detail ?? "");
