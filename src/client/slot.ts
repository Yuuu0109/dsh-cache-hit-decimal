export const STATS_DOCK_NAME = 'conversation.composer.dock'
export const STATS_SLOT_ID = 'stats'
export const STATS_SLOT_PRIORITY = -1
export const STATS_LOCALE = 'conversation'

interface SlotRegistrar {
  inject: (slot: string, install: () => void) => void
  register: (options: Record<string, unknown>, component: unknown) => () => void
}

/**
 * Register the decimal stats line as a lower-priority occupant of the native
 * stats cell. Disposing the returned slot registration restores the native
 * integer component.
 */
export function installStatsOverride(ctx: { slots: unknown }, component: unknown): void {
  const slots = ctx.slots as SlotRegistrar
  slots.inject(STATS_DOCK_NAME, () => slots.register({
    name: STATS_DOCK_NAME,
    id: STATS_SLOT_ID,
    priority: STATS_SLOT_PRIORITY,
    locale: STATS_LOCALE,
  }, component))
}
