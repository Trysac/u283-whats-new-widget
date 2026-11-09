import { WidgetError } from "./errors.js";
import type { Entry, ParseOptions } from "./types.js";
import { isAbsoluteHttpUrl } from "./url.js";

const DEFAULT_MAX_BYTES = 262_144;
const DEFAULT_MAX_ENTRIES = 200;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a date string as a real calendar date in YYYY-MM-DD format.
 */
function isValidDate(dateStr: string): boolean {
  if (!DATE_PATTERN.test(dateStr)) {
    return false;
  }
  // The pattern guarantees the segment layout, so slice positions are safe.
  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(5, 7));
  const day = Number(dateStr.slice(8, 10));
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }
  // month is 1-indexed; passing 0 gives the last day of the previous month
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Type guard and validation for a single entry.
 * Throws WidgetError with appropriate code on failure.
 */
function validateEntry(entry: unknown, seenIds: Set<string>): asserts entry is Entry {
  if (typeof entry !== "object" || entry === null) {
    throw new WidgetError("invalid_entry", "entry must be an object");
  }
  const obj = entry as Record<string, unknown>;

  // id
  if (typeof obj.id !== "string" || !ID_PATTERN.test(obj.id)) {
    throw new WidgetError("invalid_entry", "id must match /^[A-Za-z0-9_-]{1,64}$/");
  }
  if (seenIds.has(obj.id)) {
    throw new WidgetError("duplicate_id", `duplicate id: ${obj.id}`);
  }
  seenIds.add(obj.id);

  // date
  if (typeof obj.date !== "string" || !isValidDate(obj.date)) {
    throw new WidgetError("invalid_entry", "date must be a valid YYYY-MM-DD");
  }

  // title
  if (typeof obj.title !== "string" || obj.title.length < 1 || obj.title.length > 200) {
    throw new WidgetError("invalid_entry", "title must be 1-200 characters");
  }

  // body
  if (typeof obj.body !== "string" || obj.body.length > 5000) {
    throw new WidgetError("invalid_entry", "body must be at most 5000 characters");
  }

  // url (optional)
  if (obj.url !== undefined) {
    if (typeof obj.url !== "string" || !isAbsoluteHttpUrl(obj.url)) {
      throw new WidgetError("invalid_url", "url must be an absolute http(s) URL");
    }
  }

  // tags (optional)
  if (obj.tags !== undefined) {
    if (!Array.isArray(obj.tags) || obj.tags.length > 10) {
      throw new WidgetError("invalid_entry", "tags must be an array of at most 10 strings");
    }
    for (const tag of obj.tags) {
      if (typeof tag !== "string" || tag.length < 1 || tag.length > 32) {
        throw new WidgetError("invalid_entry", "each tag must be 1-32 characters");
      }
    }
  }
}

/**
 * Parses a JSON string into validated, sorted entries.
 *
 * @param json - JSON array of entry objects.
 * @param opts - Optional size and count limits.
 * @returns Sorted entries (date descending, then id ascending).
 * @throws {WidgetError} with code `input_too_large`, `invalid_json`,
 *   `too_many_entries`, `invalid_entry`, `duplicate_id`, `invalid_url`,
 *   or `invalid_options`.
 */
export function parseEntries(json: string, opts: ParseOptions = {}): Entry[] {
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxEntries = opts.maxEntries ?? DEFAULT_MAX_ENTRIES;
  if (maxBytes <= 0) {
    throw new WidgetError("invalid_options", "maxBytes must be positive");
  }
  if (maxEntries <= 0) {
    throw new WidgetError("invalid_options", "maxEntries must be positive");
  }

  // Enforce byte limit
  const bytes = new TextEncoder().encode(json);
  if (bytes.length > maxBytes) {
    throw new WidgetError("input_too_large", `input exceeds ${maxBytes} bytes`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new WidgetError("invalid_json", "input is not valid JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new WidgetError("invalid_json", "JSON must be an array");
  }
  if (parsed.length > maxEntries) {
    throw new WidgetError("too_many_entries", `too many entries (max ${maxEntries})`);
  }

  const seenIds = new Set<string>();
  const entries: Entry[] = [];
  for (const item of parsed) {
    validateEntry(item, seenIds);
    entries.push(item as Entry);
  }

  // Sort: date descending (lexicographic works for ISO dates), then id ascending
  entries.sort((a, b) => {
    if (a.date === b.date) {
      return a.id.localeCompare(b.id);
    }
    return a.date < b.date ? 1 : -1;
  });

  return entries;
}
