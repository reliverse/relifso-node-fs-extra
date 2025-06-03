import { readFileSync as nodeReadFileSync } from "node:fs";
import { createReadStream } from "node:fs";
import { readFile as nodeReadFileAsync } from "node:fs/promises";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { jsonrepair } from "~/utils/json/regular/jsonrepair";
import { logInternal } from "~/utils/log.js";

import { isBun, getFileBun } from "./bun.js";

export interface ReadFileOptions {
  encoding?: BufferEncoding | null;
  flag?: string;
  isJson?: boolean;
  useStreaming?: boolean;
  reviver?: (key: string, value: unknown) => unknown;
}

/**
 * Synchronously reads the entire contents of a file.
 *
 * @param path - The path to the file.
 * @param options - Options for reading the file. Can be an encoding string or an object.
 * @returns The contents of the file as a string.
 */
export function readFileSync(path: string, options?: BufferEncoding | ReadFileOptions): string;
export function readFileSync(path: string, encoding: BufferEncoding): string;
export function readFileSync(path: string, options: { encoding: BufferEncoding }): string;
export function readFileSync(path: string, options?: BufferEncoding | ReadFileOptions): string {
  let encoding: BufferEncoding | null | undefined;
  let flag: string | undefined;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding;
    flag = options.flag;
  }

  // Use Bun's optimized file reading if available
  if (isBun) {
    try {
      const file = getFileBun(path);

      // For text files
      if (encoding) {
        try {
          const text = file.text();
          if (text instanceof Promise) {
            throw new Error("Bun's text() returned a Promise in sync context");
          }
          logInternal("[env] readFileSync was successfully executed in Bun");
          return text;
        } catch (_error) {
          // If text() fails, try reading as binary and converting
          const buffer = file.arrayBuffer();
          if (buffer instanceof Promise) {
            throw new Error("Bun's arrayBuffer() returned a Promise in sync context");
          }
          logInternal("[env] readFileSync was successfully executed in Bun");
          return Buffer.from(buffer).toString(encoding);
        }
      }

      // For binary files
      try {
        const buffer = file.arrayBuffer();
        if (buffer instanceof Promise) {
          throw new Error("Bun's arrayBuffer() returned a Promise in sync context");
        }
        logInternal("[env] readFileSync was successfully executed in Bun");
        return Buffer.from(buffer).toString(encoding || "utf8");
      } catch (_error) {
        // If arrayBuffer() fails, try reading as text and converting
        const text = file.text();
        if (text instanceof Promise) {
          throw new Error("Bun's text() returned a Promise in sync context");
        }
        logInternal("[env] readFileSync was successfully executed in Bun");
        return text;
      }
    } catch (error) {
      // Fall back to Node.js implementation if Bun's fails
      logInternal(`Bun read failed, falling back to Node.js implementation: ${error}`);
    }
  }

  // Node.js implementation
  if (encoding) {
    logInternal("[env] readFileSync was successfully executed in Node.js");
    return nodeReadFileSync(path, { encoding: encoding as BufferEncoding, flag });
  }
  logInternal("[env] readFileSync was successfully executed in Node.js");
  return nodeReadFileSync(path, { encoding: "utf8", flag });
}

/**
 * Asynchronously reads the entire contents of a file.
 *
 * @param path - The path to the file.
 * @param options - Options for reading the file. Can be an encoding string or an object.
 * @returns A promise that resolves with the contents of the file as a string.
 */
