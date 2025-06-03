import { JSONRepairError } from "~/utils/json/helpers/JSONRepairError.js";

import { jsonrepair } from "./jsonrepair.js";

export interface JsoncParseOptions {
  /**
   * Whether to preserve comments in the output
   * @default false
   */
  preserveComments?: boolean;

  /**
   * Whether to throw an error if the JSONC is invalid
   * @default true
   */
  throws?: boolean;
}

export interface JsoncStringifyOptions {
  /**
   * Whether to include comments in the output
   * @default false
   */
  includeComments?: boolean;

  /**
   * Number of spaces to use for indentation
   * @default 2
   */
  spaces?: number;
}

/**
 * Parse a JSONC string into a JavaScript value
 */
export function parseJsonc(text: string, options: JsoncParseOptions = {}): unknown {
  const { throws = true } = options;

  try {
    // First try standard JSON parse
    return JSON.parse(text);
  } catch (_error) {
    // If standard parse fails, try to repair and parse
    try {
      const repaired = jsonrepair(text);
      return JSON.parse(repaired);
    } catch (_error) {
      if (throws) {
        // Since we don't have position information, use -1 to indicate unknown position
        throw new JSONRepairError("Failed to parse JSONC", -1);
      }
      return null;
    }
  }
}

/**
 * Convert a JavaScript value to a JSONC string
 */
export function stringifyJsonc(value: unknown, options: JsoncStringifyOptions = {}): string {
  const { spaces = 2 } = options;

  // For now, we just use standard JSON.stringify since we don't have comment preservation
  // TODO: Implement comment preservation in a future version
  return JSON.stringify(value, null, spaces);
}

/**
 * Check if a string is valid JSONC
 */
export function isValidJsonc(text: string): boolean {
  try {
    parseJsonc(text, { throws: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract comments from a JSONC string
 */
export function extractComments(
  text: string,
): { line: number; column: number; text: string; type: "line" | "block" }[] {
  const comments: { line: number; column: number; text: string; type: "line" | "block" }[] = [];
  let line = 1;
  let column = 0;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (char === "/" && text[i + 1] === "/") {
      // Line comment
      const startColumn = column;
      const startLine = line;
      let commentText = "";
      i += 2;

      while (i < text.length && text[i] !== "\n") {
        commentText += text[i];
        i++;
      }

      comments.push({
        line: startLine,
        column: startColumn,
        text: commentText.trim(),
        type: "line",
      });
    } else if (char === "/" && text[i + 1] === "*") {
      // Block comment
      const startColumn = column;
      const startLine = line;
      let commentText = "";
      i += 2;

      while (i < text.length - 1 && !(text[i] === "*" && text[i + 1] === "/")) {
        if (text[i] === "\n") {
          line++;
          column = 0;
        } else {
          column++;
        }
        commentText += text[i];
        i++;
      }

      if (i < text.length - 1) {
        i += 2; // Skip closing */
      }

      comments.push({
        line: startLine,
        column: startColumn,
        text: commentText.trim(),
        type: "block",
      });
    } else {
      if (char === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
      i++;
    }
  }

  return comments;
}
