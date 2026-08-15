import * as React from 'react';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
type StatsLineProps = PropsRuntime<'conversation.composer.dock'> & PropsLocale<'conversation'>;
declare function DecimalStatsLineComponent({ useSession, useProjection, t, }: StatsLineProps): React.ReactNode;
export declare const DecimalStatsLine: React.MemoExoticComponent<typeof DecimalStatsLineComponent>;
export {};
//# sourceMappingURL=StatsLine.d.ts.map