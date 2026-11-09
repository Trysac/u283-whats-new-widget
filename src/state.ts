import type { Entry, StateOptions, StorageLike, WidgetEvent } from "./types.js";

const DEFAULT_KEY = "whats-new:last-seen";

/**
 * Creates a state object that persists the last-seen entry ID using the provided storage.
 *
 * @param storage - An object with `getItem` and `setItem` methods.
 * @param opts - Optional configuration.
 * @returns An object with `getLastSeen` and `markAllRead` methods.
 *
 * Storage failures are caught and reported via `opts.onEvent`; they never throw.
 */
export function createWidgetState(
  storage: StorageLike,
  opts: StateOptions = {},
): {
  getLastSeen(): string | null;
  markAllRead(entries: Entry[]): void;
} {
  const key = opts.key ?? DEFAULT_KEY;
  const onEvent = opts.onEvent;

  function reportEvent(e: WidgetEvent): void {
    if (onEvent) {
      onEvent(e);
    }
  }

  return {
    /**
     * Retrieves the stored last-seen ID. Returns `null` if missing or on error.
     */
    getLastSeen(): string | null {
      try {
        return storage.getItem(key);
      } catch {
        reportEvent({ type: "storage_error", op: "get" });
        return null;
      }
    },

    /**
     * Marks all given entries as read by storing the newest entry's ID.
     * Does nothing if `entries` is empty. Never throws on storage errors.
     */
    markAllRead(entries: Entry[]): void {
      // entries are sorted descending, so the first is the newest
      const latest = entries[0];
      if (latest === undefined) {
        return;
      }
      const latestId = latest.id;
      try {
        storage.setItem(key, latestId);
      } catch {
        reportEvent({ type: "storage_error", op: "set" });
      }
    },
  };
}
