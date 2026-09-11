import type { SessionStatsProjection } from '@deepseek-ai/dsh-session-stats/types'
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client'

export type { SessionStatsProjection, TokenUsageProjection }

interface UsageReading {
  ttftMs: number | null
  decodeMs: number | null
  outputTokens: number | null
}

function usageOutputTokens(usage: unknown): number | null {
  if (typeof usage !== 'object' || usage === null) return null
  const value = (usage as { outputTokens?: unknown }).outputTokens
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function assistantStepReading(node: unknown): UsageReading {
  const value = node as {
    timing?: {
      stepStartTime: number | null
      firstTokenTime: number | null
      completedTime: number
    }
    usage?: unknown
  }
  const timing = value.timing
  return {
    ttftMs: timing !== undefined && timing.stepStartTime !== null && timing.firstTokenTime !== null
      ? Math.max(0, timing.firstTokenTime - timing.stepStartTime)
      : null,
    decodeMs: timing !== undefined && timing.firstTokenTime !== null
      ? Math.max(0, timing.completedTime - timing.firstTokenTime)
      : null,
    outputTokens: usageOutputTokens(value.usage),
  }
}

/**
 * Fold the legacy window nodes into the same shape as the host-computed
 * `sessionStats` projection, so the two swap wholesale.
 */
export function deriveStats(nodes: readonly unknown[]): SessionStatsProjection {
  const turns = new Set<unknown>()
  let steps = 0
  let llmMs = 0
  let toolMs = 0
  let ttftMs = 0
  let ttftSteps = 0
  let decodeMs = 0
  let decodeTokens = 0

  for (const rawNode of nodes) {
    const node = rawNode as {
      kind?: string
      turn?: unknown
      time?: number
      callTime?: number | null
      timing?: {
        stepStartTime: number | null
        firstTokenTime: number | null
        completedTime: number
      }
      usage?: unknown
    }

    if (node.kind === 'tool-result') {
      if (node.time !== undefined && node.callTime !== null && node.callTime !== undefined) {
        toolMs += Math.max(0, node.time - node.callTime)
      }
      continue
    }

    if (node.kind !== 'assistant' || node.turn === undefined) continue

    turns.add(node.turn)
    steps += 1
    if (node.timing !== undefined && node.timing.stepStartTime !== null) {
      llmMs += Math.max(0, node.timing.completedTime - node.timing.stepStartTime)
    }

    const reading = assistantStepReading(node)
    if (reading.ttftMs !== null) {
      ttftMs += reading.ttftMs
      ttftSteps += 1
    }
    if (reading.decodeMs !== null && reading.outputTokens !== null) {
      decodeMs += reading.decodeMs
      decodeTokens += reading.outputTokens
    }
  }

  return {
    turns: turns.size,
    steps,
    llmMs,
    toolMs,
    ttftMs,
    ttftSteps,
    decodeMs,
    decodeTokens,
  }
}

export function formatTokens(n: number): string {
  const scaled = (value: number) => value >= 100
    ? String(Math.round(value))
    : String(Math.round(value * 10) / 10)
  if (n < 1e3) return String(n)
  if (n < 1e6) return `${scaled(n / 1e3)}K`
  return `${scaled(n / 1e6)}M`
}

export function formatDuration(ms: number): string {
  const seconds = ms / 1e3
  if (seconds < 60) return `${Math.round(seconds * 10) / 10}s`
  const whole = Math.round(seconds)
  return `${Math.floor(whole / 60)}m${whole % 60}s`
}

export function formatTokensPerSecond(tokensPerSecond: number): string {
  const clamped = Math.max(0, tokensPerSecond)
  return clamped >= 10
    ? String(Math.round(clamped))
    : String(Math.round(clamped * 10) / 10)
}

export function billedInputTokens(usage: TokenUsageProjection): number {
  return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
}

/**
 * Rounded percentage units of `cacheReadTokens / denominator`, in units of
 * `10 ** -decimalPlaces` percent, with positive ties rounded up.
 *
 * An integer binary search rather than `Math.round(ratio * scale)`: a float
 * ratio loses its last digit on the token counts this line reports, and a
 * cache-hit share is a ratio of two exact integers. Ties matter here — a
 * threshold reached exactly must round up, which is what comparing against
 * the odd `2n+1` cross-multiplied bound encodes.
 *
 * `scale >= 100` is given by the assert-free contract: callers pass 0..2.
 */
function roundedPercentUnits(cacheReadTokens: number, denominator: number, decimalPlaces: number): number {
  const scale = 10 ** decimalPlaces * 100
  const doubledScale = scale * 2
  const denominatorQuotient = Math.floor(denominator / doubledScale)
  const denominatorRemainder = denominator % doubledScale
  let lower = 0
  let upper = scale
  while (lower < upper) {
    const candidate = Math.floor((lower + upper + 1) / 2)
    const factor = candidate * 2 - 1
    if (cacheReadTokens >= factor * denominatorQuotient + Math.ceil(factor * denominatorRemainder / doubledScale)) {
      lower = candidate
    } else {
      upper = candidate - 1
    }
  }
  return lower
}

function displayPercentUnits(units: number, decimalPlaces: number): string {
  if (decimalPlaces === 0) return String(units)
  const divisor = 10 ** decimalPlaces
  const whole = Math.floor(units / divisor)
  const fraction = units % divisor
  return `${whole}.${String(fraction).padStart(decimalPlaces, '0')}`
}

/**
 * Display-ready cache-hit share, two decimals by default.
 *
 * Ported from the official `formatCacheHitPercent`: a partial hit is never
 * rounded up into a full one. When the requested precision would print
 * `100.00` for tokens that did miss, extra digits are added just far enough to
 * keep the number honest — the reason this plugin exists is a truthful
 * cache-hit figure, not a reassuring one.
 *
 * @param cacheReadTokens - exact prompt tokens served from cache.
 * @param promptTokens - exact aggregate prompt tokens.
 * @param decimalPlaces - ordinary precision; widened only to stay below 100.
 * @returns percentage text, or null when there was no prompt input.
 */
export function formatCacheHitPercent(
  cacheReadTokens: number,
  promptTokens: number,
  decimalPlaces = 2,
): string | null {
  if (promptTokens === 0) return null
  if (cacheReadTokens >= promptTokens) return '100'

  const units = roundedPercentUnits(cacheReadTokens, promptTokens, decimalPlaces)
  if (units < 10 ** decimalPlaces * 100) return displayPercentUnits(units, decimalPlaces)

  const missedInputTokens = promptTokens - cacheReadTokens
  let distinguishingPlaces = 1
  let scaledDoubleGap = missedInputTokens * 200
  const denominatorTens = Math.floor(promptTokens / 10)
  while (scaledDoubleGap <= denominatorTens) {
    scaledDoubleGap *= 10
    distinguishingPlaces += 1
  }

  const denominatorOnes = promptTokens % 10
  let roundedLoss = 5
  for (let loss = 1; loss < 5; loss += 1) {
    const factor = loss * 2 + 1
    if (scaledDoubleGap <= factor * denominatorTens + Math.floor(factor * denominatorOnes / 10)) {
      roundedLoss = loss
      break
    }
  }

  return `99.${'9'.repeat(distinguishingPlaces - 1)}${10 - roundedLoss}`
}

/**
 * Two-decimal cache-hit share of one `tokenUsage` projection value.
 *
 * @param usage - the session's token-usage projection value.
 * @returns percentage text, or null when no billed input exists.
 */
export function cacheHitPercent(usage: TokenUsageProjection): string | null {
  return formatCacheHitPercent(usage.cacheReadTokens, billedInputTokens(usage), 2)
}
