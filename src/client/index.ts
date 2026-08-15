import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Pulls in the ui-conversation SlotMap declaration for composer.dock.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { DecimalStatsLine } from './StatsLine'
import { installStatsOverride } from './slot'

export const inject = ['slots']

/**
 * Browser half of the plugin.
 *
 * The native conversation package already occupies the `stats` cell of
 * `conversation.composer.dock`. Registering the same list-slot id at a lower
 * priority shadows that native entry. Removing this plugin disposes the
 * registration and restores the original integer formatting.
 */
export function apply(ctx: ClientContext): void {
  installStatsOverride(ctx, DecimalStatsLine)
}
