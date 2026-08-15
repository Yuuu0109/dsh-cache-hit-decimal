import * as React from 'react'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import {
  billedInputTokens,
  cacheHitPercent,
  deriveStats,
  formatDuration,
  formatTokens,
  formatTokensPerSecond,
  type SessionStatsProjection,
  type TokenUsageProjection,
} from './stats'

const css = ".DChp_root{box-sizing:border-box;width:max-content;max-width:none;padding:4px calc(var(--dsh-composer-side-clearance) + 16px) 0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:clip;margin:0 auto;font-size:12px;line-height:20px;display:flex;flex-wrap:nowrap;justify-content:center;overflow:visible}.DChp_sep{color:var(--dsw-alias-separator-primary);margin:0 10px;flex:none}"
const cssTagId = '@yuuu0109/dsh-cache-hit-decimal/StatsLine.css'

if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css="${cssTagId}"]`) === null) {
  const style = document.createElement('style')
  style.dataset.plugin = '@yuuu0109/dsh-cache-hit-decimal'
  style.dataset.pluginCss = cssTagId
  style.textContent = css
  document.head.appendChild(style)
}

type StatsLineProps = PropsRuntime<'conversation.composer.dock'> & PropsLocale<'conversation'>

function DecimalStatsLineComponent({
  useSession,
  useProjection,
  t,
}: StatsLineProps): React.ReactNode {
  const readProjection = useProjection as unknown as (key: string) => unknown
  const settledNodes = useSession((snapshot) => snapshot.chat.legacy.nodes)
  const usage = readProjection('tokenUsage') as TokenUsageProjection | undefined
  const projected = readProjection('sessionStats') as SessionStatsProjection | undefined
  const stats = React.useMemo(() => projected ?? deriveStats(settledNodes), [projected, settledNodes])

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

  const line = groups.join(' | ')
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [truncated, setTruncated] = React.useState(false)

  React.useLayoutEffect(() => {
    const element = rootRef.current
    if (element === null) return
    const measure = () => setTruncated(element.scrollWidth > element.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [line])

  if (groups.length === 0) return null

  const content = React.createElement('div', {
    ref: rootRef,
    className: 'DChp_root',
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

  return React.createElement(Tooltip, {
    label: line,
    side: 'top',
    delayMs: 500,
    disabled: !truncated,
    children: content,
  })
}

export const DecimalStatsLine = React.memo(DecimalStatsLineComponent)
