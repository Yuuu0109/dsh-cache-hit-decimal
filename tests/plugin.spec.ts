import { describe, expect, it, vi } from 'vitest'
import {
  STATS_DOCK_NAME,
  STATS_LOCALE,
  STATS_SLOT_ID,
  STATS_SLOT_PRIORITY,
  installStatsOverride,
} from '../src/client/slot'
import { apply as nodeApply } from '../src/index'

describe('decimal cache-hit slot registration', () => {
  it('has an intentional no-op node half', () => {
    expect(() => nodeApply()).not.toThrow()
  })

  it('shadows the native stats cell with priority -1', () => {
    const component = () => null
    const register = vi.fn()
    const injectSlot = vi.fn((_slot: string, install: () => void) => install())
    const ctx = {
      slots: {
        inject: injectSlot,
        register,
      },
    }

    installStatsOverride(ctx, component)

    expect(STATS_DOCK_NAME).toBe('conversation.composer.dock')
    expect(injectSlot).toHaveBeenCalledWith(STATS_DOCK_NAME, expect.any(Function))
    expect(register).toHaveBeenCalledOnce()
    expect(register.mock.calls[0]?.[0]).toEqual({
      name: STATS_DOCK_NAME,
      id: STATS_SLOT_ID,
      priority: STATS_SLOT_PRIORITY,
      locale: STATS_LOCALE,
    })
    expect(register.mock.calls[0]?.[1]).toBe(component)
  })
})
