export declare const STATS_DOCK_NAME = "conversation.composer.dock";
export declare const STATS_SLOT_ID = "stats";
export declare const STATS_SLOT_PRIORITY = -1;
export declare const STATS_LOCALE = "conversation";
/**
 * Register the decimal stats line as a lower-priority occupant of the native
 * stats cell. Disposing the returned slot registration restores the native
 * integer component.
 */
export declare function installStatsOverride(ctx: {
    slots: unknown;
}, component: unknown): void;
//# sourceMappingURL=slot.d.ts.map