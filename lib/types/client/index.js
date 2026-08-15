import { DecimalStatsLine } from './StatsLine';
import { installStatsOverride } from './slot';
export const inject = ['slots'];
/**
 * Browser half of the plugin.
 *
 * The native conversation package already occupies the `stats` cell of
 * `conversation.composer.dock`. Registering the same list-slot id at a lower
 * priority shadows that native entry. Removing this plugin disposes the
 * registration and restores the original integer formatting.
 */
export function apply(ctx) {
    installStatsOverride(ctx, DecimalStatsLine);
}
//# sourceMappingURL=index.js.map