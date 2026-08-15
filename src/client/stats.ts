export interface TokenUsageProjection {
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

export interface SessionStatsProjection {
  turns: number
  steps: number
  llmMs: number
  toolMs: number
  ttftMs: number
  ttftSteps: number
  decodeMs: number
  decodeTokens: number
}

export interface WindowStats extends SessionStatsProjection {}

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

export function deriveStats(nodes: readonly unknown[]): WindowStats {
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

export function cacheHitPercent(usage: TokenUsageProjection): number | null {
  const denominator = billedInputTokens(usage)
  if (denominator === 0) return null
  return Math.round(usage.cacheReadTokens / denominator * 10000) / 100
}
