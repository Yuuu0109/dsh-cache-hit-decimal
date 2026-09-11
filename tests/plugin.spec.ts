import { describe, expect, it, vi } from 'vitest'
import {
  STATS_DOCK_NAME,
  STATS_SLOT_ID,
  STATS_SLOT_PRIORITY,
  installStatsOverride,
} from '../src/client/slot'
import { localTranslate, LOCALE_NS, resolveTranslate } from '../src/client/locale'
import { apply as nodeApply } from '../src/index'

describe('decimal cache-hit slot registration', () => {
  it('has an intentional no-op node half', () => {
    expect(() => nodeApply()).not.toThrow()
  })

  it('shadows the native stats cell with priority -1', () => {
    const component = vi.fn(() => null)
    const register = vi.fn()
    const injectSlot = vi.fn((_slot: string, install: () => void) => install())
    const ctx = {
      slots: {
        inject: injectSlot,
        register,
      },
    }

    installStatsOverride(ctx, component, localTranslate)

    expect(STATS_DOCK_NAME).toBe('conversation.composer.dock')
    expect(injectSlot).toHaveBeenCalledWith(STATS_DOCK_NAME, expect.any(Function))
    expect(register).toHaveBeenCalledOnce()
    expect(register.mock.calls[0]?.[0]).toEqual({
      name: STATS_DOCK_NAME,
      id: STATS_SLOT_ID,
      order: 0,
      priority: STATS_SLOT_PRIORITY,
    })
  })

  it('declares no locale namespace, because the plugin owns its dictionary', () => {
    const register = vi.fn()
    const ctx = {
      slots: {
        inject: (_slot: string, install: () => void) => install(),
        register,
      },
    }

    installStatsOverride(ctx, () => null, localTranslate)

    expect(register.mock.calls[0]?.[0]).not.toHaveProperty('locale')
  })

  it('injects this plugin translator into the seated component', () => {
    const component = vi.fn((_props: { t: unknown }) => null)
    let seated: unknown
    const ctx = {
      slots: {
        inject: (_slot: string, install: () => void) => install(),
        register: (_options: unknown, registered: unknown) => {
          seated = registered
          return () => {}
        },
      },
    }

    installStatsOverride(ctx, component, localTranslate)
    ;(seated as (props: Record<string, unknown>) => unknown)({ useChat: () => [] })

    expect(component).toHaveBeenCalledOnce()
    expect(component.mock.calls[0]?.[0]).toMatchObject({ t: localTranslate })
  })
})

describe('locale dictionary', () => {
  const keys = [
    'stats.counts',
    'stats.llm',
    'stats.toolCall',
    'stats.ttftAverage',
    'stats.tokensPerSecond',
    'stats.cacheHit',
    'stats.tokens',
  ]

  it('covers every key the stats line renders', () => {
    for (const key of keys) {
      expect(localTranslate(key), key).not.toBe(key)
    }
  })

  it('interpolates parameters', () => {
    // `localTranslate` picks its dictionary from the document language, which
    // does not exist in the node test environment; stub it to cover the zh path.
    vi.stubGlobal('document', { documentElement: { lang: 'zh-CN' } })
    try {
      expect(localTranslate('stats.counts', { turns: 3, steps: 5 })).toBe('3 轮 5 步')
      expect(localTranslate('stats.cacheHit', { percent: '60.00' })).toBe('缓存命中 60.00%')
    } finally {
      vi.unstubAllGlobals()
    }
    expect(localTranslate('stats.counts', { turns: 3, steps: 5 })).toBe('3 turns 5 steps')
  })

  it('falls back to the key rather than throwing', () => {
    expect(localTranslate('stats.unknown')).toBe('stats.unknown')
  })

  it('registers into its own namespace and returns the bound seat', () => {
    const register = vi.fn(() => () => {})
    // `bind` mirrors the real locale seat: it returns the translator function.
    const bound = vi.fn(() => (key: string) => `translated:${key}`)
    const effect = vi.fn()
    const ctx = {
      get: (name: string) => (name === 'locale' ? { register, bind: bound } : undefined),
      effect,
    }

    const translate = resolveTranslate(ctx)

    expect(register).toHaveBeenCalledWith(LOCALE_NS, expect.objectContaining({
      zh: expect.any(Object),
      en: expect.any(Object),
    }))
    expect(bound).toHaveBeenCalledWith(LOCALE_NS)
    expect(translate('stats.counts')).toBe('translated:stats.counts')
    expect(effect).toHaveBeenCalledOnce()
  })

  it('falls back to the local dictionary without a locale service', () => {
    const translate = resolveTranslate({ get: () => undefined })
    expect(translate).toBe(localTranslate)
  })

  it('survives a namespace already being registered', () => {
    const ctx = {
      get: () => ({
        register: () => {
          throw new Error('locale namespace "cache-hit-decimal" already has locale "zh"')
        },
        bind: () => localTranslate,
      }),
    }

    expect(() => resolveTranslate(ctx)).not.toThrow()
    expect(resolveTranslate(ctx)).toBe(localTranslate)
  })
})
