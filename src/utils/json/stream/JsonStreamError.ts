/**
 * Custom error class for JSON streaming errors.
 */
export class JsonStreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonStreamError";
  }
}
