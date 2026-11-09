# Security

## Threat model

The library consumes untrusted JSON input and renders it as HTML. It must prevent XSS and DoS vectors.

## Mitigations

- **Input validation**: Strict limits on byte size, entry count, field lengths, and formats.
- **Output escaping**: All text and attribute values are escaped (`& < > " '`), preventing injection of HTML or JavaScript.
- **URL scheme allowlist**: Only `http:` and `https:` URLs are accepted, blocking `javascript:` and other dangerous schemes.
- **No dynamic script/style**: Generated HTML contains no `<script>`, inline event handlers, or `style` attributes, so a strict Content Security Policy remains effective.
- **Resource limits**: Default maximum input size (262,144 bytes) and entry count (200) prevent memory exhaustion.

## Storage

`createWidgetState` uses the provided storage (e.g., `localStorage`). It does not throw on failures and reports them via an event callback, avoiding crashes in private browsing modes.
