// 👉 `bun gen-src-mod.ts`

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { glob } from "tinyglobby";
import ts from "typescript";

interface ExportInfo {
  name: string;
  isType: boolean;
  isDefault: boolean;
}

interface FileExports {
  filePath: string;
  relativeImportPath: string;
  exports: ExportInfo[];
}

const parseExports = (sourceCode: string): ExportInfo[] => {
  const exports: ExportInfo[] = [];
  const sourceFile = ts.createSourceFile("temp.ts", sourceCode, ts.ScriptTarget.Latest, true);

  const visit = (node: ts.Node) => {
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          exports.push({
            name: element.name.text,
            isType: element.isTypeOnly,
            isDefault: false,
          });
        }
      }
    } else if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          exports.push({
            name: declaration.name.text,
            isType: false,
            isDefault: false,
          });
        }
      }
    } else if (ts.isFunctionDeclaration(node) && hasExportModifier(node)) {
      if (node.name) {
        exports.push({
          name: node.name.text,
          isType: false,
          isDefault: false,
        });
      }
    } else if (ts.isTypeAliasDeclaration(node) && hasExportModifier(node)) {
      exports.push({
        name: node.name.text,
        isType: true,
        isDefault: false,
      });
    } else if (ts.isInterfaceDeclaration(node) && hasExportModifier(node)) {
      exports.push({
        name: node.name.text,
        isType: true,
        isDefault: false,
      });
    } else if (ts.isEnumDeclaration(node) && hasExportModifier(node)) {
      exports.push({
        name: node.name.text,
        isType: true,
        isDefault: false,
      });
    } else if (ts.isExportAssignment(node) && !node.isExportEquals) {
      exports.push({
        name: "default",
        isType: false,
        isDefault: true,
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return exports;
};

const hasExportModifier = (node: ts.Node): boolean => {
  return (
    ("modifiers" in node &&
      (node as { modifiers: ts.Modifier[] }).modifiers.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )) ??
    false
  );
};

const generateModFile = async (): Promise<void> => {
  const implFiles = await glob("src/impl/**/*.ts", { cwd: process.cwd() });
  const fileExports: FileExports[] = [];

  // Parse exports from each impl file
  for (const filePath of implFiles) {
    const fullPath = resolve(filePath);
    const sourceCode = readFileSync(fullPath, "utf-8");
    const exports = parseExports(sourceCode);
    const relativeImportPath = `./${relative("src", filePath).replace(/\.ts$/, ".js")}`;

    fileExports.push({
      filePath,
      relativeImportPath,
      exports,
    });
  }

  // Generate the mod.ts content
  const imports: string[] = [];
  const typeExports: string[] = [];
  const namedExports: string[] = [];
  const defaultExportItems: string[] = [];

  // Node.js fs imports (these are hardcoded as they're not from impl files)
  const nodefsImports = `import {
  // Aliases
  renameSync as nodeRenameSync,
  unlinkSync as nodeUnlinkSync,
  // Direct imports from node:fs
  accessSync,
  constants,
  readdirSync,
  statSync,
  copyFileSync,
  appendFileSync,
  chmodSync,
  chownSync,
  closeSync,
  createReadStream,
  createWriteStream,
  fchmodSync,
  fchownSync,
  fdatasyncSync,
  fstatSync,
  fsyncSync,
  ftruncateSync,
  futimesSync,
  lchmodSync,
  lchownSync,
  linkSync,
  lstatSync,
  lutimesSync,
  mkdtempSync,
  openSync,
  opendirSync,
  readSync,
  readlinkSync,
  realpathSync,
  rmSync,
  rmdirSync,
  statfsSync,
  symlinkSync,
  truncateSync,
  unwatchFile,
  utimesSync,
  watchFile,
  writeFileSync,
  writeSync,
  readvSync,
  writevSync,
} from "node:fs";
import {
  // Aliases
  rename as nodeRename,
  unlink as nodeUnlink,
  // Direct imports from node:fs/promises
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  lchmod,
  lchown,
  link,
  lstat,
  lutimes,
  mkdtemp,
  open,
  opendir,
  readdir,
  readlink,
  realpath,
  rm,
  rmdir,
  stat,
  statfs,
  symlink,
  truncate,
  utimes,
  watch,
  writeFile,
} from "node:fs/promises";
import { resolve } from "node:path";`;

  imports.push(nodefsImports);

  // Process each impl file
  for (const fileExport of fileExports) {
    const { relativeImportPath, exports } = fileExport;

    const regularExports = exports.filter((exp) => !exp.isType && !exp.isDefault);
    const typeOnlyExports = exports.filter((exp) => exp.isType);

    if (regularExports.length > 0) {
      const exportNames = regularExports.map((exp) => exp.name).join(", ");
      imports.push(`import { ${exportNames} } from "${relativeImportPath}";`);
      namedExports.push(...regularExports.map((exp) => exp.name));
      defaultExportItems.push(...regularExports.map((exp) => exp.name));
    }

    if (typeOnlyExports.length > 0) {
      for (const typeExp of typeOnlyExports) {
        typeExports.push(`export type { ${typeExp.name} } from "${relativeImportPath}";`);
      }
    }
  }

  // Inject predefined aliases
  const aliases = `
// alias
const mkdirp = mkdirs;
const ensureDir = mkdirs;
const ensureFile = createFile;
const rimraf = remove;
const ncp = copy;
const mkdirpSync = mkdirsSync;
const ensureDirSync = mkdirsSync;
const ensureFileSync = createFileSync;
const rimrafSync = removeSync;
const ncpSync = copySync;
const mkdir = mkdirs;
const mkdirSync = mkdirsSync;
const unlink = remove;
const unlinkSync = removeSync;
const rename = move;
const renameSync = moveSync;
const readJSON = readJson;
const readJSONSync = readJsonSync;
const writeJSON = writeJson;
const writeJSONSync = writeJsonSync;
const outputJSON = outputJson;
const outputJSONSync = outputJsonSync;
const cp = copy;
const cpSync = copySync;
const exists = pathExists;
const existsSync = pathExistsSync;`;

  // Node.js exports (hardcoded)
  const nodeExports = [
    // Sync
    "accessSync",
    "appendFileSync",
    "chmodSync",
    "chownSync",
    "closeSync",
    "copyFileSync",
    "createReadStream",
    "createWriteStream",
    "fchmodSync",
    "fchownSync",
    "fdatasyncSync",
    "fstatSync",
    "fsyncSync",
    "ftruncateSync",
    "futimesSync",
    "lchmodSync",
    "lchownSync",
    "linkSync",
    "lstatSync",
    "lutimesSync",
    "mkdtempSync",
    "openSync",
    "opendirSync",
    "readSync",
    "readlinkSync",
    "readdirSync",
    "realpathSync",
    "nodeRenameSync",
    "rmSync",
    "rmdirSync",
    "statSync",
    "statfsSync",
    "symlinkSync",
    "truncateSync",
    "nodeUnlinkSync",
    "unwatchFile",
    "utimesSync",
    "watchFile",
    "writeFileSync",
    "writeSync",
    "readvSync",
    "writevSync",
    // Async
    "access",
    "appendFile",
    "chmod",
    "chown",
    "copyFile",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "lutimes",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readlink",
    "realpath",
    "nodeRename",
    "rm",
    "rmdir",
    "stat",
    "statfs",
    "symlink",
    "truncate",
    "nodeUnlink",
    "utimes",
    "watch",
    "writeFile",
    // Constants
    "constants",
    "resolve",
  ];

  const aliasExports = [
    "mkdirp",
    "ensureDir",
    "ensureFile",
    "rimraf",
    "ncp",
    "mkdirpSync",
    "ensureDirSync",
    "ensureFileSync",
    "rimrafSync",
    "ncpSync",
    "mkdir",
    "mkdirSync",
    "unlink",
    "unlinkSync",
    "rename",
    "renameSync",
    "readJSON",
    "readJSONSync",
    "writeJSON",
    "writeJSONSync",
    "outputJSON",
    "outputJSONSync",
    "cp",
    "cpSync",
    "exists",
    "existsSync",
  ];

  const allNamedExports = [...nodeExports, ...namedExports, ...aliasExports];
  const allDefaultExports = [...nodeExports, ...defaultExportItems, ...aliasExports];

  // Generate final content
  const content = `${imports.join("\n")}

${aliases}

${typeExports.join("\n")}

// Named exports
export {
  ${allNamedExports.join(",\n  ")},
};

// default export - ensure this mirrors the named exports
const fs = {
  ${allDefaultExports.join(",\n  ")},
};

export default fs;
`;

  writeFileSync("src/mod.ts", content);
  console.log("Generated src/mod.ts successfully!");
};

// Run the script
generateModFile().catch(console.error);
