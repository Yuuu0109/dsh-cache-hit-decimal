import { describe, expect, it } from 'vitest'
import {
  billedInputTokens,
  cacheHitPercent,
  deriveStats,
  formatCacheHitPercent,
  formatDuration,
  formatTokens,
  formatTokensPerSecond,
} from '../src/client/stats'

const usage = (
  uncachedInputTokens: number,
  cacheReadTokens: number,
  cacheWriteTokens: number,
  outputTokens: number,
) => ({ uncachedInputTokens, cacheReadTokens, cacheWriteTokens, outputTokens })

describe('cache-hit formatting', () => {
  it('renders the same total input buckets as the native stats line', () => {
    expect(billedInputTokens(usage(4, 3, 2, 10))).toBe(9)
  })

  it('always shows two decimal places', () => {
    expect(cacheHitPercent(usage(400, 600, 0, 10))).toBe('60.00')
    // 3 cached of 4 + 3 + 2 = 9 billed prompt tokens.
    expect(cacheHitPercent(usage(4, 3, 2, 10))).toBe('33.33')
    expect(cacheHitPercent(usage(0, 1, 0, 10))).toBe('100')
  })

  it('pads a whole-number share to two decimals', () => {
    expect(cacheHitPercent(usage(1, 1, 0, 1))).toBe('50.00')
  })

  it('returns null when no prompt input was billed', () => {
    expect(cacheHitPercent(usage(0, 0, 0, 10))).toBeNull()
  })

  it('never rounds a partial hit up to 100.00', () => {
    const text = cacheHitPercent(usage(3, 99997, 0, 0))
    expect(text).not.toBe('100.00')
    expect(text?.startsWith('99.9')).toBe(true)
  })

  it('stays exact on token counts where a float ratio loses the last digit', () => {
    // 999999997/1000000000 is 99.9999997%; Math.round(ratio * 1e4) rounds the
    // double to 10000 and would print 100.00.
    const text = cacheHitPercent(usage(3, 999999997, 0, 0))
    expect(text).not.toBe('100.00')
    expect(text).toBe('99.9999997')
  })

  it('keeps exact hundred-percent hits without trailing digits', () => {
    expect(formatCacheHitPercent(5, 5, 2)).toBe('100')
  })

  it('agrees with plain rounding for small counts', () => {
    for (let denominator = 1; denominator <= 300; denominator += 1) {
      for (let hit = 0; hit <= denominator; hit += 1) {
        const units = Math.round(formatCacheHitUnits(hit, denominator, 2))
        const expected = Math.round((hit / denominator) * 1e4 + Number.EPSILON)
        if (hit === denominator) continue
        expect(units, `hit=${hit} denominator=${denominator}`).toBe(expected)
      }
    }
  })
})

/** Reads the rounded units back out of the formatted text. */
function formatCacheHitUnits(cacheReadTokens: number, promptTokens: number, decimalPlaces: number): number {
  const text = formatCacheHitPercent(cacheReadTokens, promptTokens, decimalPlaces)
  if (text === null || text === '100') return 0
  const [whole = '0', fraction = ''] = text.split('.')
  return Number(whole) * 10 ** decimalPlaces + Number(fraction.padEnd(decimalPlaces, '0').slice(0, decimalPlaces))
}

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

  it('ignores a tool result with no call time', () => {
    expect(deriveStats([{ kind: 'tool-result', time: 500, callTime: null }]).toolMs).toBe(0)
  })
})

describe('compact stat formatting', () => {
  it('matches the surrounding one-decimal presentation style', () => {
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(61000)).toBe('1m1s')
    expect(formatTokens(12500)).toBe('12.5K')
    expect(formatTokensPerSecond(9.44)).toBe('9.4')
    expect(formatTokensPerSecond(42.4)).toBe('42')
  })
})
