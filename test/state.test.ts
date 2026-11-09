import { describe, expect, it, vi } from "vitest";
import type { Entry, StorageLike } from "../src/index.js";
import { createWidgetState } from "../src/index.js";

function createMemoryStorage(
  initial: Record<string, string> = {},
): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem(key: string) {
      return data[key] ?? null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
}

describe("createWidgetState", () => {
  it("uses default key and returns null initially", () => {
    const storage = createMemoryStorage();
    const state = createWidgetState(storage);
    expect(state.getLastSeen()).toBeNull();
  });

  it("respects custom key", () => {
    const storage = createMemoryStorage({ custom: "e5" });
    const state = createWidgetState(storage, { key: "custom" });
    expect(state.getLastSeen()).toBe("e5");
  });

  it("markAllRead stores the newest entry id", () => {
    const storage = createMemoryStorage();
    const state = createWidgetState(storage);
    const entries: Entry[] = [
      { id: "e3", date: "2026-11-08", title: "", body: "" },
      { id: "e2", date: "2026-11-01", title: "", body: "" },
    ];
    state.markAllRead(entries);
    expect(storage.data["whats-new:last-seen"]).toBe("e3");
  });

  it("does nothing when entries is empty", () => {
    const storage = createMemoryStorage();
    const state = createWidgetState(storage);
    state.markAllRead([]);
    expect(storage.data).toEqual({});
  });

  it("reports storage error on getItem and returns null", () => {
    const onEvent = vi.fn();
    const storage: StorageLike = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {},
    };
    const state = createWidgetState(storage, { onEvent });
    expect(state.getLastSeen()).toBeNull();
    expect(onEvent).toHaveBeenCalledWith({ type: "storage_error", op: "get" });
  });

  it("reports storage error on setItem and does not throw", () => {
    const onEvent = vi.fn();
    const storage: StorageLike = {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error("denied");
      },
    };
    const state = createWidgetState(storage, { onEvent });
    const entries: Entry[] = [{ id: "e1", date: "2026-01-01", title: "", body: "" }];
    expect(() => state.markAllRead(entries)).not.toThrow();
    expect(onEvent).toHaveBeenCalledWith({ type: "storage_error", op: "set" });
  });
});
