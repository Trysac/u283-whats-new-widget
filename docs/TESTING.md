# Testing

## Test tiers

- **Unit tests**: `test/*.test.ts` cover all exported functions, including error paths and edge cases.
- **Conformance tests**: None required for this library.

## Running tests

```bash
npm test
```

This runs Vitest with coverage. Minimum thresholds: 80% for lines, branches, functions, and statements.
