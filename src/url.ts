/**
 * Shared URL validation helpers.
 */

/**
 * Checks that a URL is absolute and uses http: or https:.
 * Parsing happens before the scheme check, so inputs like `javascript:alert(1)`
 * are rejected.
 */
export function isAbsoluteHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
