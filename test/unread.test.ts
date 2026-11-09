import { describe, expect, it } from "vitest";
import type { Entry } from "../src/index.js";
import { unreadCount } from "../src/index.js";

describe("unreadCount", () => {
  const entries: Entry[] = [
    { id: "e3", date: "2026-11-08", title: "", body: "" },
    { id: "e2", date: "2026-11-01", title: "", body: "" },
    { id: "e1", date: "2026-10-15", title: "", body: "" },
  ];

  it("returns 1 when lastSeenId is 'e2'", () => {
    expect(unreadCount(entries, "e2")).toBe(1);
  });

  it("returns 3 when lastSeenId is null", () => {
    expect(unreadCount(entries, null)).toBe(3);
  });

  it("returns 3 for unknown lastSeenId", () => {
    expect(unreadCount(entries, "e9")).toBe(3);
  });
});
