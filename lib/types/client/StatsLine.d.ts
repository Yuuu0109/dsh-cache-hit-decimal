import * as React from 'react';
import type { UseProjection } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { PropsLocale, SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots';
/**
 * Current-DSH composer.dock occupant props: the `t` seat from the `chat`
 * locale namespace, plus the standard session hooks. `useProjection` comes
 * from `dsh-client-ui-session` and `useChat` from `dsh-client-ui-chat`; both
 * are optional so the line still renders in a composition missing either.
 */
type StatsLineProps = PropsLocale<'chat'> & {
    useChat?: SnapshotSelectorHook<ChatSnapshot>;
    useProjection?: UseProjection;
};
declare function DecimalStatsLineComponent({ useChat, useProjection, t, }: StatsLineProps): React.ReactNode;
export declare const DecimalStatsLine: typeof DecimalStatsLineComponent;
export {};
//# sourceMappingURL=StatsLine.d.ts.map