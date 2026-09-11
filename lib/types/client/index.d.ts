import type { Context } from '@deepseek-ai/cordis';
/**
 * Browser half of the plugin.
 *
 * The native conversation package already occupies the `stats` cell of
 * `conversation.composer.dock`. Registering the same list-slot id at a lower
 * priority shadows that native entry. Removing this plugin disposes the
 * registration and restores the original integer formatting.
 *
 * Only `slots` is required: the standard session props (`useChat`,
 * `useProjection`) are delivered by the slot kit, and the locale service is
 * read opportunistically so a composition without it still renders.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map