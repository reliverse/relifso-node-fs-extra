// move-sync.ts
import { existsSync, renameSync } from 'graceful-fs';
import { dirname, parse } from 'node:path';

import { copySync } from '~/impl/lib/copy/index.js';
import { mkdirsSync } from '~/impl/lib/mkdirs/index.js';
import { removeSync } from '~/impl/lib/remove/index.js';
import {
  checkParentPathsSync,
  checkPathsSync,
} from '~/impl/lib/util/stat.js';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface MoveOptions {
  /** Overwrite destination if it exists */
  overwrite?: boolean;
  /** Legacy alias for `overwrite`. */
  clobber?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                   API                                      */
/* -------------------------------------------------------------------------- */

export function moveSync(
  src: string,
  dest: string,
  options: MoveOptions = {},
): void {
  const overwrite = options.overwrite ?? options.clobber ?? false;

  const { srcStat, isChangingCase = false } = checkPathsSync(
    src,
    dest,
    'move',
    options,
  );
  checkParentPathsSync(src, srcStat, dest, 'move');

  if (!isRootDir(dirname(dest))) {
    mkdirsSync(dirname(dest), {});
  }

  if (isChangingCase) {
    attemptRename(src, dest, overwrite);
    return;
  }

  if (overwrite) {
    removeSync(dest);
  } else if (existsSync(dest)) {
    throw new Error(`'${dest}' already exists`);
  }

  attemptRename(src, dest, overwrite);
}

export default moveSync;

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

const isRootDir = (p: string): boolean => parse(p).root === p;

function attemptRename(src: string, dest: string, overwrite: boolean): void {
  try {
    renameSync(src, dest);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code !== 'EXDEV') throw err; // not a cross‑device error
    moveAcrossDevices(src, dest, overwrite);
  }
}

function moveAcrossDevices(
  src: string,
  dest: string,
  overwrite: boolean,
): void {
  copySync(src, dest, {
    overwrite,
    preserveTimestamps: true,
    errorOnExist: true,
  });
  removeSync(src);
}
