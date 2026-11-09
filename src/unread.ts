import type { Entry } from "./types.js";

/**
 * Computes the number of unread entries given a sorted entry list and a last-seen ID.
 *
 * @param entries - Entries sorted by date descending, then id ascending (as returned by `parseEntries`).
 * @param lastSeenId - ID of the last seen entry, or `null` to treat all as unread.
 * @returns Number of entries before `lastSeenId` in the sorted order. If `lastSeenId`
 *   is not found, returns the total number of entries.
 */
export function unreadCount(entries: Entry[], lastSeenId: string | null): number {
  if (lastSeenId === null) {
    return entries.length;
  }
  const index = entries.findIndex((entry) => entry.id === lastSeenId);
  if (index === -1) {
    return entries.length;
  }
  return index;
}
