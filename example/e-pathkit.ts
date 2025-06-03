import path, {
  convertImportsAliasToRelative,
  convertImportsExt,
  attachPathSegmentsInDirectory,
  stripPathSegmentsInDirectory,
  type PathExtFilter,
} from "@reliverse/pathkit";

import fs, { isBun, getFileBun, getFileExists, getFileTypeBun, getFileSize, getFileLastModified } from "~/mod.js";

const ALIAS = "#";
const E_SRC = "e-src";
const E_DIST = "e-dist";
const MODE = "none" as PathExtFilter;
const TEST_JS_TO_TS_CONVERSION = false;

// pick ext once per file
function getExt(): string {
  if (MODE === "js") return ".js";
  if (MODE === "ts") return ".ts";
  if (MODE === "none") return "";
  const choices = [".js", ".ts", ""];
  const ext = choices[Math.floor(Math.random() * choices.length)]!;
  console.log(`chose extension: ${ext || "(none)"}`);
  return ext;
}

// note: `file` has no extension here
const samples = [
  {
    file: "utils/formatters",
    template: () =>
      `
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
`.trim(),
  },
  {
    file: "components/ui/Button",
    template: (ext: string) =>
      `
import { formatCurrency } from "${ALIAS}/utils/formatters${ext}"
interface ButtonProps { price?: number; label: string }
export function Button({ price, label }: ButtonProps) {
  return {
    render: () => {
      const displayText = price
        ? \`\${label} (\${formatCurrency(price)})\`
        : label
      return \`<button>\${displayText}</button>\`
    },
  }
}
`.trim(),
  },
  {
    file: "components/layout/Header",
    template: (ext: string) =>
      `
import { Button } from "${ALIAS}/components/ui/Button${ext}"
export function Header() {
  return {
    render: () => {
      const loginButton = Button({ label: "Login" })
      return \`<header>\${loginButton.render()}</header>\`
    },
  }
}
`.trim(),
  },
  {
    file: "index",
    template: (ext: string) =>
      `
import { Header } from "${ALIAS}/components/layout/Header${ext}"
import { Button } from "${ALIAS}/components/ui/Button${ext}"
import { formatDate } from "${ALIAS}/utils/formatters${ext}"

console.log("Today is", formatDate(new Date()))
const buyButton = Button({ price: 99.99, label: "Buy Now" })
const header = Header()

console.log(buyButton.render())
console.log(header.render())

async function loadHelpers() {
  const m = await import("${ALIAS}/utils/formatters${ext}")
  console.log("loaded:", Object.keys(m))
}
void loadHelpers()
`.trim(),
  },
];

// dim logging function
const log = (msg: string) => console.log(`\x1b[36;2m${msg}\x1b[0m`);

async function createSampleFiles() {
  // gather dirs (will include "." for root)
  const dirs = [...new Set(samples.map((s) => path.dirname(s.file)))];
  // ensure src root exists
  await fs.mkdir(E_SRC, { recursive: true });
  // make subdirs (skip "." because that's the root)
  await Promise.all(
    dirs.filter((dir) => dir && dir !== ".").map((dir) => fs.mkdir(path.join(E_SRC, dir), { recursive: true })),
  );
  // write each sample file
  await Promise.all(
    samples.map(async ({ file, template }) => {
      const ext = getExt();
      const fullPath = path.join(E_SRC, `${file}.ts`);
      await fs.writeFile(fullPath, template(ext));
      log(`created ${fullPath}`);
    }),
  );
  log("✓ created sample files in e-src");
}

// Bun-specific file operations
async function getFileInfo(filePath: string) {
  if (isBun) {
    const file = getFileBun(filePath);
    const exists = await getFileExists(filePath);
    const size = await getFileSize(filePath);
    const type = await getFileTypeBun(filePath);
    const lastModified = await getFileLastModified(filePath);

    return {
      exists,
      size,
      type,
      lastModified,
      file,
    };
  }
  return null;
}

export async function ePathkit(): Promise<void> {
  log("🚀 starting pathkit example");

  // Check if running in Bun
  if (isBun) {
    log("✨ Running in Bun environment - using optimized file operations");
  } else {
    log("⚠️ Not running in Bun - using standard Node.js file operations");
  }

  await cleanDirs([E_SRC, E_DIST]);
  await createSampleFiles();

  // Example: Attach lib prefix and strip segments
  log("\n📦 Example: Attaching lib prefix and stripping segments");
  await cleanDirs([E_DIST]);
  await copyDir(E_SRC, E_DIST);

  // Step 1: Attach libs/my-cool-lib prefix while preserving @ alias
  log("\nStep 1: Attaching libs/my-cool-lib prefix");
  await attachPathSegmentsInDirectory({
    targetDir: E_DIST,
    segments: ["libs", "my-cool-lib"],
    options: { position: "before", preserveAlias: ALIAS },
  });

  // Step 2: Strip segments first
  log("\nStep 2: Stripping segments");
  await stripPathSegmentsInDirectory({
    targetDir: E_DIST,
    segmentsToStrip: 2,
    alias: ALIAS,
  });

  // Step 3: Convert to relative paths
  log("\nStep 3: Converting to relative paths");
  await convertImportsAliasToRelative({
    targetDir: E_DIST,
    aliasToReplace: ALIAS,
    pathExtFilter: MODE,
  });

  // Optional: Convert extensions if needed
  if (MODE === "js" && TEST_JS_TO_TS_CONVERSION) {
    log("\n📦 Converting extensions from .js to .ts");
    await convertImportsExt({
      targetDir: E_DIST,
      extFrom: "js",
      extTo: "ts",
    });
  }

  // Show file info using Bun's optimized API if available
  if (isBun) {
    log("\n📦 File information using Bun's optimized API:");
    const indexFile = path.join(E_DIST, "index.ts");
    const fileInfo = await getFileInfo(indexFile);
    if (fileInfo) {
      log(`  File: ${indexFile}`);
      log(`  Size: ${fileInfo.size} bytes`);
      log(`  Type: ${fileInfo.type}`);
      log(`  Last Modified: ${fileInfo.lastModified.toLocaleString()}`);
    }
  }

  log("\n✨ Example complete! Check the results in:");
  log(`  - ${E_SRC}: Source files with alias imports`);
  log(`  - ${E_DIST}: Dist files with relative imports`);
}

// ========
// fs utils
// ========

/**
 * removes directories with recursive force option
 */
async function cleanDirs(dirs: string[]): Promise<void> {
  await Promise.all(
    dirs.map(async (d) => {
      try {
        await fs.rm(d, { recursive: true, force: true });
        log(`✓ cleaned: ${d}`);
      } catch (error) {
        log(`✗ error cleaning ${d}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
  );
}

/**
 * recursively copies a directory and its contents
 */
async function copyDir(src: string, dest: string): Promise<void> {
  log(`✓ copying: ${src} → ${dest}`);
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          return copyDir(srcPath, destPath);
        }

        // Use copyFile with mode 0 (default)
        await fs.copyFile(srcPath, destPath, 0);
        log(`  copied: ${srcPath} → ${destPath}`);
      }),
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`✗ error copying directory ${src} to ${dest}: ${errorMsg}`);
    throw error;
  }
}
