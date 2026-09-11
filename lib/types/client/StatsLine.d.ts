import * as React from 'react';
import type { UseProjection } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots';
import type { Translate } from './locale';
/**
 * Current seated props: the plugin-owned translator injected by the slot
 * registration, plus the standard session hooks. `useProjection` comes from
 * `dsh-client-ui-session` and `useChat` from `dsh-client-ui-conversation`;
 * both are optional so the line still renders in a composition missing either.
 */
type StatsLineProps = {
    t: Translate;
    useChat?: SnapshotSelectorHook<ChatSnapshot>;
    useProjection?: UseProjection;
};
declare function DecimalStatsLineComponent({ useChat, useProjection, t, }: StatsLineProps): React.ReactNode;
export declare const DecimalStatsLine: typeof DecimalStatsLineComponent;
export {};
//# sourceMappingURL=StatsLine.d.ts.map