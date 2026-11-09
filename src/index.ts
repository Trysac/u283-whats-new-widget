/**
 * Main entry point for @trysac/whats-new-widget.
 * Exports all public APIs.
 */

export { WidgetError, type WidgetErrorCode } from "./errors.js";
export { parseEntries } from "./parse.js";
export { renderWidget } from "./render.js";
export { createWidgetState } from "./state.js";
export type {
  Entry,
  ParseOptions,
  RenderOptions,
  StateOptions,
  StorageLike,
  WidgetEvent,
} from "./types.js";
export { unreadCount } from "./unread.js";
