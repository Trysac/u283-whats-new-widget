import { describe, expect, it } from "vitest";
import { parseEntries, WidgetError } from "../src/index.js";

const validEntry = {
  id: "e1",
  date: "2026-10-15",
  title: "Title",
  body: "Body",
};

const validJson = JSON.stringify([validEntry]);

/**
 * Runs `fn` and returns the error it throws, failing the test if it does not throw.
 */
function catchError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (e) {
    return e;
  }
  throw new Error("expected function to throw");
}

describe("parseEntries", () => {
  it("parses valid JSON and returns sorted entries", () => {
    const entries = parseEntries(validJson);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(validEntry);
  });

  it("sorts by date descending then id ascending", () => {
    const json = JSON.stringify([
      { id: "a", date: "2026-10-15", title: "A", body: "" },
      { id: "b", date: "2026-11-01", title: "B", body: "" },
      { id: "c", date: "2026-11-01", title: "C", body: "" },
    ]);
    const entries = parseEntries(json);
    expect(entries.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });

  it("enforces maxBytes default (262144)", () => {
    const largeJson = JSON.stringify([{ ...validEntry, body: "x".repeat(263000) }]);
    expect(() => parseEntries(largeJson)).toThrowError(WidgetError);
    try {
      parseEntries(largeJson);
    } catch (e) {
      expect(e).toBeInstanceOf(WidgetError);
      expect((e as WidgetError).code).toBe("input_too_large");
    }
  });

  it("respects custom maxBytes", () => {
    expect(() => parseEntries(validJson, { maxBytes: 5 })).toThrowError(WidgetError);
  });

  it("throws invalid_options for non-positive maxBytes", () => {
    expect(() => parseEntries(validJson, { maxBytes: 0 })).toThrowError(WidgetError);
  });

  it("enforces maxEntries default (200)", () => {
    const entries = Array.from({ length: 201 }, (_, i) => ({
      id: `id${i}`,
      date: "2026-01-01",
      title: "T",
      body: "",
    }));
    const json = JSON.stringify(entries);
    expect(() => parseEntries(json)).toThrowError(WidgetError);
  });

  it("throws too_many_entries when the default limit is exceeded", () => {
    const entries = Array.from({ length: 201 }, (_, i) => ({
      id: `id${i}`,
      date: "2026-01-01",
      title: "T",
      body: "",
    }));
    try {
      parseEntries(JSON.stringify(entries));
      throw new Error("expected parseEntries to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(WidgetError);
      expect((e as WidgetError).code).toBe("too_many_entries");
    }
  });

  it("respects custom maxEntries", () => {
    const entries = [validEntry, { ...validEntry, id: "e2" }];
    expect(() => parseEntries(JSON.stringify(entries), { maxEntries: 1 })).toThrowError(
      WidgetError,
    );
  });

  it("throws invalid_json for invalid JSON", () => {
    expect(() => parseEntries("not json")).toThrowError(WidgetError);
  });

  it("throws invalid_json for non-array JSON", () => {
    expect(() => parseEntries('{"a":1}')).toThrowError(WidgetError);
  });

  it("throws invalid_entry for missing fields", () => {
    expect(() => parseEntries("[{}]")).toThrowError(WidgetError);
  });

  it("throws invalid_entry for bad id", () => {
    expect(() =>
      parseEntries('[{"id":"invalid id","date":"2026-01-01","title":"T","body":""}]'),
    ).toThrowError(WidgetError);
  });

  it("throws invalid_entry for bad date (2026-02-30)", () => {
    const error = catchError(() =>
      parseEntries('[{"id":"e1","date":"2026-02-30","title":"T","body":""}]'),
    );
    expect(error).toBeInstanceOf(WidgetError);
    expect((error as WidgetError).code).toBe("invalid_entry");
  });

  it("throws invalid_entry for title too long", () => {
    const title = "x".repeat(201);
    const error = catchError(() => parseEntries(JSON.stringify([{ ...validEntry, title }])));
    expect(error).toBeInstanceOf(WidgetError);
    expect((error as WidgetError).code).toBe("invalid_entry");
  });

  it("throws invalid_entry for body too long", () => {
    const body = "x".repeat(5001);
    expect(() => parseEntries(JSON.stringify([{ ...validEntry, body }]))).toThrowError(WidgetError);
  });

  it("throws invalid_url for javascript: URL", () => {
    const error = catchError(() =>
      parseEntries(
        '[{"id":"e1","date":"2026-01-01","title":"T","body":"","url":"javascript:alert(1)"}]',
      ),
    );
    expect(error).toBeInstanceOf(WidgetError);
    expect((error as WidgetError).code).toBe("invalid_url");
  });

  it("throws invalid_entry for too many tags", () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    expect(() => parseEntries(JSON.stringify([{ ...validEntry, tags }]))).toThrowError(WidgetError);
  });

  it("throws invalid_entry for tag too long", () => {
    const tags = ["x".repeat(33)];
    expect(() => parseEntries(JSON.stringify([{ ...validEntry, tags }]))).toThrowError(WidgetError);
  });

  it("throws duplicate_id for duplicate ids", () => {
    const entries = [validEntry, { ...validEntry, date: "2026-10-16" }];
    const error = catchError(() => parseEntries(JSON.stringify(entries)));
    expect(error).toBeInstanceOf(WidgetError);
    expect((error as WidgetError).code).toBe("duplicate_id");
  });
});
