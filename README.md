# whats-new-widget

[![npm version](https://img.shields.io/npm/v/@trysac/whats-new-widget.svg)](https://www.npmjs.com/package/@trysac/whats-new-widget)
[![license: MIT](https://img.shields.io/npm/l/@trysac/whats-new-widget.svg)](LICENSE)
[![CI](https://github.com/Trysac/u283-whats-new-widget/actions/workflows/ci.yml/badge.svg)](https://github.com/Trysac/u283-whats-new-widget/actions/workflows/ci.yml)

Framework-free core of an embeddable whats-new widget: validated changelog entries, unread counts from a stored last-seen id, and escaped accessible HTML

## Problem

Describe in two or three sentences the concrete problem this utility solves, who hits it, and why existing
packages do not solve it well. Keep it factual; link to an issue or decision record when there is one.

## Install

```sh
npm install @trysac/whats-new-widget
```

Requires Node.js 20 or newer. The package ships ES modules with TypeScript declarations.

## Usage

```ts
import { greet } from "@trysac/whats-new-widget";

// Build a greeting; surrounding whitespace is ignored.
const message = greet("  Ada ");
console.log(message); // "Hello, Ada!"

try {
  greet("   ");
} catch (error) {
  console.error((error as Error).message); // "name must not be empty"
}
```

## API

| Export | Signature | Description |
|---|---|---|
| `greet` | `(name: string) => string` | Placeholder API; replace it with the real one. |

## Development

```sh
npm install
npm run check   # lint, format, types, tests with coverage, docs, secrets
```

See [AGENTS.md](AGENTS.md) for the full command list and [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

## License

[MIT](LICENSE) © 2026 Miguel Gomez
