# Relifso • Node.js Filesystem Toolkit Library

[sponsor](https://github.com/sponsors/blefnk) — [discord](https://discord.gg/Pb8uKbwpsJ) — [npm](https://npmjs.com/package/@reliverse/relifso) — [github](https://github.com/reliverse/relifso)

> @reliverse/relifso is a modern filesystem toolkit for builders. drop-in replacement for `node:fs` and `fs-extra` — powered by native promises, built with es modules, and packed with dx-focused utilities.

## Features

- 🪄 Everything you love from `fs-extra` — now simpler, cleaner, and more beginner-friendly
- ⚙️ Drop-in replacement for `node:fs` — with native `Promise`, `async/await`, and sync variants
- 🤝 Forget about `try-catch` for common errors like “file not found” — relifso does it under the hood
- 🧯 Gracefully handles errors like `EMFILE` (reading or writing a lot of files at once) and other edge cases
- 📚 Consistent error-first behavior — even for legacy APIs like `fs.exists()`
- 📦 First-class ESM and full TypeScript support — no config hacks required
- 🧼 Zero bloat — small size ([4 kB](https://bundlephobia.com/package/@reliverse/relifso@latest)), zero deps, modern code, no monkey-patching
- 🎯 Supports all Node.js v16+ features — optimized for Node.js v22+
- 🧪 **Soon**: Ready for upcoming Node.js v22+ experimental features
- ✌️ **Soon**: Bun v1.2+ ready — ships with Bun-aware enhancements out of the box
- 🔥 **Soon**: Bun-specific features are exposed via `fs.*` when running on Bun

## Heads Up

- **Most of the things** mentioned in this doc **aren’t implemented yet** — they’re part of the vision for ~`v1.3.0`.
- Got thoughts? Ideas? Send your feedback in [Discord](https://discord.gg/Pb8uKbwpsJ) or use [GitHub Issues](https://github.com/reliverse/relifso/issues).
- Your feedback means the world and helps shape where this project goes next. Thank you!

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
# bun dler relifso node-fs to relifso
# bun dler relifso fs-extra to relifso
```

**Coming soon**:

```bash
bun add -D @reliverse/dler
bun dler relifso init ...
```

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

- ✨ Everything’s bundled — modern, async, and type-safe.
- 🧼 No more boilerplate like `promisify(fs.removeSync)` or using `mkdirp`, `ncp`, or `rimraf`.
- 🌱 No more weird `try/catch` for common errors like “file not found.”  
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

## What’s Inside?

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
- [link](https://uwx-node-modules.github.io/fsxt/functions/link.html)
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

## Contributing

...

## TODO

- [x] Create usage example in [./e-relifso.ts](./e-relifso.ts) and [./e-pathkit.ts](./e-pathkit.ts)
- [ ] Ensure [./e-relifso.ts](./e-relifso.ts) and [./e-pathkit.ts](./e-pathkit.ts) works 100% correctly
- [ ] Consider using [@reliverse/repath](https://github.com/reliverse/repath) instead of just `node:path`.
- [ ] Pass all `fs-extra` tests with Bun (+ fix & improve them).
- [ ] Convert all jsdoc comments to TypeScript types.
- [ ] Fully improve all `fs-extra` codebase files.

## Shoutouts

Relifso wouldn’t be so cool without these gems:

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
