/**
 * Custom error class for JSON Schema validation errors.
 */
export class JsonSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonSchemaError";
  }
}
