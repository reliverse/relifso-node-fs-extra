import { JsonSchemaError } from "~/utils/json/helpers/JsonSchemaError.js";

/**
 * JSON Schema type definition
 */
export interface JSONSchema {
  type?: "string" | "number" | "boolean" | "object" | "array" | "null";
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  minItems?: number;
  maxItems?: number;
  minProperties?: number;
  maxProperties?: number;
}

/**
 * Validates a JSON value against a JSON Schema.
 *
 * @param value - The value to validate
 * @param schema - The JSON Schema to validate against
 * @returns true if valid, throws JsonSchemaError if invalid
 * @throws {JsonSchemaError} If validation fails
 */
export function validateJson(value: unknown, schema: JSONSchema): boolean {
  // Basic type validation
  if (schema.type) {
    const type = typeof value;
    if (schema.type === "array" && !Array.isArray(value)) {
      throw new JsonSchemaError(`Expected array, got ${type}`);
    }
    if (schema.type === "object" && (type !== "object" || value === null || Array.isArray(value))) {
      throw new JsonSchemaError(`Expected object, got ${type}`);
    }
    if (schema.type === "string" && type !== "string") {
      throw new JsonSchemaError(`Expected string, got ${type}`);
    }
    if (schema.type === "number" && type !== "number") {
      throw new JsonSchemaError(`Expected number, got ${type}`);
    }
    if (schema.type === "boolean" && type !== "boolean") {
      throw new JsonSchemaError(`Expected boolean, got ${type}`);
    }
  }

  // Array validation
  if (Array.isArray(value)) {
    if (schema.items) {
      for (const item of value) {
        validateJson(item, schema.items);
      }
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      throw new JsonSchemaError(`Array must have at least ${schema.minItems} items`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      throw new JsonSchemaError(`Array must have at most ${schema.maxItems} items`);
    }
  }

  // Object validation
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          validateJson((value as Record<string, unknown>)[key], propSchema);
        } else if (schema.required?.includes(key)) {
          throw new JsonSchemaError(`Missing required property: ${key}`);
        }
      }
    }
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) {
      throw new JsonSchemaError(`Object must have at least ${schema.minProperties} properties`);
    }
    if (schema.maxProperties !== undefined && Object.keys(value).length > schema.maxProperties) {
      throw new JsonSchemaError(`Object must have at most ${schema.maxProperties} properties`);
    }
  }

  return true;
}
