import { createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { logInternal } from "~/utils/log.js";

import type { WriteJsonOptions } from "./write-json.js";

import { ensureJsonFileSync, ensureJsonFile, type JsonUtilsOptions } from "./json-utils.js";

export interface OutputJsonOptions extends WriteJsonOptions {
  useStreaming?: boolean;
}

/**
 * Ensures that the directory for the JSON file exists and then writes the JSON data to the file.
 *
 * @param file - The path to the file.
 * @param data - The JSON data to write.
 * @param options - Options for writing the JSON file (e.g., replacer, spaces).
 */
export function outputJsonSync(file: string, data: unknown, options?: BufferEncoding | OutputJsonOptions): void {
  const jsonOptions: JsonUtilsOptions = typeof options === "string" ? { encoding: options } : (options ?? {});
  ensureJsonFileSync(file, data, jsonOptions);
}

/**
 * Ensures that the directory for the JSON file exists and then asynchronously writes the JSON data to the file.
 *
 * @param file - The path to the file.
 * @param data - The JSON data to write.
 * @param options - Options for writing the JSON file (e.g., replacer, spaces).
 */
export async function outputJson(
  file: string,
  data: unknown,
  options?: BufferEncoding | OutputJsonOptions | JsonUtilsOptions,
): Promise<void> {
  let useStreaming = false;
  let encoding: BufferEncoding = "utf8";
  let replacer: ((key: string, value: unknown) => unknown) | undefined;
  let spaces: string | number | undefined;
  let flag: string | undefined;
  let mode: number | undefined;
  let throws = true;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    // Handle OutputJsonOptions properties
    if ("encoding" in options) {
      encoding = options.encoding ?? encoding;
    }
    if ("replacer" in options) {
      replacer = options.replacer;
    }
    if ("spaces" in options) {
      spaces = options.spaces;
    }
    if ("flag" in options) {
      flag = options.flag;
    }
    if ("mode" in options) {
      mode = options.mode ? Number(options.mode) : undefined;
    }
    if ("useStreaming" in options) {
      useStreaming = options.useStreaming ?? useStreaming;
    }
    if ("throws" in options && options.throws !== undefined) {
      throws = options.throws;
    }
  }

  try {
    // Use streaming for large objects if enabled
    if (useStreaming) {
      try {
        const writeStream = createWriteStream(file, { encoding, mode, flags: flag });
        const jsonString = JSON.stringify(data, replacer, spaces);
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
        logInternal("[env] outputJson was successfully executed using streaming");
        return;
      } catch (streamError) {
        logInternal(`Streaming JSON output failed, falling back to standard implementation: ${streamError}`);
      }
    }

    // Fallback to standard implementation
    await ensureJsonFile(file, data, {
      encoding,
      replacer,
      spaces,
      flag,
      mode,
      throws,
      useStreaming,
    });
  } catch (err) {
    if (throws) {
      throw err;
    }
    logInternal(`Failed to output JSON file ${file}: ${err}`);
  }
}
