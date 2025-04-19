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
} from "~/main.js";

async function main(): Promise<void> {
  /* ---------------------------------------------------------------------- */
  /*                               Setup dir                                */
  /* ---------------------------------------------------------------------- */

  const root = "./tests-runtime";
  await ensureDir(root);
  logStep("Created directory", root);

  /* ---------------------------------------------------------------------- */
  /*                         JSON – async versions                          */
  /* ---------------------------------------------------------------------- */

  const jsonPath = join(root, "config.json");
  const jsonBackup = join(root, "config.old.json");
  const jsonCopy = join(root, "config.copy.json");

  const data = { hello: "world", ts: new Date().toISOString() };
  await outputJson(jsonPath, data);
  logStep("Wrote JSON", jsonPath);

  const readData = await readJson<typeof data>(jsonPath);
  logStep("Read JSON", JSON.stringify(readData));

  await move(jsonPath, jsonBackup, { overwrite: true });
  await copy(jsonBackup, jsonCopy, { clobber: true });
  logStep("Moved → Copied (with overwrite)", `${jsonBackup} → ${jsonCopy}`);

  /* ---------------------------------------------------------------------- */
  /*                            Plain text files                            */
  /* ---------------------------------------------------------------------- */

  const textPath = join(root, "hello.txt");
  await writeFile(textPath, "Hello Relifso!");
  const txt = await readFile(textPath, "utf8");
  logStep("Wrote & read text file", txt);

  /* ---------------------------------------------------------------------- */
  /*                   fs-extra compatibility utility calls                 */
  /* ---------------------------------------------------------------------- */

  const nestedFile = join(root, "nested/deep/file.txt");
  await ensureFile(nestedFile);
  await writeFile(nestedFile, "Deep content");
  await outputFile(join(root, "output-file.txt"), "OutputFile content");
  logStep("Ensured nested & output files");

  const config2 = join(root, "config2.json");
  await writeJson(config2, { foo: "bar" });
  const config2Data = await readJson<{ foo: string }>(config2);
  logStep("writeJson / readJson round-trip", JSON.stringify(config2Data));

  const emptyDirPath = join(root, "empty-me");
  await ensureDir(emptyDirPath);
  await writeFile(join(emptyDirPath, "temp.txt"), "temp");
  await emptyDir(emptyDirPath);
  logStep("Emptied directory", emptyDirPath);

  /* ---------------------------------------------------------------------- */
  /*                         Sync API sanity checks                         */
  /* ---------------------------------------------------------------------- */

  const syncJson = join(root, "config-sync.json");
  outputJsonSync(syncJson, { sync: true });
  const syncData = readJsonSync<{ sync: boolean }>(syncJson);
  logStep("Sync JSON round-trip", JSON.stringify(syncData));

  const syncCopy = join(root, "sync-copy.json");
  copySync(config2, syncCopy, { preserveTimestamps: true });
  const syncMoved = join(root, "sync-moved.json");
  moveSync(syncCopy, syncMoved, { overwrite: true });
  removeSync(syncMoved);
  logStep("copySync → moveSync → removeSync chain complete");

  /* ---------------------------------------------------------------------- */
  /*                              Directory walk                            */
  /* ---------------------------------------------------------------------- */

  logStep("Directory structure via dive");
  await dive(root, (file) => console.log(" •", file));

  logStep("Directory structure via diveSync");
  for (const file of diveSync(root)) {
    console.log(" •", file);
  }

  /* ---------------------------------------------------------------------- */
  /*                                 Cleanup                                */
  /* ---------------------------------------------------------------------- */

  await remove(root);
  logStep("Removed directory", root);
}

/* ------------------------------------------------------------------------ */
/*                             Helper utilities                             */
/* ------------------------------------------------------------------------ */

const logStep = (msg: string, detail?: string): void =>
  console.log("\x1b[36m%s\x1b[0m", msg, detail ?? "");

main().catch((err) => {
  console.error("💥 Uncaught:", err);
  process.exitCode = 1;
});
