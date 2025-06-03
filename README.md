# Relifso • Bun & Node.js Filesystem Toolkit Library

[sponsor](https://github.com/sponsors/blefnk) — [discord](https://discord.gg/Pb8uKbwpsJ) — [npm](https://npmjs.com/package/@reliverse/relifso) — [github](https://github.com/reliverse/relifso)

> @reliverse/relifso is a modern node and bun filesystem toolkit. drop-in replacement for `node:fs` and `fs-extra` — powered by native promises, built with es modules, and packed with dx-focused and bun-aware utilities.

## Features

- 🔥 Both Node.js and Bun-specific filesystem features are exposed via `fs.*`
- 🪄 Everything you love from `fs-extra` — now simpler, cleaner, and more beginner-friendly
- ⚙️ Drop-in replacement for `node:fs` — with native `Promise`, `async/await`, and sync variants
- 🤝 Forget about `try-catch` for common errors like "file not found" — relifso does it under the hood
- 🧯 Gracefully handles errors like `EMFILE` (reading or writing a lot of files at once) and other edge cases
- 📚 Consistent error-first behavior — even for legacy APIs like `fs.exists()`
- 📦 First-class ESM and full TypeScript support — no config hacks required
- 🧼 Zero bloat — small size, zero deps, modern code, no monkey-patching
- 🎯 Supports all Node.js v16+ features — optimized for Node.js v22+
- 🧪 Soon: Ready for upcoming Node.js v22+ experimental features
- ✌️ Bun v1.2+ ready — ships with Bun-aware enhancements out of the box
- 🐦‍🔥 Finally! Your `fs.*` usage is now can correctly read/write JSON/JSONC!
- 🔧 Built-in JSON repair — automatically fixes common JSON formatting issues

## Install

```bash
# bun • pnpm • yarn • npm
bun add @reliverse/relifso
```

**Migrate**:

```bash
bun rm fs-extra
bun rm @types/fs-extra
# soon:
# bun add -D @reliverse/dler
# bun dler migrate fs-relifso
```

**Pro Tip**: _Use Ctrl+Shift+H to replace `fs-extra` with `@reliverse/relifso` in your project._

### Core Features

- **File Operations**
  - Read/write files with various encodings
  - Copy/move files and directories
  - Create/remove files and directories
  - File existence checks
  - File stats and metadata access

- **Directory Operations**
  - Create nested directories
  - Empty directories
  - Directory traversal with `dive`
  - Directory existence checks

- **JSON Operations**
  - Read/write JSON files with validation
  - JSON repair and validation utilities
  - JSON streaming support
  - JSONC (JSON with Comments) support
  - Automatic JSON repair for common issues:
    - Missing quotes around keys
    - Missing escape characters
    - Missing commas and closing brackets
    - Truncated JSON
    - Single quotes to double quotes conversion
    - Special quote characters normalization
    - Special whitespace normalization
    - Python constants (None, True, False) conversion
    - Trailing comma removal
    - Comment stripping
    - Code block stripping
    - Array/object ellipsis removal
    - JSONP notation removal
    - MongoDB data type conversion
    - String concatenation
    - Newline-delimited JSON conversion

- **Bun Optimizations**
  - Automatic runtime detection
  - Optimized file operations using Bun APIs
  - Fast file stats and metadata access
  - Graceful fallbacks to Node.js APIs

- **Utility Functions**
  - File type detection
  - Hidden file attribute handling
  - Directory emptiness checks
  - File size and last modified time access

### Error Handling

- Graceful handling of common filesystem errors
- Consistent error types and messages
- Automatic error recovery where possible
- Detailed error information for debugging
- Runtime detection errors
- File operation failures
- All Bun-specific operations include proper error handling
- Automatic fallback from Bun to Node.js APIs when needed

## Usage

Check [./e-relifso.ts](./e-relifso.ts) and [./e-pathkit.ts](./e-pathkit.ts) for a full examples. You can clone this repo and run via `bun dev`.

Relifso works just like `fs-extra` — every method is promise-first, ergonomic, and future-ready.

```ts
import { copy, pathExists, remove } from "@reliverse/relifso";

await copy("src/index.ts", "dist/index.ts");

if (await pathExists("dist/index.ts")) {
  await remove("dist/index.ts");
}
```

- ✨ Everything's bundled — modern, async, and type-safe.
- 🧼 No more boilerplate like `promisify(fs.removeSync)` or using `mkdirp`, `ncp`, or `rimraf`.
- 🌱 No more weird `try/catch` for common errors like "file not found."  
- ✌️ Just clean, predictable APIs built for 2025 and beyond.

## Example

```ts
import {
  ensureDir,
  outputJson,
  readJson,
  remove,
} from "@reliverse/relifso";

const path = "./.reliverse/config.json";

await ensureDir(".reliverse");
await outputJson(path, { hello: "world" });

const config = await readJson(path);
console.log(config); // { hello: 'world' }

await remove(".reliverse");
```

## Run Example

Install this repository locally and run the example by using `bun dev`:

```bash
$ bun e-mod.ts
✓   Running examples with Bun...
Created directory ./tests-runtime
[env] writeJson was successfully executed in Bun (for JSON)
Wrote JSON tests-runtime\config.json
[env] readJson was successfully executed in Bun
Read JSON {"hello":"world","ts":"2025-06-02T19:01:53.291Z"}
[env] copy was successfully executed in Bun
Moved → Copied (with overwrite) tests-runtime\config.old.json → tests-runtime\config.copy.json
[env] readFile was successfully executed in Bun
Wrote & read text file Hello Relifso!
[env] writeFile was successfully executed in Bun
[env] writeFile was successfully executed in Bun
Ensured nested & output files
[env] writeJson was successfully executed in Bun (for JSON)
[env] readJson was successfully executed in Bun
writeJson / readJson round-trip {"foo":"bar"}
[env] writeJson was successfully executed in Bun (for JSONC)
Wrote JSONC tests-runtime\config.jsonc
[env] readJson was successfully executed in Bun
Read JSONC {
  "name": "relifso",
  "version": "1.0.0",
  "features": [
    "file operations",
    "directory operations",
    "JSONC support"
  ],
  "settings": {
    "debug": true,
    "verbose": false
  }
}
Emptied directory tests-runtime\empty-me
[env] writeFileSync was successfully executed in Bun
[env] writeJsonSync was successfully executed in Bun (for JSON)
Sync JSON round-trip {"sync":true}
[env] copySync was successfully executed in Bun
copySync → moveSync → removeSync chain complete
Directory structure via dive
 • tests-runtime\config-sync.json
 • tests-runtime\config.copy.json
 • tests-runtime\config.jsonc
 • tests-runtime\config.old.json
 • tests-runtime\config2.json
 • tests-runtime\hello.txt
 • tests-runtime\nested\deep\file.txt
 • tests-runtime\output-file.txt
Directory structure via diveSync
 • tests-runtime\config-sync.json
 • tests-runtime\config.copy.json
 • tests-runtime\config.jsonc
 • tests-runtime\config.old.json
 • tests-runtime\config2.json
 • tests-runtime\hello.txt
 • tests-runtime\nested\deep\file.txt
 • tests-runtime\output-file.txt
Removed directory ./tests-runtime
```

## Sync vs Async vs Legacy

You choose your flavor:

```ts
// Async/Await
await copy("a.txt", "b.txt");

// Sync
copySync("a.txt", "b.txt");

// Callback (legacy-style)
copy("a.txt", "b.txt", err => {
  if (err) console.error(err);
});
```

All async methods return a `Promise` if no callback is passed.

## Fully Typed, Fully Modern

- Written in modern ESM
- Minimal dependencies
- Full TypeScript declarations
- Compatible with Node.js 16+, best with 22+
- Async methods are built from the sync versions — no wrappers, no bloat

## What's Inside?

- All async methods follow the `Promise` pattern by default.
- All sync methods are safe and throw errors when needed.

### Async (recommended)

#### Common Async Methods

- [access](https://uwx-node-modules.github.io/fsxt/functions/access.html)
- [appendFile](https://uwx-node-modules.github.io/fsxt/functions/appendFile.html)
- [copy](https://uwx-node-modules.github.io/fsxt/functions/copy.html)
- [copyFile](https://uwx-node-modules.github.io/fsxt/functions/copyFile.html)
- [cp](https://uwx-node-modules.github.io/fsxt/functions/cp.html)
- [createReadStream](https://uwx-node-modules.github.io/fsxt/functions/createReadStream.html)
- [createWriteStream](https://uwx-node-modules.github.io/fsxt/functions/createWriteStream.html)
- [ensureFile](https://uwx-node-modules.github.io/fsxt/functions/ensureFile.html)
- [exists](https://uwx-node-modules.github.io/fsxt/functions/exists.html)
- [mkdir](https://uwx-node-modules.github.io/fsxt/functions/mkdir.html)
- [mkdirs](https://uwx-node-modules.github.io/fsxt/functions/mkdirs.html)
- [move](https://uwx-node-modules.github.io/fsxt/functions/move.html)
- [open](https://uwx-node-modules.github.io/fsxt/functions/open.html)
- [outputFile](https://uwx-node-modules.github.io/fsxt/functions/outputFile.html)
- [outputJson](https://uwx-node-modules.github.io/fsxt/functions/outputJson.html)
- [read](https://uwx-node-modules.github.io/fsxt/functions/read.html)
- [readdir](https://uwx-node-modules.github.io/fsxt/functions/readdir.html)
- [readFile](https://uwx-node-modules.github.io/fsxt/functions/readFile.html)
- [readJson](https://uwx-node-modules.github.io/fsxt/functions/readJson.html)
- [readLines](https://uwx-node-modules.github.io/fsxt/functions/readLines.html)
- [readText](https://uwx-node-modules.github.io/fsxt/functions/readText.html)
- [rename](https://uwx-node-modules.github.io/fsxt/functions/rename.html)
- [rm](https://uwx-node-modules.github.io/fsxt/functions/rm.html)
- [rmdir](https://uwx-node-modules.github.io/fsxt/functions/rmdir.html)
- [stat](https://uwx-node-modules.github.io/fsxt/functions/stat.html)
- [symlink](https://uwx-node-modules.github.io/fsxt/functions/symlink.html)
- [truncate](https://uwx-node-modules.github.io/fsxt/functions/truncate.html)
- [unlink](https://uwx-node-modules.github.io/fsxt/functions/unlink.html)
- [watch](https://uwx-node-modules.github.io/fsxt/functions/watch.html)
- [watchFile](https://uwx-node-modules.github.io/fsxt/functions/watchFile.html)
- [write](https://uwx-node-modules.github.io/fsxt/functions/write.html)
- [writeFile](https://uwx-node-modules.github.io/fsxt/functions/writeFile.html)
- [writeJson](https://uwx-node-modules.github.io/fsxt/functions/writeJson.html)

#### Less Commonly Used Async Methods

- [chmod](https://uwx-node-modules.github.io/fsxt/functions/chmod.html)
- [chown](https://uwx-node-modules.github.io/fsxt/functions/chown.html)
- [close](https://uwx-node-modules.github.io/fsxt/functions/close.html)
- [dive](https://uwx-node-modules.github.io/fsxt/functions/dive.html)
- [emptyDir](https://uwx-node-modules.github.io/fsxt/functions/emptyDir.html)
- [ensureLink](https://uwx-node-modules.github.io/fsxt/functions/ensureLink.html)
- [ensureSymlink](https://uwx-node-modules.github.io/fsxt/functions/ensureSymlink.html)
- [fchmod](https://uwx-node-modules.github.io/fsxt/functions/fchmod.html)
- [fchown](https://uwx-node-modules.github.io/fsxt/functions/fchown.html)
- [forEachChild](https://uwx-node-modules.github.io/fsxt/functions/forEachChild.html)
- [fstat](https://uwx-node-modules.github.io/fsxt/functions/fstat.html)
- [ftruncate](https://uwx-node-modules.github.io/fsxt/functions/ftruncate.html)
- [futimes](https://uwx-node-modules.github.io/fsxt/functions/futimes.html)
- [gracefulify](https://uwx-node-modules.github.io/fsxt/functions/gracefulify.html)
- [isDirectory](https://uwx-node-modules.github.io/fsxt/functions/isDirectory.html)
- [isSymlink](https://uwx-node-modules.github.io/fsxt/functions/isSymlink.html)
- [~~lchmod~~](https://uwx-node-modules.github.io/fsxt/functions/lchmod.html)
- [lchown](https://uwx-node-modules.github.io/fsxt/functions/lchown.html)
- [`link`](https://uwx-node-modules.github.io/fsxt/functions/link.html)
- [lstat](https://uwx-node-modules.github.io/fsxt/functions/lstat.html)
- [lutimes](https://uwx-node-modules.github.io/fsxt/functions/lutimes.html)
- [mapChildren](https://uwx-node-modules.github.io/fsxt/functions/mapChildren.html)
- [mapStructure](https://uwx-node-modules.github.io/fsxt/functions/mapStructure.html)
- [mapStructureOrdered](https://uwx-node-modules.github.io/fsxt/functions/mapStructureOrdered.html)
- [mkdtemp](https://uwx-node-modules.github.io/fsxt/functions/mkdtemp.html)
- [openAsBlob](https://uwx-node-modules.github.io/fsxt/functions/openAsBlob.html)
- [opendir](https://uwx-node-modules.github.io/fsxt/functions/opendir.html)
- [readv](https://uwx-node-modules.github.io/fsxt/functions/readv.html)
- [realpath](https://uwx-node-modules.github.io/fsxt/functions/realpath.html)
- [remove](https://uwx-node-modules.github.io/fsxt/functions/remove.html)
- [resolve](https://uwx-node-modules.github.io/fsxt/functions/resolve.html)
- [statfs](https://uwx-node-modules.github.io/fsxt/functions/statfs.html)
- [unwatchFile](https://uwx-node-modules.github.io/fsxt/functions/unwatchFile.html)
- [utimes](https://uwx-node-modules.github.io/fsxt/functions/utimes.html)
- [vacuum](https://uwx-node-modules.github.io/fsxt/functions/vacuum.html)
- [writev](https://uwx-node-modules.github.io/fsxt/functions/writev.html)

### Sync

#### Common Sync Methods

- [accessSync](https://uwx-node-modules.github.io/fsxt/functions/accessSync.html)
- [appendFileSync](https://uwx-node-modules.github.io/fsxt/functions/appendFileSync.html)
- [copyFileSync](https://uwx-node-modules.github.io/fsxt/functions/copyFileSync.html)
- [copySync](https://uwx-node-modules.github.io/fsxt/functions/copySync.html)
- [cpSync](https://uwx-node-modules.github.io/fsxt/functions/cpSync.html)
- [existsSync](https://uwx-node-modules.github.io/fsxt/functions/existsSync.html)
- [mkdirSync](https://uwx-node-modules.github.io/fsxt/functions/mkdirSync.html)
- [mkdirsSync](https://uwx-node-modules.github.io/fsxt/functions/mkdirsSync.html)
- [moveSync](https://uwx-node-modules.github.io/fsxt/functions/moveSync.html)
- [openSync](https://uwx-node-modules.github.io/fsxt/functions/openSync.html)
- [outputFileSync](https://uwx-node-modules.github.io/fsxt/functions/outputFileSync.html)
- [outputJsonSync](https://uwx-node-modules.github.io/fsxt/functions/outputJsonSync.html)
- [readdirSync](https://uwx-node-modules.github.io/fsxt/functions/readdirSync.html)
- [readFileSync](https://uwx-node-modules.github.io/fsxt/functions/readFileSync.html)
- [readJsonSync](https://uwx-node-modules.github.io/fsxt/functions/readJsonSync.html)
- [readTextSync](https://uwx-node-modules.github.io/fsxt/functions/readTextSync.html)
- [renameSync](https://uwx-node-modules.github.io/fsxt/functions/renameSync.html)
- [rmSync](https://uwx-node-modules.github.io/fsxt/functions/rmSync.html)
- [rmdirSync](https://uwx-node-modules.github.io/fsxt/functions/rmdirSync.html)
- [statSync](https://uwx-node-modules.github.io/fsxt/functions/statSync.html)
- [symlinkSync](https://uwx-node-modules.github.io/fsxt/functions/symlinkSync.html)
- [truncateSync](https://uwx-node-modules.github.io/fsxt/functions/truncateSync.html)
- [unlinkSync](https://uwx-node-modules.github.io/fsxt/functions/unlinkSync.html)
- [writeFileSync](https://uwx-node-modules.github.io/fsxt/functions/writeFileSync.html)
- [writeJsonSync](https://uwx-node-modules.github.io/fsxt/functions/writeJsonSync.html)
- [writeSync](https://uwx-node-modules.github.io/fsxt/functions/writeSync.html)

#### Less Commonly Used Sync Methods

- [chmodSync](https://uwx-node-modules.github.io/fsxt/functions/chmodSync.html)
- [chownSync](https://uwx-node-modules.github.io/fsxt/functions/chownSync.html)
- [closeSync](https://uwx-node-modules.github.io/fsxt/functions/closeSync.html)
- [diveSync](https://uwx-node-modules.github.io/fsxt/functions/diveSync.html)
- [emptyDirSync](https://uwx-node-modules.github.io/fsxt/functions/emptyDirSync.html)
- [ensureFileSync](https://uwx-node-modules.github.io/fsxt/functions/ensureFileSync.html)
- [ensureLinkSync](https://uwx-node-modules.github.io/fsxt/functions/ensureLinkSync.html)
- [ensureSymlinkSync](https://uwx-node-modules.github.io/fsxt/functions/ensureSymlinkSync.html)
- [fchmodSync](https://uwx-node-modules.github.io/fsxt/functions/fchmodSync.html)
- [fchownSync](https://uwx-node-modules.github.io/fsxt/functions/fchownSync.html)
- [fdatasync](https://uwx-node-modules.github.io/fsxt/functions/fdatasync.html)
- [fdatasyncSync](https://uwx-node-modules.github.io/fsxt/functions/fdatasyncSync.html)
- [forEachChildSync](https://uwx-node-modules.github.io/fsxt/functions/forEachChildSync.html)
- [fstatSync](https://uwx-node-modules.github.io/fsxt/functions/fstatSync.html)
- [fsync](https://uwx-node-modules.github.io/fsxt/functions/fsync.html)
- [fsyncSync](https://uwx-node-modules.github.io/fsxt/functions/fsyncSync.html)
- [ftruncateSync](https://uwx-node-modules.github.io/fsxt/functions/ftruncateSync.html)
- [futimesSync](https://uwx-node-modules.github.io/fsxt/functions/futimesSync.html)
- [isDirectorySync](https://uwx-node-modules.github.io/fsxt/functions/isDirectorySync.html)
- [~~lchmodSync~~](https://uwx-node-modules.github.io/fsxt/functions/lchmodSync.html)
- [lchownSync](https://uwx-node-modules.github.io/fsxt/functions/lchownSync.html)
- [linkSync](https://uwx-node-modules.github.io/fsxt/functions/linkSync.html)
- [lstatSync](https://uwx-node-modules.github.io/fsxt/functions/lstatSync.html)
- [lutimesSync](https://uwx-node-modules.github.io/fsxt/functions/lutimesSync.html)
- [mkdirsSync](https://uwx-node-modules.github.io/fsxt/functions/mkdirsSync.html)
- [mkdtempSync](https://uwx-node-modules.github.io/fsxt/functions/mkdtempSync.html)
- [opendirSync](https://uwx-node-modules.github.io/fsxt/functions/opendirSync.html)
- [readLinesSync](https://uwx-node-modules.github.io/fsxt/functions/readLinesSync.html)
- [readlinkSync](https://uwx-node-modules.github.io/fsxt/functions/readlinkSync.html)
- [readSync](https://uwx-node-modules.github.io/fsxt/functions/readSync.html)
- [readvSync](https://uwx-node-modules.github.io/fsxt/functions/readvSync.html)
- [realpathSync](https://uwx-node-modules.github.io/fsxt/functions/realpathSync.html)
- [removeSync](https://uwx-node-modules.github.io/fsxt/functions/removeSync.html)
- [statfsSync](https://uwx-node-modules.github.io/fsxt/functions/statfsSync.html)
- [utimesSync](https://uwx-node-modules.github.io/fsxt/functions/utimesSync.html)
- [writevSync](https://uwx-node-modules.github.io/fsxt/functions/writevSync.html)

## Bun Integration

Relifso provides first-class support for Bun with automatic fallbacks to Node.js APIs. Here's how it works:

### JSON Repair Integration

Relifso includes built-in JSON repair capabilities powered by `jsonrepair`, providing robust handling of malformed JSON files. This integration is particularly useful when dealing with JSON files that may have formatting issues or come from various sources.

#### Repair Features

- **Automatic Repair**: Automatically fixes common JSON formatting issues without requiring manual intervention
- **Streaming Support**: Handles infinitely large JSON documents through streaming
- **Error Recovery**: Gracefully handles and repairs various JSON syntax errors
- **Performance Optimized**: Efficient processing with configurable buffer sizes

#### Usage Example

```ts
import { readJson, writeJson } from "@reliverse/relifso";

// Reading a malformed JSON file
const malformedJson = `{
  name: 'John',  // Missing quotes and using single quotes
  age: 30,
  active: True,  // Python-style boolean
  tags: ['dev', 'js', ...],  // Trailing ellipsis
  metadata: {
    lastLogin: ISODate("2024-03-20T10:00:00Z")  // MongoDB date
  }
}`;

// The JSON will be automatically repaired when reading
const data = await readJson("config.json");
console.log(data);
// Output: Properly formatted JSON with all issues fixed

// Writing JSON with automatic repair
await writeJson("output.json", data, { repair: true });
```

#### Streaming Support

For large JSON files, you can use the streaming API:

```ts
import { createReadStream, createWriteStream } from "@reliverse/relifso";

const inputStream = createReadStream("./data/broken.json");
const outputStream = createWriteStream("./data/repaired.json");

// The repair happens automatically during the stream
await pipeline(inputStream, outputStream);
```

#### Configuration Options

When using JSON operations, you can configure the repair behavior:

```ts
import { readJson } from "@reliverse/relifso";

const options = {
  repair: true,  // Enable automatic repair
  streaming: {
    chunkSize: 65536,    // Size of output chunks
    bufferSize: 65536    // Size of repair buffer
  }
};

const data = await readJson("large.json", options);
```

### Automatic Runtime Detection

```ts
import { isBun } from "@reliverse/relifso";

if (isBun) {
  console.log("Running in Bun!");
} else {
  console.log("Running in Node.js");
}
```

### Optimized File Operations

When running in Bun, relifso automatically uses Bun's optimized file system APIs:

- `Bun.file()` for file operations
- Native file existence checks
- Optimized file size and type detection
- Fast last modified time access

### Graceful Fallbacks

All Bun-specific operations include automatic fallbacks to Node.js APIs:

```ts
import { getStats } from "@reliverse/relifso";

// In Bun: Uses Bun.file() for faster stats
// In Node.js: Falls back to fs.stat()
const stats = await getStats("file.txt");
```

### Available Bun-Specific Utilities

- `getFile(path)` - Get a Bun file reference
- `exists(path)` - Check file existence using Bun's API
- `size(path)` - Get file size using Bun's API
- `type(path)` - Get file MIME type using Bun's API
- `lastModified(path)` - Get file last modified time
- `getStats(path)` - Get file stats with Bun optimization
- `getStatsSync(path)` - Synchronous version of getStats

## Contributing

...

## TODO

- [x] Create usage example in [./example/e-relifso.ts](./example/e-relifso.ts) and [./example/e-pathkit.ts](./example/e-pathkit.ts)
- [x] Ensure [./example/e-relifso.ts](./example/e-relifso.ts) and [./example/e-pathkit.ts](./example/e-pathkit.ts) works 100% correctly
- [ ] Consider using [@reliverse/repath](https://github.com/reliverse/repath) instead of just `node:path`.
- [ ] Pass all `fs-extra` tests with Bun (+ fix & improve them).
- [ ] In [docs.reliverse.org](https://docs.reliverse.org) implement feature and performance comparison table with `fs-extra`.

## Shoutouts

Relifso wouldn't be so cool without these gems:

- [`node:fs`](https://nodejs.org/api/fs.html)+[`node:path`](https://nodejs.org/api/path.html) — origins
- [`fs-extra`](https://github.com/jprichardson/node-fs-extra) — classic, reliable
- [`fsxt`](https://github.com/uwx-node-modules/fsxt) — full fs-extra overhaul

## Show Some Love

If `@reliverse/relifso` reduced the number of lines in your codebase:

- ⭐ [Star it on GitHub](https://github.com/reliverse/relifso)
- 💖 [Sponsor @blefnk](https://github.com/sponsors/blefnk)
- 🧙 Recommend it to your dev friends

## License

[MIT](./LICENSE) © 2025 [Nazar Kornienko (blefnk)](https://github.com/blefnk)
