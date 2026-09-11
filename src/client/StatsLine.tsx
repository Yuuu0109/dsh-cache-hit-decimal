import * as React from 'react'
import type { UseProjection } from '@deepseek-ai/dsh-api-session-controller/client'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots'
import type { Translate } from './locale'
import {
  billedInputTokens,
  cacheHitPercent,
  deriveStats,
  formatDuration,
  formatTokens,
  formatTokensPerSecond,
} from './stats'

const css = ".DChp_root{box-sizing:border-box;width:max-content;max-width:none;padding:4px calc(var(--dsh-composer-side-clearance, 0px) + 16px) 0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:clip;margin:0 auto;font-size:12px;line-height:20px;display:flex;flex-wrap:nowrap;justify-content:center;overflow:visible}.DChp_sep{color:var(--dsw-alias-separator-primary, currentColor);opacity:.6;margin:0 10px;flex:none}"
const cssTagId = '@yuuu0109/dsh-cache-hit-decimal/StatsLine.css'

if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css="${cssTagId}"]`) === null) {
  const style = document.createElement('style')
  style.dataset.plugin = '@yuuu0109/dsh-cache-hit-decimal'
  style.dataset.pluginCss = cssTagId
  style.textContent = css
  document.head.appendChild(style)
}

const EMPTY_NODES: readonly unknown[] = []

/**
 * Current seated props: the plugin-owned translator injected by the slot
 * registration, plus the standard session hooks. `useProjection` comes from
 * `dsh-client-ui-session` and `useChat` from `dsh-client-ui-conversation`;
 * both are optional so the line still renders in a composition missing either.
 */
type StatsLineProps = {
  t: Translate
  useChat?: SnapshotSelectorHook<ChatSnapshot>
  useProjection?: UseProjection
}

function DecimalStatsLineComponent({
  useChat,
  useProjection,
  t,
}: StatsLineProps): React.ReactNode {
  const usage = useProjection?.('tokenUsage')
  const projected = useProjection?.('sessionStats')
  const chat: SnapshotSelectorHook<ChatSnapshot> | undefined = useChat
  const nodes = chat !== undefined
    ? chat((snapshot: ChatSnapshot) => snapshot.legacy.nodes)
    : EMPTY_NODES
  const stats = React.useMemo(() => projected ?? deriveStats(nodes), [projected, nodes])

  const groups: string[] = []
  if (stats.steps > 0) {
    groups.push(t('stats.counts', {
      turns: stats.turns,
      steps: stats.steps,
    }))

    const durations: string[] = []
    if (stats.llmMs > 0) durations.push(t('stats.llm', { duration: formatDuration(stats.llmMs) }))
    if (stats.toolMs > 0) durations.push(t('stats.toolCall', { duration: formatDuration(stats.toolMs) }))
    if (durations.length > 0) groups.push(durations.join(' · '))

    const speeds: string[] = []
    if (stats.ttftSteps > 0) {
      speeds.push(t('stats.ttftAverage', { duration: formatDuration(stats.ttftMs / stats.ttftSteps) }))
    }
    if (stats.decodeMs > 0) {
      speeds.push(t('stats.tokensPerSecond', {
        throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1e3)),
      }))
    }
    if (speeds.length > 0) groups.push(speeds.join(' · '))
  }

  if (usage !== undefined && (billedInputTokens(usage) > 0 || usage.outputTokens > 0)) {
    const cacheHit = cacheHitPercent(usage)
    if (cacheHit !== null) groups.push(t('stats.cacheHit', { percent: cacheHit }))
    groups.push(t('stats.tokens', {
      input: formatTokens(billedInputTokens(usage)),
      output: formatTokens(usage.outputTokens),
    }))
  }

  if (groups.length === 0) return null

  const line = groups.join(' | ')

  // The full line rides a native `title` instead of the primitives `Tooltip`:
  // one less cross-package import for identical hover behaviour.
  return React.createElement('div', {
    className: 'DChp_root',
    title: line,
    'data-cache-hit-decimal': '1',
  }, groups.map((group, index) => React.createElement(React.Fragment, {
    key: `${index}-${group}`,
  }, index > 0
    ? React.createElement(React.Fragment, {
        key: `separator-${index}`,
      }, React.createElement('span', {
        className: 'DChp_sep',
        'aria-hidden': true,
      }, '|'), ' ')
    : null, React.createElement('span', null, group))))
}

export const DecimalStatsLine = DecimalStatsLineComponent
