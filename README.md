# @trysac/whats-new-widget

[![CI](https://github.com/Trysac/u283-whats-new-widget/workflows/CI/badge.svg)](https://github.com/Trysac/u283-whats-new-widget/actions)
[![npm version](https://badge.fury.io/js/@trysac%2Fwhats-new-widget.svg)](https://badge.fury.io/js/@trysac%2Fwhats-new-widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Framework-free core for an embeddable "what's new" widget: validated changelog entries, unread counts from a stored last-seen ID, and escaped accessible HTML. Works in browsers and Node.js; the host page mounts the returned string.

## Installation

```bash
npm install @trysac/whats-new-widget
```

## Quick usage

```typescript
import { parseEntries, renderWidget, createWidgetState } from '@trysac/whats-new-widget';

const json = '[{"id":"e3","date":"2026-11-08","title":"Dark mode","body":"Toggle it in settings."}]';
const entries = parseEntries(json);
const storage = window.localStorage;
const state = createWidgetState(storage);
const html = renderWidget(entries, { lastSeenId: state.getLastSeen() });
document.querySelector('#widget')!.innerHTML = html;
state.markAllRead(entries);
```

See [docs](./docs/) for full API, architecture, and security notes.

## Features

- Zero runtime dependencies
- Strict validation of entry data (IDs, dates, URLs, lengths)
- Automatic sorting (date desc, id asc)
- Unread count based on stored last-seen ID
- Secure HTML rendering: all text escaped, no inline styles or scripts (CSP-friendly)
- Storage failure handling (Safari private mode, blocked cookies)

## API

- `parseEntries(json, opts?)`: parse and validate entries.
- `unreadCount(entries, lastSeenId)`: count unread entries.
- `renderWidget(entries, opts)`: render accessible HTML string.
- `createWidgetState(storage, opts?)`: manage last-seen ID.
- `WidgetError`: typed error with `.code` property.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [Project](docs/PROJECT.md)
- [Stack](docs/STACK.md)

## License

MIT © Trysac
