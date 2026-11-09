/**
 * Error types for the whats-new-widget library.
 */

/** Machine-readable error codes thrown by the library. */
export type WidgetErrorCode =
  | "input_too_large"
  | "invalid_json"
  | "too_many_entries"
  | "invalid_entry"
  | "duplicate_id"
  | "invalid_url"
  | "invalid_options";

/**
 * Base error class for all widget errors.
 * Carries a stable `code` property for programmatic handling.
 */
export class WidgetError extends Error {
  readonly code: WidgetErrorCode;

  constructor(code: WidgetErrorCode, message: string) {
    super(message);
    this.name = "WidgetError";
    this.code = code;
    // Restore prototype chain (necessary when targeting ES5+).
    Object.setPrototypeOf(this, WidgetError.prototype);
  }
}
