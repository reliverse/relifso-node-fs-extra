import { readFileSync, createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { parseJsonc, isValidJsonc } from "~/utils/json/regular/jsonc";
import { jsonrepair } from "~/utils/json/regular/jsonrepair";
import { logInternal } from "~/utils/log.js";

import { isBun, getFileBun } from "./bun.js";
import { ensureJsonFileSync } from "./json-utils.js";
import { pathExistsSync } from "./path-exists.js";

export interface ReadJsonOptions {
  encoding?: BufferEncoding | null;
  flag?: string;
  reviver?: (key: string, value: unknown) => unknown;
  throws?: boolean;
  defaultValue?: unknown;
  ensure?: boolean;
  useStreaming?: boolean;
  /**
   * Whether to preserve comments when reading JSONC files
   * @default false
   */
  preserveComments?: boolean;
}

/**
 * Reads a JSON file and then parses it into an object.
 * If the file doesn't exist and ensure is true, creates the file with defaultValue.
 *
 * @param file - The path to the file.
 * @param options - Options for reading the file or parsing JSON. Can be an encoding string or an object.
 * @returns The parsed JSON object.
 */
export function readJsonSync<T = unknown>(file: string, options?: BufferEncoding | ReadJsonOptions): T {
  let encoding: BufferEncoding = "utf8";
  let reviver: ((key: string, value: unknown) => unknown) | undefined;
  let throws = true;
  let defaultValue: unknown = { sync: true };
  let ensure = true;
  let preserveComments = false;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding ?? encoding;
    reviver = options.reviver;
    if (options.throws !== undefined) {
      throws = options.throws;
    }
    if (options.defaultValue !== undefined) {
      defaultValue = options.defaultValue;
    }
    if (options.ensure !== undefined) {
      ensure = options.ensure;
    }
    if (options.preserveComments !== undefined) {
      preserveComments = options.preserveComments;
    }
  }

  try {
    // If file doesn't exist and ensure is true, create it with defaultValue
    if (!pathExistsSync(file) && ensure) {
      ensureJsonFileSync(file, defaultValue);
      return defaultValue as T;
    }

    // Use Bun's optimized JSON reading if available
    if (isBun) {
      try {
        const fileRef = getFileBun(file);
        try {
          const parsed = fileRef.json();
          if (parsed instanceof Promise) {
            throw new Error("Bun's json() returned a Promise in sync context");
          }
          if (parsed === null || typeof parsed !== "object") {
            if (throws) {
              throw new Error("Invalid JSON data: expected an object");
            }
            return defaultValue as T;
          }
          logInternal("[env] readJsonSync was successfully executed in Bun");
          return parsed as T;
        } catch (parseError) {
          if (throws) {
            throw parseError;
          }
          return defaultValue as T;
        }
      } catch (error) {
        // Fall back to Node.js implementation if Bun's fails
        logInternal(`Bun JSON read failed, falling back to Node.js implementation: ${error}`);
      }
    }

    const data = readFileSync(file, { encoding: encoding as BufferEncoding });
    if (!data || !data.trim()) {
      return defaultValue as T;
    }

    // Check if file is JSONC
    const isJsonc = extname(file).toLowerCase() === ".jsonc" || isValidJsonc(data);

    try {
      if (isJsonc) {
        const parsed = parseJsonc(data, { preserveComments, throws });
        if (parsed === null || typeof parsed !== "object") {
          if (throws) {
            throw new Error("Invalid JSONC data: expected an object");
          }
          return defaultValue as T;
        }
        logInternal("[env] readJsonSync was successfully executed for JSONC");
        return parsed as T;
      } else {
        const parsed = JSON.parse(data, reviver);
        if (parsed === null || typeof parsed !== "object") {
          if (throws) {
            throw new Error("Invalid JSON data: expected an object");
          }
          return defaultValue as T;
        }
        logInternal("[env] readJsonSync was successfully executed in Node.js");
        return parsed as T;
      }
    } catch (parseError) {
      // Try to repair malformed JSON before giving up
      try {
        const repaired = jsonrepair(data);
        const parsed = JSON.parse(repaired, reviver);
        if (parsed === null || typeof parsed !== "object") {
          if (throws) {
            throw parseError;
          }
          return defaultValue as T;
        }
        logInternal("[env] readJsonSync was successfully executed after JSON repair");
        return parsed as T;
      } catch (_repairError) {
        if (throws) {
          throw parseError;
        }
        return defaultValue as T;
      }
    }
  } catch (err) {
    if (throws) {
      throw err;
    }
    return defaultValue as T;
  }
}

