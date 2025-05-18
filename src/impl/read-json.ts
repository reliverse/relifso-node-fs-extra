import { readFileSync } from "node:fs";

export interface ReadJsonOptions {
  encoding?: BufferEncoding | null;
  flag?: string;
  reviver?: (key: string, value: unknown) => unknown;
  throws?: boolean;
}

/**
 * Reads a JSON file and then parses it into an object.
 *
 * @param file - The path to the file.
 * @param options - Options for reading the file or parsing JSON. Can be an encoding string or an object.
 * @returns The parsed JSON object.
 */
export function readJsonSync<T = unknown>(file: string, options?: BufferEncoding | ReadJsonOptions): T {
  let encoding: BufferEncoding = "utf8";
  let reviver: ((key: string, value: unknown) => unknown) | undefined;
  let throws = true;

  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding ?? encoding;
    reviver = options.reviver;
    if (options.throws !== undefined) {
      throws = options.throws;
    }
  }

  try {
    const data = readFileSync(file, { encoding: encoding as BufferEncoding });
    return JSON.parse(data, reviver) as T;
  } catch (err) {
    if (throws) {
      throw err;
    }
    return undefined as any as T;
  }
}
