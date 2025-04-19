export { moveSync } from "fs-extra";
import type { NoParamCallbackWithUndefined } from "fs-extra";

interface MoveOptions {
  overwrite?: boolean;
  clobber?: boolean;
}

export function move(
  src: string,
  dest: string,
  options: undefined,
  callback: NoParamCallbackWithUndefined,
): void;
export function move(
  src: string,
  dest: string,
  options?: MoveOptions,
): Promise<void>;
export function move(
  src: string,
  dest: string,
  callback: NoParamCallbackWithUndefined,
): void;
export function move(
  src: string,
  dest: string,
  options: MoveOptions,
  callback: NoParamCallbackWithUndefined,
): void;
