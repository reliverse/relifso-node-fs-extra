import { writeFileSync as nodeWriteFileSync, type PathLike, type WriteStream, createWriteStream } from "node:fs";
import { mkdir, writeFile as nodeWriteFileAsync } from "node:fs/promises";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { URL } from "node:url";

import { logInternal } from "~/utils/log.js";

import { isBun } from "./bun.js";
import { mkdirsSync } from "./mkdirs.js";

export interface WriteFileOptions {
  encoding?: BufferEncoding | null;
  mode?: number;
  flag?: string;
  isJson?: boolean;
  useStreaming?: boolean;
  replacer?: (key: string, value: unknown) => unknown;
  spaces?: string | number;
}

type WriteTarget = PathLike | number | URL | WriteStream;

function isStdStream(target: WriteTarget): target is WriteStream {
  return typeof target === "object" && target !== null && "write" in target && typeof target.write === "function";
}

function isFileDescriptor(target: WriteTarget): target is number {
  return typeof target === "number";
}

function isPathLike(target: WriteTarget): target is PathLike {
  return !isStdStream(target) && !isFileDescriptor(target) && !(target instanceof URL);
}

/**
 * Synchronously writes data to a file, replacing the file if it already exists.
 * Ensures the directory exists before writing.
 *
 * @param file - Path to the file, file descriptor, URL, or special streams (stdout/stderr).
 * @param data - The data to write. Will be converted to string if not already a string.
 * @param options - Options for writing the file. Can be an encoding string or an object.
 */
export function writeFileSync(
  file: WriteTarget,
  data: string | NodeJS.ArrayBufferView | Blob | Response | unknown,
  options?: WriteFileOptions,
): void {
  let isJson = false;
  let replacer: ((key: string, value: unknown) => unknown) | undefined;
  let spaces: string | number | undefined;
  let encoding: BufferEncoding | null | undefined;
  let mode: number | undefined;
  let flag: string | undefined;

  if (options) {
    isJson = options.isJson ?? isJson;
    replacer = options.replacer;
    spaces = options.spaces;
    encoding = options.encoding;
    mode = options.mode ? Number(options.mode) : undefined;
    flag = options.flag;
  }

  // Convert data to string if needed
  let stringData: string;
  if (typeof data === "string") {
    stringData = data;
  } else if (data instanceof Uint8Array) {
    stringData = Buffer.from(data).toString(encoding || "utf8");
  } else if (data instanceof Blob || data instanceof Response) {
    throw new Error("Blob and Response are not supported in sync context");
  } else if (data instanceof ArrayBuffer) {
    stringData = Buffer.from(new Uint8Array(data)).toString(encoding || "utf8");
  } else if (ArrayBuffer.isView(data)) {
    stringData = Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString(encoding || "utf8");
  } else if (isJson) {
    try {
      stringData = JSON.stringify(data, replacer, spaces);
      if (stringData === undefined) {
        throw new Error("Failed to stringify JSON object");
      }
    } catch (err) {
      throw new Error(`Failed to stringify JSON data: ${err}`);
    }
  } else {
    stringData = String(data);
  }

  // Handle special streams
  if (isStdStream(file)) {
    file.write(stringData);
    return;
  }

  // Handle file descriptors
  if (isFileDescriptor(file)) {
    if (isBun) {
      // Use Bun's file descriptor write
      Bun.write(Bun.file(file), stringData);
      return;
    }
    // Use Node's fs.writeFileSync for file descriptors
    nodeWriteFileSync(file as unknown as PathLike, stringData, { encoding: encoding || "utf8", mode, flag });
    return;
  }

  // Handle URLs
  if (file instanceof URL) {
    if (file.protocol !== "file:") {
      throw new Error("Only file:// URLs are supported");
    }
    file = file.pathname;
  }

  // At this point, file must be a PathLike
  if (!isPathLike(file)) {
    throw new Error("Invalid file target");
  }

  const dir = path.dirname(file.toString());
  mkdirsSync(dir);

  // Use Bun's optimized file writing if available
  if (isBun) {
    try {
      const filePath = file.toString();
      // Use Bun's optimized write
      Bun.write(filePath, stringData);
      logInternal("[env] writeFileSync was successfully executed in Bun");
      return;
    } catch (_error) {
      // Fall back to Node.js implementation if Bun's fails
      logInternal("Bun write failed, falling back to Node.js implementation");
    }
  }

  // Node.js implementation
  nodeWriteFileSync(file, stringData, { encoding: encoding || "utf8", mode, flag });
  logInternal("[env] writeFileSync was successfully executed in Node.js");
}

