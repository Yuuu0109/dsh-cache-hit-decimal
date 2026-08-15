import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export declare const inject: string[];
/**
 * Browser half of the plugin.
 *
 * The native conversation package already occupies the `stats` cell of
 * `conversation.composer.dock`. Registering the same list-slot id at a lower
 * priority shadows that native entry. Removing this plugin disposes the
 * registration and restores the original integer formatting.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map