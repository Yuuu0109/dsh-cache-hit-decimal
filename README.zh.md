# dsh-cache-hit-decimal

一个轻量的 DeepSeek Harness Web 插件，将原生整数缓存命中率替换为保留两位小数的显示，例如 `42.86%`。

它覆盖 `conversation.composer.dock` 中已有的 `stats` 单元格，不修改官方 conversation 包。移除插件后，原生整数统计条会自动恢复。

[English](README.md)

## 安装

```sh
dsh plugin --profile web add @yuuu0109/dsh-cache-hit-decimal
```

重启 `dsh web` 进程并刷新浏览器。

## 更新

```sh
dsh plugin --profile web update @yuuu0109/dsh-cache-hit-decimal
```

更新后重启 `dsh web` 并刷新浏览器。如果配置的 npm 镜像尚未同步最新版本，可以改用官方 registry：

```sh
dsh plugin --profile web update @yuuu0109/dsh-cache-hit-decimal --registry=https://registry.npmjs.org/
```

pnpm 11 可能会将发布不足 24 小时的版本延迟更新。需要立即更新时执行：

```sh
dsh plugin --profile web update @yuuu0109/dsh-cache-hit-decimal@0.1.4 --config.minimumReleaseAge=0
```

## 从源码安装

```sh
git clone https://github.com/Yuuu0109/dsh-cache-hit-decimal.git
cd dsh-cache-hit-decimal
pnpm install
pnpm build
dsh plugin --profile web add .
```

## Changelog

### 0.1.4

- 统计条改为单行居中完整显示，不再换行或省略。

### 0.1.3

- 缓存命中率改为保留两位小数。

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
