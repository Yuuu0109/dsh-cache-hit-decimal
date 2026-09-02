export const STATS_DOCK_NAME = 'conversation.composer.dock';
export const STATS_SLOT_ID = 'stats';
export const STATS_SLOT_PRIORITY = -1;
export const STATS_LOCALE = 'chat';
/**
 * Register the decimal stats line as a lower-priority occupant of the native
 * `stats` cell in the composer dock. The native entry (`dsh-client-ui-chat`)
 * registers the same cell at priority 0; priority -1 shadows it, and
 * disposing the returned slot registration restores the native integer
 * formatting.
 */
export function installStatsOverride(ctx, component) {
    const slots = ctx.slots;
    slots.inject(STATS_DOCK_NAME, () => slots.register({
        name: STATS_DOCK_NAME,
        id: STATS_SLOT_ID,
        order: 0,
        priority: STATS_SLOT_PRIORITY,
        locale: STATS_LOCALE,
    }, component));
}
//# sourceMappingURL=slot.js.map