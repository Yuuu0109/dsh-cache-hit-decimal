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
/**
 * Display-ready cache-hit share, two decimals by default.
 *
 * Ported from the official `formatCacheHitPercent`: a partial hit is never
 * rounded up into a full one. When the requested precision would print
 * `100.00` for tokens that did miss, extra digits are added just far enough to
 * keep the number honest — the reason this plugin exists is a truthful
 * cache-hit figure, not a reassuring one.
 *
 * @param cacheReadTokens - exact prompt tokens served from cache.
 * @param promptTokens - exact aggregate prompt tokens.
 * @param decimalPlaces - ordinary precision; widened only to stay below 100.
 * @returns percentage text, or null when there was no prompt input.
 */
export declare function formatCacheHitPercent(cacheReadTokens: number, promptTokens: number, decimalPlaces?: number): string | null;
/**
 * Two-decimal cache-hit share of one `tokenUsage` projection value.
 *
 * @param usage - the session's token-usage projection value.
 * @returns percentage text, or null when no billed input exists.
 */
export declare function cacheHitPercent(usage: TokenUsageProjection): string | null;
//# sourceMappingURL=stats.d.ts.map