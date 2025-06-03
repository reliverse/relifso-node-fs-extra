import { Transform } from "node:stream";

import { JsonStreamError } from "./JsonStreamError.js";

interface ParserOptions {
  chunkSize?: number;
  maxDepth?: number;
  reviver?: (key: string, value: unknown) => unknown;
}

/**
 * Creates a transform stream that parses JSON data chunk by chunk.
 *
 * @param options - Parser options
 * @returns A transform stream that emits parsed JSON objects
 */
export function createJsonStreamParser(options: ParserOptions = {}): Transform {
  const {
    chunkSize = 1024 * 1024, // 1MB default chunk size
    maxDepth = 100,
    reviver,
  } = options;

  let buffer = "";
  let depth = 0;
  let inString = false;
  let escapeNext = false;

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      try {
        const text = chunk.toString();
        buffer += text;

        // Process the buffer in chunks
        while (buffer.length > 0) {
          // Find complete JSON objects
          const start = buffer.indexOf("{");
          if (start === -1) {
            buffer = "";
            break;
          }

          // Skip to the start of the object
          buffer = buffer.slice(start);
          depth = 0;
          inString = false;
          escapeNext = false;

          let end = -1;
          for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];

            if (escapeNext) {
              escapeNext = false;
              continue;
            }

            if (char === "\\") {
              escapeNext = true;
              continue;
            }

            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === "{") {
                depth++;
                if (depth > maxDepth) {
                  throw new JsonStreamError(`Maximum nesting depth of ${maxDepth} exceeded`);
                }
              } else if (char === "}") {
                depth--;
                if (depth === 0) {
                  end = i + 1;
                  break;
                }
              }
            }
          }

          if (end === -1) {
            // No complete object found, keep the buffer for next chunk
            if (buffer.length > chunkSize) {
              throw new JsonStreamError("Chunk size exceeded without finding complete JSON object");
            }
            break;
          }

          // Parse and emit the complete object
          const jsonStr = buffer.slice(0, end);
          try {
            const parsed = JSON.parse(jsonStr, reviver);
            this.push(parsed);
          } catch (error: unknown) {
            const parseError = error as Error;
            throw new JsonStreamError(`Failed to parse JSON: ${parseError.message}`);
          }

          // Remove the processed part from the buffer
          buffer = buffer.slice(end);
        }

        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new JsonStreamError(String(error)));
      }
    },
  });
}
