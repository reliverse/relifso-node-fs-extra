import { exists as pathExists } from "deprecated/impl/fs/exists.js";
import { rename as _rename } from "deprecated/impl/fs/index.js";
import { copy } from "deprecated/impl/lib/copy/index.js";
import { mkdirs } from "deprecated/impl/lib/mkdirs/index.js";
import { remove } from "deprecated/impl/lib/remove/index.js";
import * as stat from "deprecated/impl/lib/util/stat.js";
import { dirname, parse } from "node:path";
import { fromPromise } from "universalify";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface MoveOptions {
  overwrite?: boolean;
  clobber?: boolean; // legacy alias
}

/* -------------------------------------------------------------------------- */
/*                                   Main                                     */
/* -------------------------------------------------------------------------- */

async function _move(src: string, dest: string, opts: MoveOptions = {}): Promise<void> {
  const overwrite = opts.overwrite ?? opts.clobber ?? false;

  const { srcStat, isChangingCase = false } = await stat.checkPaths(src, dest, "move", opts);
  await stat.checkParentPaths(src, srcStat, dest, "move");

  // Ensure destination’s parent exists (unless it’s the filesystem root)
  const parent = dirname(dest);
  if (parse(parent).root !== parent) {
    await mkdirs(parent);
  }

  await doRename(src, dest, overwrite, isChangingCase);
}

export default fromPromise(_move);

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

async function doRename(src: string, dest: string, overwrite: boolean, isChangingCase: boolean): Promise<void> {
  if (!isChangingCase) {
    if (overwrite) {
      await remove(dest);
    } else if (await pathExists(dest)) {
      throw new Error(`'${dest}' already exists`);
    }
  }

  try {
    await _rename(src, dest);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code !== "EXDEV") throw err; // not a cross‑device error
    await moveAcrossDevices(src, dest, overwrite);
  }
}

async function moveAcrossDevices(src: string, dest: string, overwrite: boolean): Promise<void> {
  await copy(src, dest, {
    overwrite,
    errorOnExist: true,
    preserveTimestamps: true,
  });
  await remove(src);
}
