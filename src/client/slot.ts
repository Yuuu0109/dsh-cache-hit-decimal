import type { Translate } from './locale'

export const STATS_DOCK_NAME = 'conversation.composer.dock'
export const STATS_SLOT_ID = 'stats'
export const STATS_SLOT_PRIORITY = -1

/** Minimal runtime face of the current `ctx.slots` service this plugin uses. */
interface SlotRegistrarLike {
  inject(key: string, install: () => unknown): unknown
  register(options: unknown, component: unknown): unknown
}

/**
 * Register the decimal stats line as a lower-priority occupant of the native
 * `stats` cell in the composer dock. The native entry (`dsh-client-ui-chat`)
 * registers the same cell at priority 0; priority -1 shadows it, and
 * disposing the returned slot registration restores the native integer
 * formatting.
 *
 * No `locale` option is declared: the seat it binds reads the slot's
 * namespace, and this plugin carries its own dictionary (see `./locale`). The
 * translator is supplied to the component here instead.
 */
export function installStatsOverride(
  ctx: { slots: SlotRegistrarLike },
  component: (props: { t: Translate }) => unknown,
  translate: Translate,
): void {
  const slots = ctx.slots
  slots.inject(STATS_DOCK_NAME, () => slots.register({
    name: STATS_DOCK_NAME,
    id: STATS_SLOT_ID,
    order: 0,
    priority: STATS_SLOT_PRIORITY,
  }, (props: Record<string, unknown>) => component({ ...props, t: translate })))
}
