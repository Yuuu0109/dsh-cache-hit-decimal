export interface TokenUsageProjection {
    uncachedInputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    outputTokens: number;
}
export interface SessionStatsProjection {
    turns: number;
    steps: number;
    llmMs: number;
    toolMs: number;
    ttftMs: number;
    ttftSteps: number;
    decodeMs: number;
    decodeTokens: number;
}
export interface WindowStats extends SessionStatsProjection {
}
export declare function deriveStats(nodes: readonly unknown[]): WindowStats;
export declare function formatTokens(n: number): string;
export declare function formatDuration(ms: number): string;
export declare function formatTokensPerSecond(tokensPerSecond: number): string;
export declare function billedInputTokens(usage: TokenUsageProjection): number;
export declare function cacheHitPercent(usage: TokenUsageProjection): number | null;
//# sourceMappingURL=stats.d.ts.map