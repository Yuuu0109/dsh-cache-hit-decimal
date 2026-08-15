import { describe, expect, it } from 'vitest'
import {
  billedInputTokens,
  cacheHitPercent,
  deriveStats,
  formatDuration,
  formatTokens,
} from '../src/client/stats'

describe('cache-hit formatting', () => {
  it('renders the same total input buckets as the native stats line', () => {
    expect(billedInputTokens({
      uncachedInputTokens: 4,
      cacheReadTokens: 3,
      cacheWriteTokens: 2,
      outputTokens: 10,
    })).toBe(9)
  })

  it('keeps one decimal place instead of rounding to an integer', () => {
    expect(cacheHitPercent({
      uncachedInputTokens: 4,
      cacheReadTokens: 3,
      cacheWriteTokens: 0,
      outputTokens: 10,
    })).toBe(42.9)
  })

  it('keeps exact hundred-percent hits without trailing digits', () => {
    expect(cacheHitPercent({
      uncachedInputTokens: 0,
      cacheReadTokens: 5,
      cacheWriteTokens: 0,
      outputTokens: 10,
    })).toBe(100)
  })

  it('returns null when no prompt input was billed', () => {
    expect(cacheHitPercent({
      uncachedInputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      outputTokens: 10,
    })).toBeNull()
  })
})

describe('stats fallback', () => {
  it('folds assistant steps and tool-result duration', () => {
    const stats = deriveStats([
      {
        kind: 'assistant',
        turn: 'turn-1',
        timing: {
          stepStartTime: 100,
          firstTokenTime: 200,
          completedTime: 400,
        },
        usage: { outputTokens: 8 },
      },
      {
        kind: 'tool-result',
        time: 500,
        callTime: 450,
      },
    ])

    expect(stats).toEqual({
      turns: 1,
      steps: 1,
      llmMs: 300,
      toolMs: 50,
      ttftMs: 100,
      ttftSteps: 1,
      decodeMs: 200,
      decodeTokens: 8,
    })
  })
})

describe('compact stat formatting', () => {
  it('matches the surrounding one-decimal presentation style', () => {
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(61000)).toBe('1m1s')
    expect(formatTokens(12500)).toBe('12.5K')
  })
})
