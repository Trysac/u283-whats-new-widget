# Project

## Purpose

Provide a lightweight, secure core for an in-app "what's new" widget, avoiding the overhead and tracking of hosted changelog services.

## Non-goals

- Fetching or updating the changelog feed
- Open/close UI behavior
- Animations or styling (sample CSS can be added separately)
- Analytics

## Factory run u283 (measured from API usage)

| Phase | Model | Batch | Input | Output | Cache write | Cache read | Cost (USD) |
|---|---|---|---|---|---|---|---|
| generation | deepseek-v4-pro | yes | 1519 | 17703 | 0 | 3584 | 0.0361 |
| fix-1 | deepseek-flash | no | 19749 | 6858 | 0 | 250624 | 0.0078 |
| fix-2 | deepseek-flash | no | 8092 | 383 | 0 | 22528 | 0.0015 |
| fix-3 | deepseek-flash | no | 15958 | 7988 | 0 | 181888 | 0.0077 |
| audit | deepseek-flash | no | 39384 | 22259 | 0 | 773248 | 0.0216 |
| fix-4 | deepseek-flash | no | 9422 | 3087 | 0 | 64896 | 0.0035 |

Total: $0.0782. Prices: deepseek line, as measured by its adapter.
