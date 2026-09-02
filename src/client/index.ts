import type { Context } from '@deepseek-ai/cordis'
// Pulls in the current client contract declarations: the `ctx.slots` service,
// the `conversation.composer.dock` slot, the `chat` locale namespace, and the
// `useChat`/`useProjection` standard session props.
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
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
export function apply(ctx: Context): void {
  installStatsOverride(ctx, DecimalStatsLine)
}
