import { Transform } from "node:stream";

import { JsonStreamError } from "./JsonStreamError.js";

interface WriterOptions {
  chunkSize?: number;
  replacer?: (key: string, value: unknown) => unknown | (number | string)[] | null;
  spaces?: string | number;
}

/**
 * Creates a transform stream that writes JSON data chunk by chunk.
 *
 * @param options - Writer options
 * @returns A transform stream that accepts objects and outputs JSON strings
 */
export function createJsonStreamWriter(options: WriterOptions = {}): Transform {
  const {
    chunkSize = 1024 * 1024, // 1MB default chunk size
    replacer,
    spaces,
  } = options;

  let isFirst = true;
  let buffer = "";

  return new Transform({
    transform(chunk: unknown, _encoding, callback) {
      try {
        // Convert the chunk to JSON string
        const jsonStr = JSON.stringify(chunk, replacer, spaces);
        if (jsonStr === undefined) {
          throw new JsonStreamError("Failed to stringify JSON object");
        }

        // Add comma if not the first object
        if (!isFirst) {
          buffer += ",";
        }
        isFirst = false;

        // Add the JSON string to the buffer
        buffer += jsonStr;

        // If buffer exceeds chunk size, emit it
        if (buffer.length >= chunkSize) {
          this.push(buffer);
          buffer = "";
        }

        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new JsonStreamError(String(error)));
      }
    },
    flush(callback) {
      try {
        // Emit any remaining data
        if (buffer.length > 0) {
          this.push(buffer);
        }
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new JsonStreamError(String(error)));
      }
    },
  });
}
