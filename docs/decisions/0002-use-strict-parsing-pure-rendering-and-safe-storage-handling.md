# Use strict parsing, pure rendering, and safe storage handling

Status: accepted (generated, pending human review)

## Context

The library must accept untrusted JSON and render HTML without XSS or DoS vulnerabilities, while handling blocked storage gracefully.

## Decision

Split into modules for validation, unread counting, rendering, and state. Enforce input limits before parsing, escape all output thoroughly, and catch storage errors with an event callback.

## Consequences

The code is modular and testable. Zero runtime dependencies keep the bundle small. Rendering output is deterministic and CSP-friendly. Storage errors are non-fatal.
