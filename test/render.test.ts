import { describe, expect, it } from "vitest";
import type { Entry, RenderOptions } from "../src/index.js";
import { renderWidget, WidgetError } from "../src/index.js";

const entries: Entry[] = [
  { id: "e3", date: "2026-11-08", title: "Dark mode", body: "Toggle it in settings." },
  { id: "e2", date: "2026-11-01", title: "<script>x</script>", body: "a\n\nb" },
  {
    id: "e1",
    date: "2026-10-15",
    title: "Old",
    body: "Old",
    url: "https://example.com/changelog#e3",
  },
];

function entryAt(index: number): Entry {
  const entry = entries[index];
  if (!entry) {
    throw new Error(`missing fixture entry at index ${index}`);
  }
  return entry;
}

describe("renderWidget", () => {
  it("matches exact output for single unread entry with default heading", () => {
    const single = [entryAt(0)];
    const result = renderWidget(single, { lastSeenId: null });
    expect(result).toBe(
      '<section class="wn" aria-labelledby="wn-title"><h2 id="wn-title">What&#39;s new <span class="wn-badge" aria-label="1 new update">1</span></h2><ul class="wn-list"><li class="wn-item wn-unread"><time datetime="2026-11-08">2026-11-08</time> <strong>Dark mode</strong><p>Toggle it in settings.</p></li></ul></section>',
    );
  });

  it("escapes title and renders body paragraphs correctly", () => {
    const result = renderWidget([entryAt(1)], { lastSeenId: null });
    expect(result).toContain("&lt;script&gt;x&lt;/script&gt;");
    expect(result).toContain("<p>a</p><p>b</p>");
  });

  it("renders badge with correct aria-label for 2 unread", () => {
    const result = renderWidget(entries.slice(0, 2), { lastSeenId: null });
    expect(result).toContain('aria-label="2 new updates"');
  });

  it("does not render badge when 0 unread", () => {
    // lastSeenId is the newest entry, so every entry is read
    const result = renderWidget(entries, { lastSeenId: "e3" });
    expect(result).not.toContain("wn-badge");
  });

  it("renders url entry as link with escaped href", () => {
    const result = renderWidget([entryAt(2)], { lastSeenId: null });
    expect(result).toContain('<a href="https://example.com/changelog#e3">Old</a>');
  });

  it("renders tags as spans", () => {
    const tagged = { ...entryAt(0), tags: ["tag1", "tag2"] };
    const result = renderWidget([tagged], { lastSeenId: null });
    expect(result).toContain('<span class="wn-tag">tag1</span>');
    expect(result).toContain('<span class="wn-tag">tag2</span>');
  });

  it("uses custom heading and escapes it", () => {
    const result = renderWidget(entries, { lastSeenId: null, heading: "<b>Hi</b>" });
    expect(result).toContain("&lt;b&gt;Hi&lt;/b&gt;");
  });

  it("escapes attribute values", () => {
    const entry = { ...entryAt(0), url: 'https://example.com/?q="&' };
    const result = renderWidget([entry], { lastSeenId: null });
    expect(result).toContain('<a href="https://example.com/?q=&quot;&amp;">Dark mode</a>');
  });

  it("renders empty list when no entries", () => {
    const result = renderWidget([], { lastSeenId: null });
    expect(result).toBe(
      '<section class="wn" aria-labelledby="wn-title"><h2 id="wn-title">What&#39;s new</h2></section>',
    );
  });

  it("respects maxItems and still counts total unread", () => {
    const result = renderWidget(entries, { lastSeenId: null, maxItems: 2 });
    const liCount = (result.match(/<li /g) || []).length;
    expect(liCount).toBe(2);
    expect(result).toContain('aria-label="3 new updates"'); // total unread is 3
  });

  it("throws invalid_options for maxItems 0", () => {
    let error: unknown;
    try {
      renderWidget(entries, { lastSeenId: null, maxItems: 0 });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(WidgetError);
    expect((error as WidgetError).code).toBe("invalid_options");
  });

  it("throws invalid_url for a non-http(s) url supplied without parseEntries", () => {
    const entry = { ...entryAt(0), url: "javascript:alert(1)" };
    let error: unknown;
    try {
      renderWidget([entry], { lastSeenId: null });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(WidgetError);
    expect((error as WidgetError).code).toBe("invalid_url");
  });

  it("throws invalid_options for maxItems negative", () => {
    expect(() => renderWidget(entries, { lastSeenId: null, maxItems: -1 })).toThrowError(
      WidgetError,
    );
  });

  it("throws invalid_options for non-integer maxItems", () => {
    expect(() => renderWidget(entries, { lastSeenId: null, maxItems: 1.5 })).toThrowError(
      WidgetError,
    );
  });

  it("throws invalid_options for invalid lastSeenId type", () => {
    expect(() =>
      renderWidget(entries, { lastSeenId: 123 } as unknown as RenderOptions),
    ).toThrowError(WidgetError);
  });
});
