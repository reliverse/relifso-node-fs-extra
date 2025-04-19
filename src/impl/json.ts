// json.ts
import type { JsonOutputOptions } from 'fs-extra';
import type { ReadCallback, WriteCallback } from 'jsonfile';

import { readFileSync, writeFileSync } from 'graceful-fs';

import type { JsonReadOptions, JsonWriteOptions } from '~/types.js';

import * as fs from '~/impl/fs/index.js';
import { universalify } from '~/impl/fs/universalify.js';
import { outputFile, outputFileSync } from '~/impl/lib/output-file/index.js';

/* -------------------------------------------------------------------------- */
/*                              Internals                                     */
/* -------------------------------------------------------------------------- */

const stripBom = (content: string | Buffer): string =>
  Buffer.isBuffer(content)
    ? content.toString('utf8').replace(/^\uFEFF/, '')
    : content.replace(/^\uFEFF/, '');

const stringify = (
  obj: unknown,
  {
    EOL = '\n',
    finalEOL = true,
    replacer,
    spaces,
  }: Extract<JsonWriteOptions, object>,
): string => {
  const eof = finalEOL ? EOL : '';
  return JSON.stringify(obj, replacer, spaces).replace(/\n/g, EOL) + eof;
};

/* -------------------------------------------------------------------------- */
/*                               readJson                                     */
/* -------------------------------------------------------------------------- */

async function _readJson<T>(
  file: fs.PathOrFileDescriptor,
  options: JsonReadOptions = {},
): Promise<T | null> {
  // Allow string as encoding shortcut
  if (typeof options === 'string') options = { encoding: options };

  const read = options.fs?.readFile
    ? universalify(options.fs.readFile)
    : fs.readFile;

  const data = stripBom(await read(file, options));

  try {
    return JSON.parse(data, options.reviver);
  } catch (err) {
    if (options.throws ?? true) {
      const e = err instanceof Error ? err : new Error(String(err));
      e.message = `${file}: ${e.message}`;
      throw e;
    }
    return null;
  }
}

export function readJson(
  file: fs.PathOrFileDescriptor,
  options: JsonReadOptions,
  callback: ReadCallback,
): void;
export function readJson(
  file: fs.PathOrFileDescriptor,
  callback: ReadCallback,
): void;
export function readJson<T>(
  file: fs.PathOrFileDescriptor,
  options?: JsonReadOptions,
): Promise<T>;
export function readJson(
  file: fs.PathOrFileDescriptor,
  o1?: JsonReadOptions | ReadCallback,
  o2?: ReadCallback,
): any {
  const options = (typeof o1 === 'object' ? o1 : undefined) as JsonReadOptions;
  const cb = (typeof o1 === 'function' ? o1 : o2) as ReadCallback | undefined;

  if (!cb) return _readJson(file, options);

  void _readJson(file, options).then(
    (res) => cb(null, res),
    (err) => cb(err as Error, undefined),
  );
}

/* ------------------------------ readJsonSync ------------------------------ */

export function readJsonSync<T = any>(
  file: fs.PathOrFileDescriptor,
  options: JsonReadOptions = {},
): T | null {
  if (typeof options === 'string') options = { encoding: options };
  const read = options.fs?.readFileSync ?? readFileSync;

  try {
    const data = stripBom(read(file, options));
    return JSON.parse(data, options.reviver);
  } catch (err) {
    if (options.throws ?? true) {
      const e = err instanceof Error ? err : new Error(String(err));
      e.message = `${file}: ${e.message}`;
      throw e;
    }
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                               writeJson                                    */
/* -------------------------------------------------------------------------- */

async function _writeJson(
  file: fs.PathOrFileDescriptor,
  obj: unknown,
  options: JsonWriteOptions = {},
): Promise<void> {
  if (typeof options === 'string') options = { encoding: options };
  const write = options.fs?.writeFile
    ? universalify(options.fs.writeFile)
    : fs.writeFile;
  await write(file, stringify(obj, options), options);
}

export function writeJson(
  file: fs.PathOrFileDescriptor,
  obj: unknown,
  options: JsonWriteOptions,
  callback: WriteCallback,
): void;
export function writeJson(
  file: fs.PathOrFileDescriptor,
  obj: unknown,
  callback: WriteCallback,
): void;
export function writeJson(
  file: fs.PathOrFileDescriptor,
  obj: unknown,
  options?: JsonWriteOptions,
): Promise<void>;
export function writeJson(
  file: fs.PathOrFileDescriptor,
  obj: unknown,
  o1?: JsonWriteOptions | WriteCallback,
  o2?: WriteCallback,
): any {
  const options = (typeof o1 === 'object' ? o1 : undefined) as JsonWriteOptions;
  const cb = (typeof o1 === 'function' ? o1 : o2) as WriteCallback | undefined;

  if (!cb) return _writeJson(file, obj, options);

  void _writeJson(file, obj, options).then(
    () => cb(null),
    (err) => cb(err as Error),
  );
}

/* ----------------------------- writeJsonSync ------------------------------ */

export function writeJsonSync(
  file: fs.PathOrFileDescriptor,
  obj: unknown,
  options: JsonWriteOptions = {},
): void {
  if (typeof options === 'string') options = { encoding: options };
  const write = options.fs?.writeFileSync ?? writeFileSync;
  write(file, stringify(obj, options), options);
}

/* -------------------------------------------------------------------------- */
/*                               outputJson                                   */
/* -------------------------------------------------------------------------- */

export function outputJson(
  file: string,
  data: unknown,
  options?: JsonOutputOptions,
): Promise<void>;
export function outputJson(
  file: string,
  data: unknown,
  options: JsonOutputOptions,
  callback: fs.NoParamCallback,
): void;
export function outputJson(
  file: string,
  data: unknown,
  callback: fs.NoParamCallback,
): void;
export function outputJson(
  file: string,
  data: unknown,
  o1?: JsonOutputOptions | fs.NoParamCallback,
  o2?: fs.NoParamCallback,
): any {
  const options = (typeof o1 === 'object' ? o1 : {}) as JsonOutputOptions;
  const cb = (typeof o1 === 'function' ? o1 : o2) as fs.NoParamCallback | undefined;

  if (cb) {
    return outputFile(file, stringify(data, options), options, cb);
  }
  return new Promise<void>((res, rej) => {
    outputFile(file, stringify(data, options), options, (err) =>
      err ? rej(err) : res()
    );
  });
}

/* ---------------------------- outputJsonSync ------------------------------ */

export function outputJsonSync(
  file: string,
  data: unknown,
  options: JsonOutputOptions = {},
): void {
  outputFileSync(file, stringify(data, options), options);
}
