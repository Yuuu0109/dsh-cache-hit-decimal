# dsh-cache-hit-decimal

一个轻量的 DeepSeek Harness Web 插件，将原生整数缓存命中率替换为保留两位小数的显示，例如 `42.86%`。

![缓存命中率](docs/screenshots/cache-hit-decimal.png)

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
dsh plugin --profile web update @yuuu0109/dsh-cache-hit-decimal@0.2.1 --config.minimumReleaseAge=0
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

### 0.2.1

修复在较新 DeepSeek Harness（已在 `0.1.5-rc.1` 上验证）上**整行不显示**的问题，并让「两位小数」这个承诺真正成立。

- **修正模块依赖方向（这导致整行消失）。** `dsh.client.inject` 原本写的是 renderer / session / conversation / **chat** / primitives，但 `conversation.composer.dock` 这个槽位由 `dsh-client-ui-conversation` 声明，`useChat` 是 **conversation** 的标准座位。插件挂在 `chat` 下，而 `chat` 只汇入 `renderer`/`session`/`ui-conversation`，于是槽位永远不会被声明，注册时抛 `slot "conversation.composer.dock" is not declared`，条目激活失败。现在 `inject` 为 `["@deepseek-ai/dsh-client-ui-conversation", "@deepseek-ai/dsh-client-ui-chat"]`。
- **修正 i18n key（原本直接印出裸 key）。** 插件以 `locale: 'chat'` 注册，却读 `stats.llm`、`stats.toolCall`、`stats.ttftAverage`、`stats.tokensPerSecond`、`stats.tokens`。Chat 字典里没有这些 key，而 locale 运行时对未知 key **原样返回 key**，所以行里显示的是 `stats.llm · stats.toolCall`。现在插件自带 `cache-hit-decimal` 命名空间（zh/en），并保留内置字典兜底。
- **两位小数现在真的两位。** `cacheHitPercent` 原本返回 `number`，经 `t('stats.cacheHit', { percent })` 字符串化，`60.00` 被印成 `60`，`42.86%` 也从未出现过。现改为返回格式化文本。
- **绝不把部分命中进位到 `100.00`。** `Math.round(hit / total * 10000) / 100` 会把 99.997% 变成 100.00，与「查看缓存命中率」的初衷相反。已移植官方 `formatCacheHitPercent`：整数二分求精确百分位，并保留「宁可多给几位也不进位到 100」的诚实规则。
- **移除 `@deepseek-ai/dsh-client-ui-primitives` 依赖**，悬浮提示改用原生 `title` 属性。
- **兼容更多组合**：仅有 `tokenUsage` 而缺少 `sessionStats` 投影时也会显示 token 段（0.2.0 会整行不显示）；locale 服务缺失时回退到内置字典。

### 0.2.0

- 适配 DeepSeek Harness `0.1.2-alpha.4`：依赖与 peer 从 `0.1.0-rc.6` 升级到 `0.1.2-alpha.4`。
- 统计条改为通过标准会话 hooks（`useProjection` / `useChat`）读取主机端计算的 `sessionStats` 与 `tokenUsage` 投影，旧版节点折叠逻辑保留为兜底。
- 槽位注册适配当前 list-slot 契约（`id`/`order`/`priority`，`locale: 'chat'`）；仍以 `priority: -1` 覆盖原生 `stats` 单元格，移除插件后恢复整数显示。

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

兼容版本固定为 DeepSeek Harness `0.1.5-rc.1`（客户端包 `0.1.5-rc.2`）与 React 18。

本仓库是独立社区插件，不属于 DeepSeek Harness 官方仓库。