export async function readFile(path: string, options?: BufferEncoding | ReadFileOptions): Promise<string>;
export async function readFile(path: string, encoding: BufferEncoding): Promise<string>;
export async function readFile(path: string, options: { encoding: BufferEncoding }): Promise<string>;
export async function readFile(path: string, options?: BufferEncoding | ReadFileOptions): Promise<string> {
  let encoding: BufferEncoding | null | undefined;
  let flag: string | undefined;
  let isJson = false;
  let useStreaming = false;
  let reviver: ((key: string, value: unknown) => unknown) | undefined;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding;
    flag = options.flag;
    isJson = options.isJson ?? isJson;
    useStreaming = options.useStreaming ?? useStreaming;
    reviver = options.reviver;
  }

  // Use Bun's optimized file reading if available
  if (isBun) {
    try {
      const file = getFileBun(path);

      // For text files
      if (encoding) {
        try {
          const result = await file.text();
          logInternal("[env] readFile was successfully executed in Bun");
          if (isJson) {
            try {
              return JSON.stringify(JSON.parse(result, reviver));
            } catch (_parseError) {
              // Try to repair malformed JSON
              const repaired = jsonrepair(result);
              return JSON.stringify(JSON.parse(repaired, reviver));
            }
          }
          return result;
        } catch (_error) {
          // If text() fails, try reading as binary and converting
          const buffer = await file.arrayBuffer();
          logInternal("[env] readFile was successfully executed in Bun");
          const text = Buffer.from(buffer).toString(encoding);
          if (isJson) {
            try {
              return JSON.stringify(JSON.parse(text, reviver));
            } catch (_parseError) {
              // Try to repair malformed JSON
              const repaired = jsonrepair(text);
              return JSON.stringify(JSON.parse(repaired, reviver));
            }
          }
          return text;
        }
      }

      // For binary files
      try {
        const buffer = await file.arrayBuffer();
        logInternal("[env] readFile was successfully executed in Bun");
        const text = Buffer.from(buffer).toString(encoding || "utf8");
        if (isJson) {
          try {
            return JSON.stringify(JSON.parse(text, reviver));
          } catch (_parseError) {
            // Try to repair malformed JSON
            const repaired = jsonrepair(text);
            return JSON.stringify(JSON.parse(repaired, reviver));
          }
        }
        return text;
      } catch (_error) {
        // If arrayBuffer() fails, try reading as text and converting
        const text = await file.text();
        logInternal("[env] readFile was successfully executed in Bun");
        if (isJson) {
          try {
            return JSON.stringify(JSON.parse(text, reviver));
          } catch (_parseError) {
            // Try to repair malformed JSON
            const repaired = jsonrepair(text);
            return JSON.stringify(JSON.parse(repaired, reviver));
          }
        }
        return text;
      }
    } catch (error) {
      // Fall back to Node.js implementation if Bun's fails
      logInternal(`Bun read failed, falling back to Node.js implementation: ${error}`);
    }
  }

  // Use streaming for large files if enabled
  if (useStreaming && encoding) {
    try {
      const chunks: string[] = [];
      const transform = new Transform({
        transform(chunk, _encoding, callback) {
          chunks.push(chunk.toString());
          callback();
        },
      });

      const readStream = createReadStream(path, { encoding: encoding as BufferEncoding, flags: flag });
      await pipeline(readStream, transform);

      const text = chunks.join("");
      if (isJson) {
        try {
          return JSON.stringify(JSON.parse(text, reviver));
        } catch (_parseError) {
          // Try to repair malformed JSON
          const repaired = jsonrepair(text);
          return JSON.stringify(JSON.parse(repaired, reviver));
        }
      }
      return text;
    } catch (streamError) {
      logInternal(`Streaming read failed, falling back to standard implementation: ${streamError}`);
    }
  }

  // Node.js implementation
  if (encoding) {
    logInternal("[env] readFile was successfully executed in Node.js");
    const text = (await nodeReadFileAsync(path, { encoding: encoding as BufferEncoding, flag })) as string;
    if (isJson) {
      try {
        return JSON.stringify(JSON.parse(text, reviver));
      } catch (_parseError) {
        // Try to repair malformed JSON
        const repaired = jsonrepair(text);
        return JSON.stringify(JSON.parse(repaired, reviver));
      }
    }
    return text;
  }
  logInternal("[env] readFile was successfully executed in Node.js");
  return (await nodeReadFileAsync(path, { encoding: "utf8", flag })) as string;
}
