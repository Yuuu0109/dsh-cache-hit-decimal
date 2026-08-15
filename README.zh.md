# dsh-cache-hit-decimal

一个轻量的 DeepSeek Harness Web 插件，将原生整数缓存命中率替换为保留一位小数的显示，例如 `42.9%`。

它覆盖 `conversation.composer.dock` 中已有的 `stats` 单元格，不修改官方 conversation 包。移除插件后，原生整数统计条会自动恢复。

## 安装

```sh
dsh plugin --profile web add @yuuu0109/dsh-cache-hit-decimal
```

重启 `dsh web` 进程并刷新浏览器。

## 从源码安装

```sh
git clone https://github.com/Yuuu0109/dsh-cache-hit-decimal.git
cd dsh-cache-hit-decimal
pnpm install
pnpm build
dsh plugin --profile web add .
```

## 卸载

```sh
dsh plugin --profile web remove @yuuu0109/dsh-cache-hit-decimal
```

重启 `dsh web`。原生整数 `StatsLine` 会重新成为当前槽位的显示组件。

## 开发

```sh
pnpm typecheck
pnpm test
pnpm build
```

兼容版本固定为 DeepSeek Harness `0.1.0-rc.6` 与 React 18。

本仓库是独立社区插件，不属于 DeepSeek Harness 官方仓库。
