import { createWriteStream } from "node:fs";
import { extname } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { stringifyJsonc } from "~/utils/json/regular/jsonc";
import { logInternal } from "~/utils/log.js";

import { isBun, getFileBun } from "./bun.js";
import { writeFileSync } from "./write-file.js";
import { writeFile } from "./write-file.js";

export interface JsonStringifyOptions {
  replacer?: (key: string, value: unknown) => unknown | (number | string)[] | null;
  spaces?: string | number;
  /**
   * Whether to include comments when writing JSONC files
   * @default false
   */
  includeComments?: boolean;
}

export interface WriteJsonOptions {
  encoding?: BufferEncoding | null;
  mode?: number;
  flag?: string;
  replacer?: (key: string, value: unknown) => unknown | (number | string)[] | null;
  spaces?: string | number;
  throws?: boolean;
  useStreaming?: boolean;
  chunkSize?: number;
  /**
   * Whether to include comments when writing JSONC files
   * @default false
   */
  includeComments?: boolean;
}

/**
 * Synchronously writes a JSON file.
 *
 * @param file - The path to the file.
 * @param object - The object to write.
 * @param options - Options for writing the file or stringifying JSON. Can be an encoding string or an object.
 */
export function writeJsonSync(file: string, object: unknown, options?: BufferEncoding | WriteJsonOptions): void {
  let encoding: BufferEncoding = "utf8";
  let replacer: ((key: string, value: unknown) => unknown) | undefined;
  let spaces: string | number | undefined;
  let flag: string | undefined;
  let mode: number | undefined;
  let throws = true;
  let includeComments = false;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding ?? encoding;
    replacer = options.replacer;
    spaces = options.spaces;
    flag = options.flag;
    mode = options.mode;
    includeComments = options.includeComments ?? includeComments;
    if (options.throws !== undefined) {
      throws = options.throws;
    }
  }

  try {
    // Validate input object
    if (object === undefined) {
      throw new Error("Cannot write undefined as JSON");
    }

    // Check if file is JSONC
    const isJsonc = extname(file).toLowerCase() === ".jsonc";

    // Use Bun's optimized JSON writing if available
    if (isBun) {
      try {
        const jsonString = isJsonc
          ? stringifyJsonc(object, { includeComments, spaces: typeof spaces === "number" ? spaces : 2 })
          : JSON.stringify(object, replacer, spaces);

        if (jsonString === undefined) {
          throw new Error("Failed to stringify JSON object");
        }
        writeFileSync(file, jsonString, { encoding, flag, mode });
        logInternal(`[env] writeJsonSync was successfully executed in Bun (for ${isJsonc ? "JSONC" : "JSON"})`);
        return;
      } catch (error) {
        logInternal(`Bun JSON write failed, falling back to Node.js implementation: ${error}`);
      }
    }

    // For sync operations, we can't use streaming
    const jsonString = isJsonc
      ? stringifyJsonc(object, { includeComments, spaces: typeof spaces === "number" ? spaces : 2 })
      : JSON.stringify(object, replacer, spaces);

    if (jsonString === undefined) {
      throw new Error("Failed to stringify JSON object");
    }
    writeFileSync(file, jsonString, { encoding, flag, mode });
    logInternal(`[env] writeJsonSync was successfully executed in Node.js for ${isJsonc ? "JSONC" : "JSON"}`);
  } catch (err) {
    if (throws) {
      throw err;
    }
    logInternal(`Failed to write ${extname(file).toLowerCase() === ".jsonc" ? "JSONC" : "JSON"} file ${file}: ${err}`);
  }
}

/**
 * Asynchronously writes a JSON file.
 *
 * @param file - The path to the file.
 * @param object - The object to write.
 * @param options - Options for writing the file or stringifying JSON. Can be an encoding string or an object.
 * @returns A promise that resolves when the file has been written.
 */
export async function writeJson(
  file: string,
  object: unknown,
  options?: BufferEncoding | WriteJsonOptions,
): Promise<void> {
  let encoding: BufferEncoding = "utf8";
  let replacer: ((key: string, value: unknown) => unknown) | undefined;
  let spaces: string | number | undefined;
  let flag: string | undefined;
  let mode: number | undefined;
  let throws = true;
  let useStreaming = false;
  let chunkSize = 1024 * 1024; // 1MB default chunk size
  let includeComments = false;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding ?? encoding;
    replacer = options.replacer;
    spaces = options.spaces;
    flag = options.flag;
    mode = options.mode;
    useStreaming = options.useStreaming ?? useStreaming;
    chunkSize = options.chunkSize ?? chunkSize;
    includeComments = options.includeComments ?? includeComments;
    if (options.throws !== undefined) {
      throws = options.throws;
    }
  }

  try {
    // Validate input object
    if (object === undefined) {
      throw new Error("Cannot write undefined as JSON");
    }

    // Check if file is JSONC
    const isJsonc = extname(file).toLowerCase() === ".jsonc";

    // Use Bun's optimized JSON writing if available
    if (isBun) {
      try {
        const fileRef = getFileBun(file);
        const jsonString = isJsonc
          ? stringifyJsonc(object, { includeComments, spaces: typeof spaces === "number" ? spaces : 2 })
          : JSON.stringify(object, replacer, spaces);

        if (jsonString === undefined) {
          throw new Error("Failed to stringify JSON object");
        }
        await Bun.write(fileRef, jsonString);
        logInternal(`[env] writeJson was successfully executed in Bun (for ${isJsonc ? "JSONC" : "JSON"})`);
        return;
      } catch (error) {
        logInternal(`Bun JSON write failed, falling back to Node.js implementation: ${error}`);
      }
    }

    // Use streaming for large objects if enabled
    if (useStreaming) {
      try {
        const writeStream = createWriteStream(file, {
          encoding,
          mode: mode ? Number(mode) : undefined,
          flags: flag,
          highWaterMark: chunkSize, // Use chunkSize for stream buffer size
        });

        const jsonString = isJsonc
          ? stringifyJsonc(object, { includeComments, spaces: typeof spaces === "number" ? spaces : 2 })
          : JSON.stringify(object, replacer, spaces);

        if (jsonString === undefined) {
          throw new Error("Failed to stringify JSON object");
        }

        const transform = new Transform({
          transform(chunk, _encoding, callback) {
            callback(null, chunk);
          },
        });

        transform.write(jsonString);
        transform.end();
        await pipeline(transform, writeStream);
        logInternal(`[env] writeJson was successfully executed using streaming for ${isJsonc ? "JSONC" : "JSON"}`);
        return;
      } catch (streamError) {
        logInternal(`Streaming JSON write failed, falling back to standard implementation: ${streamError}`);
      }
    }

    // Fallback to standard JSON stringify
    const jsonString = isJsonc
      ? stringifyJsonc(object, { includeComments, spaces: typeof spaces === "number" ? spaces : 2 })
      : JSON.stringify(object, replacer, spaces);

    if (jsonString === undefined) {
      throw new Error("Failed to stringify JSON object");
    }

    await writeFile(file, jsonString, { encoding, flag, mode });
    logInternal(`[env] writeJson was successfully executed in Node.js for ${isJsonc ? "JSONC" : "JSON"}`);
  } catch (err) {
    if (throws) {
      throw err;
    }
    logInternal(`Failed to write ${extname(file).toLowerCase() === ".jsonc" ? "JSONC" : "JSON"} file ${file}: ${err}`);
  }
}
