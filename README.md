# dsh-cache-hit-decimal

A small DeepSeek Harness Web plugin that replaces the native integer cache-hit percentage with a two-decimal value, such as `42.86%`.

It shadows the existing `stats` cell in `conversation.composer.dock` instead of patching the official conversation package. Removing the plugin restores the native integer display.

[中文说明](README.zh.md)

## Install

```sh
dsh plugin --profile web add @yuuu0109/dsh-cache-hit-decimal
```

Restart the `dsh web` process and refresh the browser.

## Update

```sh
dsh plugin --profile web update @yuuu0109/dsh-cache-hit-decimal
```

Restart `dsh web` and refresh the browser. If a configured npm mirror has not synced the latest version yet, use the official registry:

```sh
dsh plugin --profile web update @yuuu0109/dsh-cache-hit-decimal --registry=https://registry.npmjs.org/
```

pnpm 11 may delay newly published versions for 24 hours. To update immediately:

```sh
dsh plugin --profile web update @yuuu0109/dsh-cache-hit-decimal@0.1.4 --config.minimumReleaseAge=0
```

## Install from source

```sh
git clone https://github.com/Yuuu0109/dsh-cache-hit-decimal.git
cd dsh-cache-hit-decimal
pnpm install
pnpm build
dsh plugin --profile web add .
```

## Changelog

### 0.1.4

- Display the full stats line on one centered row without wrapping or an ellipsis.

### 0.1.3

- Display the cache-hit rate with two decimal places.

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
