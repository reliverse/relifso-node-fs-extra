// 👉 `bun dev`

import { relinka } from "@reliverse/relinka";
import { ePathkit } from "example/e-pathkit.js";
import { eRelifso } from "example/e-relifso.js";

import { isBun } from "~/mod.js";

const exampleToRun = "relifso" as "pathkit" | "relifso" | "all";

async function main() {
  const eEnv = isBun ? "Bun" : "Node.js";
  relinka("success", `Running examples with ${eEnv}...`);

  if (exampleToRun === "pathkit") await ePathkit();
  if (exampleToRun === "relifso") await eRelifso();
  if (exampleToRun === "all") {
    await ePathkit();
    await eRelifso();
  }
}

await main().catch((err) => {
  console.error("💥 Uncaught:", err);
  process.exitCode = 1;
});