/**
 * Asynchronously reads a JSON file and then parses it into an object.
 *
 * @param file - The path to the file.
 * @param options - Options for reading the file or parsing JSON. Can be an encoding string or an object.
 * @returns A promise that resolves with the parsed JSON object.
 */
export async function readJson<T = unknown>(file: string, options?: BufferEncoding | ReadJsonOptions): Promise<T> {
  let encoding: BufferEncoding = "utf8";
  let reviver: ((key: string, value: unknown) => unknown) | undefined;
  let throws = true;
  let flag: string | undefined;
  let defaultValue: unknown = {};
  let useStreaming = false;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding ?? encoding;
    reviver = options.reviver;
    flag = options.flag;
    useStreaming = options.useStreaming ?? useStreaming;
    if (options.throws !== undefined) {
      throws = options.throws;
    }
    if (options.defaultValue !== undefined) {
      defaultValue = options.defaultValue;
    }
  }

  try {
    // Use Bun's optimized JSON reading if available
    if (isBun) {
      try {
        const fileRef = getFileBun(file);
        try {
          const parsed = await fileRef.json();
          if (parsed === null || typeof parsed !== "object") {
            if (throws) {
              throw new Error("Invalid JSON data: expected an object");
            }
            return defaultValue as T;
          }
          logInternal("[env] readJson was successfully executed in Bun");
          return parsed as T;
        } catch (parseError) {
          if (throws) {
            throw parseError;
          }
          return defaultValue as T;
        }
      } catch (error) {
        logInternal(`Bun JSON read failed, falling back to Node.js implementation: ${error}`);
      }
    }

    // Use streaming for large files if enabled
    if (useStreaming) {
      try {
        const chunks: string[] = [];
        const transform = new Transform({
          transform(chunk, _encoding, callback) {
            chunks.push(chunk.toString());
            callback();
          },
        });

        const readStream = createReadStream(file, { encoding, flags: flag });
        await pipeline(readStream, transform);

        const data = chunks.join("");
        if (!data || !data.trim()) {
          return defaultValue as T;
        }

        try {
          const parsed = JSON.parse(data, reviver);
          if (parsed === null || typeof parsed !== "object") {
            if (throws) {
              throw new Error("Invalid JSON data: expected an object");
            }
            return defaultValue as T;
          }
          logInternal("[env] readJson was successfully executed using streaming");
          return parsed as T;
        } catch (parseError) {
          // Try to repair malformed JSON before giving up
          try {
            const repaired = jsonrepair(data);
            const parsed = JSON.parse(repaired, reviver);
            if (parsed === null || typeof parsed !== "object") {
              if (throws) {
                throw parseError;
              }
              return defaultValue as T;
            }
            logInternal("[env] readJson was successfully executed after JSON repair using streaming");
            return parsed as T;
          } catch (_repairError) {
            if (throws) {
              throw parseError;
            }
            return defaultValue as T;
          }
        }
      } catch (streamError) {
        logInternal(`Streaming read failed, falling back to standard implementation: ${streamError}`);
      }
    }

    const data = await readFile(file, { encoding: encoding as BufferEncoding, flag });
    if (!data || !data.trim()) {
      return defaultValue as T;
    }

    try {
      const parsed = JSON.parse(data, reviver);
      if (parsed === null || typeof parsed !== "object") {
        if (throws) {
          throw new Error("Invalid JSON data: expected an object");
        }
        return defaultValue as T;
      }
      logInternal("[env] readJson was successfully executed in Node.js");
      return parsed as T;
    } catch (parseError) {
      // Try to repair malformed JSON before giving up
      try {
        const repaired = jsonrepair(data);
        const parsed = JSON.parse(repaired, reviver);
        if (parsed === null || typeof parsed !== "object") {
          if (throws) {
            throw parseError;
          }
          return defaultValue as T;
        }
        logInternal("[env] readJson was successfully executed after JSON repair");
        return parsed as T;
      } catch (_repairError) {
        if (throws) {
          throw parseError;
        }
        return defaultValue as T;
      }
    }
  } catch (err) {
    if (throws) {
      throw err;
    }
    return defaultValue as T;
  }
}
