import type { Mode, OpenMode } from "node:fs";

import type { WriteFileOptions } from "./write-file.js";

import { writeFileSync } from "./write-file.js";
import { writeFile } from "./write-file.js";

export interface JsonStringifyOptions {
  replacer?: (key: string, value: unknown) => unknown | (number | string)[] | null;
  spaces?: string | number;
}

export interface WriteJsonOptions {
  encoding?: BufferEncoding | null;
  mode?: Mode;
  flag?: OpenMode;
  replacer?: (key: string, value: unknown) => unknown | (number | string)[] | null;
  spaces?: string | number;
  // signal?: AbortSignal;
}

/**
 * Synchronously writes an object to a JSON file.
 *
 * @param file - The path to the file.
 * @param object - The object to stringify and write.
 * @param options - Options for stringifying JSON or writing the file.
 */
export function writeJsonSync(file: string, object: unknown, options: WriteJsonOptions = {}): void {
  const replacer = options.replacer === undefined ? null : options.replacer;
  const spaces = options.spaces === undefined ? 2 : options.spaces;

  const fileWriteOpts: WriteFileOptions = {};
  // Ensuring options passed to writeFileSync conform to its expected WriteFileOptions type
  if (options.encoding !== undefined) fileWriteOpts.encoding = options.encoding as BufferEncoding;
  if (options.mode !== undefined) fileWriteOpts.mode = options.mode;
  if (options.flag !== undefined) fileWriteOpts.flag = options.flag.toString();
  // if (options.signal !== undefined) fileWriteOpts.signal = options.signal;

  const str = JSON.stringify(object, replacer as any, spaces);
  writeFileSync(file, str, fileWriteOpts);
}

/**
 * Asynchronously writes an object to a JSON file.
 *
 * @param file - The path to the file.
 * @param object - The object to stringify and write.
 * @param options - Options for stringifying JSON or writing the file.
 */
export async function writeJson(file: string, object: unknown, options: WriteJsonOptions = {}): Promise<void> {
  const replacer = options.replacer === undefined ? null : options.replacer;
  const spaces = options.spaces === undefined ? 2 : options.spaces;

  const fileWriteOpts: WriteFileOptions = {};
  // Ensuring options passed to writeFile conform to its expected WriteFileOptions type
  if (options.encoding !== undefined) fileWriteOpts.encoding = options.encoding as BufferEncoding;
  if (options.mode !== undefined) fileWriteOpts.mode = options.mode;
  if (options.flag !== undefined) fileWriteOpts.flag = options.flag.toString();
  // if (options.signal !== undefined) fileWriteOpts.signal = options.signal;

  const str = JSON.stringify(object, replacer as any, spaces);
  await writeFile(file, str, fileWriteOpts);
}
