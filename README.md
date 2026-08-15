# dsh-cache-hit-decimal

A small DeepSeek Harness Web plugin that replaces the native integer cache-hit percentage with a one-decimal value, such as `42.9%`.

It shadows the existing `stats` cell in `conversation.composer.dock` instead of patching the official conversation package. Removing the plugin restores the native integer display.

## Install

```sh
dsh plugin --profile web add @yuuu0109/dsh-cache-hit-decimal
```

Restart the `dsh web` process and refresh the browser.

## Install from source

```sh
git clone https://github.com/Yuuu0109/dsh-cache-hit-decimal.git
cd dsh-cache-hit-decimal
pnpm install
pnpm build
dsh plugin --profile web add .
```

## Uninstall

```sh
dsh plugin --profile web remove @yuuu0109/dsh-cache-hit-decimal
```

Restart `dsh web`. The native integer `StatsLine` becomes the active slot occupant again.

## Development

```sh
pnpm typecheck
pnpm test
pnpm build
```

Compatibility is pinned to DeepSeek Harness `0.1.0-rc.6` and React 18.

This is an independent community plugin and is not part of the official DeepSeek Harness repository.
