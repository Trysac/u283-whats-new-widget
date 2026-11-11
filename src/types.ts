/**
 * Core types for the whats-new-widget library.
 */

/** A single validated changelog entry. */
export interface Entry {
  /** Unique identifier matching /^[A-Za-z0-9_-]{1,64}$/. */
  id: string;
  /** Calendar date in YYYY-MM-DD format. */
  date: string;
  /** Entry title, 1-200 characters. */
  title: string;
  /** Entry body, up to 5000 characters. */
  body: string;
  /** Optional absolute HTTP(S) URL. */
  url?: string;
  /** Optional list of up to 10 tags, each 1-32 characters. */
  tags?: string[];
}

/**
 * Minimal storage interface compatible with `window.localStorage`.
 * Implementations must not throw on normal operation; if they do,
 * the widget state handles the error gracefully.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Event emitted when a storage operation fails.
 */
export interface WidgetEvent {
  type: "storage_error";
  op: "get" | "set";
}

/** Options accepted by {@link parseEntries}. */
export interface ParseOptions {
  /** Maximum UTF-8 byte length of the input JSON. Default: 262144. */
  maxBytes?: number;
  /** Maximum number of entries after parsing. Default: 200. */
  maxEntries?: number;
}

/** Options accepted by {@link renderWidget}. */
export interface RenderOptions {
  /** ID of the last seen entry; null or unknown means all entries are unread. */
  lastSeenId: string | null;
  /** Maximum number of entries to render. Must be positive integer if provided. */
  maxItems?: number;
  /** Custom heading text. Escaped in output. Default: "What's new". */
  heading?: string;
}

/** Options accepted by {@link createWidgetState}. */
export interface StateOptions {
  /** Storage key. Default: "whats-new:last-seen". */
  key?: string;
  /** Callback invoked on storage errors. */
  onEvent?: (e: WidgetEvent) => void;
}