/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 * Ensures the directory exists before writing.
 *
 * @param file - Path to the file, file descriptor, URL, or special streams (stdout/stderr).
 * @param data - The data to write. Will be converted to string if not already a string.
 * @param options - Options for writing the file. Can be an encoding string or an object.
 */
export async function writeFile(
  file: WriteTarget,
  data: string | NodeJS.ArrayBufferView | Blob | Response | unknown,
  options?: WriteFileOptions,
): Promise<void> {
  let isJson = false;
  let useStreaming = false;
  let replacer: ((key: string, value: unknown) => unknown) | undefined;
  let spaces: string | number | undefined;
  let encoding: BufferEncoding | null | undefined;
  let mode: number | undefined;
  let flag: string | undefined;

  if (options) {
    isJson = options.isJson ?? isJson;
    useStreaming = options.useStreaming ?? useStreaming;
    replacer = options.replacer;
    spaces = options.spaces;
    encoding = options.encoding;
    mode = options.mode ? Number(options.mode) : undefined;
    flag = options.flag;
  }

  // Convert data to string if needed
  let stringData: string;
  if (typeof data === "string") {
    stringData = data;
  } else if (data instanceof Uint8Array) {
    stringData = Buffer.from(data).toString(encoding || "utf8");
  } else if (data instanceof Blob) {
    stringData = await data.text();
  } else if (data instanceof Response) {
    stringData = await data.text();
  } else if (data instanceof ArrayBuffer) {
    stringData = Buffer.from(new Uint8Array(data)).toString(encoding || "utf8");
  } else if (ArrayBuffer.isView(data)) {
    stringData = Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString(encoding || "utf8");
  } else if (isJson) {
    try {
      stringData = JSON.stringify(data, replacer, spaces);
      if (stringData === undefined) {
        throw new Error("Failed to stringify JSON object");
      }
    } catch (err) {
      throw new Error(`Failed to stringify JSON data: ${err}`);
    }
  } else {
    stringData = String(data);
  }

  // Handle special streams
  if (isStdStream(file)) {
    file.write(stringData);
    return;
  }

  // Handle file descriptors
  if (isFileDescriptor(file)) {
    if (isBun) {
      // Use Bun's file descriptor write
      await Bun.write(Bun.file(file), stringData);
      return;
    }
    // Use Node's fs.writeFile for file descriptors
    await nodeWriteFileAsync(file as unknown as PathLike, stringData, { encoding: encoding || "utf8", mode, flag });
    return;
  }

  // Handle URLs
  if (file instanceof URL) {
    if (file.protocol !== "file:") {
      throw new Error("Only file:// URLs are supported");
    }
    file = file.pathname;
  }

  // At this point, file must be a PathLike
  if (!isPathLike(file)) {
    throw new Error("Invalid file target");
  }

  const dir = path.dirname(file.toString());
  await mkdir(dir, { recursive: true });

  // Use streaming for large files if enabled
  if (useStreaming) {
    try {
      const writeStream = createWriteStream(file, { encoding: encoding || "utf8", mode, flags: flag });
      const transform = new Transform({
        transform(chunk, _encoding, callback) {
          callback(null, chunk);
        },
      });

      await pipeline(stringData, transform, writeStream);
      logInternal("[env] writeFile was successfully executed using streaming");
      return;
    } catch (streamError) {
      logInternal(`Streaming write failed, falling back to standard implementation: ${streamError}`);
    }
  }

  // Use Bun's optimized file writing if available
  if (isBun) {
    try {
      const filePath = file.toString();
      // Use Bun's optimized write
      await Bun.write(filePath, stringData);
      logInternal("[env] writeFile was successfully executed in Bun");
      return;
    } catch (_error) {
      // Fall back to Node.js implementation if Bun's fails
      logInternal("Bun write failed, falling back to Node.js implementation");
    }
  }

  // Node.js implementation
  await nodeWriteFileAsync(file, stringData, { encoding: encoding || "utf8", mode, flag });
  logInternal("[env] writeFile was successfully executed in Node.js");
}
