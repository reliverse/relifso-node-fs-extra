import { Transform } from "node:stream";

import { JsonStreamError } from "./JsonStreamError.js";

interface JsonlOptions {
  chunkSize?: number;
  reviver?: (key: string, value: unknown) => unknown;
  replacer?: (key: string, value: unknown) => unknown | (number | string)[] | null;
}

/**
 * Creates a transform stream that parses JSONL (JSON Lines) data.
 *
 * @param options - Parser options
 * @returns A transform stream that emits parsed JSON objects
 */
export function createJsonlParser(options: JsonlOptions = {}): Transform {
  const {
    chunkSize = 1024 * 1024, // 1MB default chunk size
    reviver,
  } = options;

  let buffer = "";

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      try {
        const text = chunk.toString();
        buffer += text;

        // Process the buffer line by line
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line, reviver);
              this.push(parsed);
            } catch (error: unknown) {
              const parseError = error as Error;
              throw new JsonStreamError(`Failed to parse JSONL line: ${parseError.message}`);
            }
          }
        }

        // Check if buffer is too large
        if (buffer.length > chunkSize) {
          throw new JsonStreamError("Chunk size exceeded without finding complete JSONL line");
        }

        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new JsonStreamError(String(error)));
      }
    },
  });
}

/**
 * Creates a transform stream that writes JSONL (JSON Lines) data.
 *
 * @param options - Writer options
 * @returns A transform stream that accepts objects and outputs JSONL strings
 */
export function createJsonlWriter(options: JsonlOptions = {}): Transform {
  const { replacer } = options;

  return new Transform({
    transform(chunk: unknown, _encoding, callback) {
      try {
        // Convert the chunk to JSON string
        const jsonStr = JSON.stringify(chunk, replacer);
        if (jsonStr === undefined) {
          throw new JsonStreamError("Failed to stringify JSON object");
        }

        // Add newline and emit
        this.push(`${jsonStr}\n`);
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new JsonStreamError(String(error)));
      }
    },
  });
}
