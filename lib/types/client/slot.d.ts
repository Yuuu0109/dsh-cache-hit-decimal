export declare const STATS_DOCK_NAME = "conversation.composer.dock";
export declare const STATS_SLOT_ID = "stats";
export declare const STATS_SLOT_PRIORITY = -1;
export declare const STATS_LOCALE = "chat";
/** Minimal runtime face of the current `ctx.slots` service this plugin uses. */
interface SlotRegistrarLike {
    inject(key: string, install: () => unknown): unknown;
    register(options: unknown, component: unknown): unknown;
}
/**
 * Register the decimal stats line as a lower-priority occupant of the native
 * `stats` cell in the composer dock. The native entry (`dsh-client-ui-chat`)
 * registers the same cell at priority 0; priority -1 shadows it, and
 * disposing the returned slot registration restores the native integer
 * formatting.
 */
export declare function installStatsOverride(ctx: {
    slots: SlotRegistrarLike;
}, component: unknown): void;
export {};
//# sourceMappingURL=slot.d.ts.map