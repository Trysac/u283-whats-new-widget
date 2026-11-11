import { WidgetError } from "./errors.js";
import type { Entry, RenderOptions } from "./types.js";
import { unreadCount } from "./unread.js";
import { isAbsoluteHttpUrl } from "./url.js";

/**
 * Escapes a string for safe inclusion in HTML text or attribute values.
 * Escapes &, <, >, ", and '.
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

/**
 * Escapes a value for an HTML attribute (double-quoted).
 * Equivalent to escapeHtml but retained for clarity.
 */
function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

/**
 * Renders entry tags as spans.
 */
function renderTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) {
    return "";
  }
  return tags.map((tag) => ` <span class="wn-tag">${escapeHtml(tag)}</span>`).join("");
}

/**
 * Renders entry body: splits on blank lines into paragraphs, converts single
 * newlines to <br>, and escapes all text.
 */
function renderBody(body: string): string {
  const paragraphs = body.split(/\n\s*\n/);
  return paragraphs
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph);
      const withBreaks = escaped.replace(/\n/g, "<br>");
      return `<p>${withBreaks}</p>`;
    })
    .join("");
}

/**
 * Renders a single entry as an <li> element.
 */
function renderEntry(entry: Entry, isUnread: boolean): string {
  const time = `<time datetime="${escapeAttribute(entry.date)}">${escapeHtml(entry.date)}</time>`;
  let title: string;
  if (entry.url !== undefined) {
    // Re-validate at render time: entries may bypass `parseEntries`.
    if (typeof entry.url !== "string" || !isAbsoluteHttpUrl(entry.url)) {
      throw new WidgetError("invalid_url", "url must be an absolute http(s) URL");
    }
    title = `<a href="${escapeAttribute(entry.url)}">${escapeHtml(entry.title)}</a>`;
  } else {
    title = `<strong>${escapeHtml(entry.title)}</strong>`;
  }
  const tags = renderTags(entry.tags);
  const body = renderBody(entry.body);
  const classAttr = isUnread ? 'class="wn-item wn-unread"' : 'class="wn-item"';
  return `<li ${classAttr}>${time} ${title}${tags}${body}</li>`;
}

/**
 * Renders an accessible, escaped HTML widget for the given entries.
 *
 * @param entries - Sorted entries (as returned by `parseEntries`).
 * @param opts - Rendering options.
 * @returns A single-line HTML string with no inline styles or scripts.
 * @throws {WidgetError} with code `invalid_options` if `maxItems` is invalid, or
 *   `invalid_url` if an entry URL is not an absolute http(s) URL.
 */
export function renderWidget(entries: Entry[], opts: RenderOptions): string {
  // Validate options
  if (opts.lastSeenId !== null && typeof opts.lastSeenId !== "string") {
    throw new WidgetError("invalid_options", "lastSeenId must be a string or null");
  }
  const maxItems = opts.maxItems;
  if (maxItems !== undefined) {
    if (!Number.isInteger(maxItems) || maxItems <= 0) {
      throw new WidgetError("invalid_options", "maxItems must be a positive integer");
    }
  }

  const heading = opts.heading ?? "What's new";
  const totalUnread = unreadCount(entries, opts.lastSeenId);
  const renderedEntries = maxItems !== undefined ? entries.slice(0, maxItems) : entries;

  // Build badge
  let badge = "";
  if (totalUnread > 0) {
    const label = totalUnread === 1 ? "1 new update" : `${totalUnread} new updates`;
    badge = ` <span class="wn-badge" aria-label="${escapeAttribute(label)}">${totalUnread}</span>`;
  }

  // Determine unread status for each rendered entry
  let lastSeenIndex = -1;
  if (opts.lastSeenId !== null) {
    lastSeenIndex = entries.findIndex((e) => e.id === opts.lastSeenId);
  }
  const listItems = renderedEntries.map((entry, idx) => {
    // idx corresponds to the entry's index in the original array because we slice from 0
    const isUnread = opts.lastSeenId === null || lastSeenIndex === -1 || idx < lastSeenIndex;
    return renderEntry(entry, isUnread);
  });

  const listHtml = listItems.length > 0 ? `<ul class="wn-list">${listItems.join("")}</ul>` : "";

  return (
    `<section class="wn" aria-labelledby="wn-title">` +
    `<h2 id="wn-title">${escapeHtml(heading)}${badge}</h2>` +
    listHtml +
    `</section>`
  );
}
