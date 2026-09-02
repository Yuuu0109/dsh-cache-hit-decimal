import type { SessionStatsProjection } from '@deepseek-ai/dsh-session-stats/types';
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client';
export type { SessionStatsProjection, TokenUsageProjection };
/**
 * Fold the legacy window nodes into the same shape as the host-computed
 * `sessionStats` projection, so the two swap wholesale.
 */
export declare function deriveStats(nodes: readonly unknown[]): SessionStatsProjection;
export declare function formatTokens(n: number): string;
export declare function formatDuration(ms: number): string;
export declare function formatTokensPerSecond(tokensPerSecond: number): string;
export declare function billedInputTokens(usage: TokenUsageProjection): number;
export declare function cacheHitPercent(usage: TokenUsageProjection): number | null;
//# sourceMappingURL=stats.d.ts.map