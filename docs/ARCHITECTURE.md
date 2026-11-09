# Architecture

## Overview

The `whats-new-widget` library provides four pure functions and a state manager, all implemented in TypeScript with strict typing and zero runtime dependencies.

## Modules

- `src/types.ts`: shared TypeScript interfaces.
- `src/errors.ts`: `WidgetError` class with machine-readable codes.
- `src/parse.ts`: JSON parsing, validation, and sorting.
- `src/unread.ts`: unread count calculation.
- `src/render.ts`: HTML generation with thorough escaping.
- `src/state.ts`: storage-backed last-seen ID management.
- `src/index.ts`: public exports.

## Design decisions

1. **Validation before use**: `parseEntries` enforces byte and entry limits, validates all fields, and detects duplicates before sorting. This prevents malformed data from reaching rendering or state logic.
2. **Deterministic ordering**: Entries are sorted by date descending then ID ascending. This stable order simplifies unread counting and rendering.
3. **Pure rendering**: `renderWidget` has no side effects and produces a single-line HTML string. All text and attribute values are escaped; no inline styles or scripts are emitted, ensuring CSP compatibility.
4. **Safe storage handling**: `createWidgetState` never throws on storage errors; it reports them via an optional callback, allowing callers to handle failures gracefully (e.g., Safari private mode).

## Extensibility

- Additional entry fields can be added by extending the `Entry` interface and updating validation/render logic.
- Custom storage backends (e.g., in-memory for SSR) can implement `StorageLike`.
