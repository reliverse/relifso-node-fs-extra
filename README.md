# @reliverse/relifso

[💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [📦 NPM](https://npmjs.com/package/@reliverse/relifso) • [✨ Repo](https://github.com/reliverse/relifso) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ)

> **@reliverse/relifso** is a modern filesystem toolkit for builders. Drop-in replacement for `node:fs` and `fs-extra` — powered by native promises, built with ES modules, and packed with Bun-specific features and DX-focused utilities.

## Why Relifso?

- 🪄 Everything you love from `fs-extra` — now simpler, cleaner, and more beginner-friendly
- ⚙️ Drop-in replacement for `node:fs` — with native `Promise`, `async/await`, and sync variants
- 📦 First-class ESM and full TypeScript support — no config hacks required
- 🧼 Zero bloat — minimal deps, modern code, no monkey-patching
- 🧯 Gracefully handles errors like `EMFILE` and other edge cases
- 📚 Consistent error-first behavior — even for legacy APIs like `fs.exists()`
- 🎯 Supports all Node.js v16+ features — optimized for Node.js v22+
- 🧪 Ready for upcoming Node.js v22+ experimental features
- ✌️ Bun v1.2+ ready — ships with Bun-aware enhancements out of the box
- 🔥 Bun-specific features are exposed via `fs.*` when running on Bun

## Install

```bash
bun add @reliverse/relifso
# bun • pnpm • yarn • npm
```

## Usage

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

## What’s Inside?

### File & Directory Ops

- `copy()` / `copySync()`
- `move()` / `moveSync()`
- `remove()` / `removeSync()`
- `mkdirp()` / `mkdirpSync()` / `ensureDir()` / `ensureLink()` / `ensureSymlink()`
- `emptyDir()` / `emptyDirSync()`
- `createFile()` / `createFileSync()`

### I/O Helpers

- `readJson()` / `readJsonSync()`
- `writeJson()` / `writeJsonSync()`
- `outputFile()` / `outputFileSync()`
- `outputJson()` / `outputJsonSync()`
- `pathExists()` / `pathExistsSync()`
- `readFile()` / `readFileSync()`
- `writeFile()` / `writeFileSync()`

> All async methods follow the `Promise` pattern. All sync methods are safe and throw errors when needed.

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

// Callback (legacy-style)
copy("a.txt", "b.txt", err => {
  if (err) console.error(err);
});

// Sync
copySync("a.txt", "b.txt");
```

All async methods return a `Promise` if no callback is passed.

## Fully Typed, Fully Modern

- Written in modern ESM
- Zero dependencies (except `graceful-fs`)
- Full TypeScript declarations
- Compatible with Node.js 16+, best with 18+
- Async methods are built from the sync versions — no wrappers, no bloat

## Show Some Love

If `@reliverse/relifso` reduced the number of lines in your codebase:

- ⭐ [Star it on GitHub](https://github.com/reliverse/relifso)
- 💖 [Sponsor @blefnk](https://github.com/sponsors/blefnk)
- 🧙 Recommend it to your dev friends

## Related Projects

- [`fsxt`](https://github.com/uwx-node-modules/fsxt) — modern fork of `fs-extra`, partially influences internal design
- [`fs-lite`](https://github.com/baooab/node-fs-lite) — no-deps, sync-first file system helpers
- [`fs-extra`](https://github.com/jprichardson/node-fs-extra) — classic, reliable, but dated

## Shoutouts

**relifso** wouldn’t exist without these gems:

[node:fs](https://nodejs.org/api/fs.html)+[node:path](https://nodejs.org/api/fs.html) > [node-fs-extra](https://github.com/jprichardson/node-fs-extra#readme) > [fsxt](https://github.com/uwx-node-modules/fsxt#readme)+[node-fs-lite](https://github.com/baooab/node-fs-lite#readme) » _relifso_

## License

Welcome to the Reliverse — we build tools that builders want.

MIT © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
