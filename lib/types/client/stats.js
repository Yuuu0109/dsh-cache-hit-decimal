function usageOutputTokens(usage) {
    if (typeof usage !== 'object' || usage === null)
        return null;
    const value = usage.outputTokens;
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
function assistantStepReading(node) {
    const value = node;
    const timing = value.timing;
    return {
        ttftMs: timing !== undefined && timing.stepStartTime !== null && timing.firstTokenTime !== null
            ? Math.max(0, timing.firstTokenTime - timing.stepStartTime)
            : null,
        decodeMs: timing !== undefined && timing.firstTokenTime !== null
            ? Math.max(0, timing.completedTime - timing.firstTokenTime)
            : null,
        outputTokens: usageOutputTokens(value.usage),
    };
}
export function deriveStats(nodes) {
    const turns = new Set();
    let steps = 0;
    let llmMs = 0;
    let toolMs = 0;
    let ttftMs = 0;
    let ttftSteps = 0;
    let decodeMs = 0;
    let decodeTokens = 0;
    for (const rawNode of nodes) {
        const node = rawNode;
        if (node.kind === 'tool-result') {
            if (node.time !== undefined && node.callTime !== null && node.callTime !== undefined) {
                toolMs += Math.max(0, node.time - node.callTime);
            }
            continue;
        }
        if (node.kind !== 'assistant' || node.turn === undefined)
            continue;
        turns.add(node.turn);
        steps += 1;
        if (node.timing !== undefined && node.timing.stepStartTime !== null) {
            llmMs += Math.max(0, node.timing.completedTime - node.timing.stepStartTime);
        }
        const reading = assistantStepReading(node);
        if (reading.ttftMs !== null) {
            ttftMs += reading.ttftMs;
            ttftSteps += 1;
        }
        if (reading.decodeMs !== null && reading.outputTokens !== null) {
            decodeMs += reading.decodeMs;
            decodeTokens += reading.outputTokens;
        }
    }
    return {
        turns: turns.size,
        steps,
        llmMs,
        toolMs,
        ttftMs,
        ttftSteps,
        decodeMs,
        decodeTokens,
    };
}
export function formatTokens(n) {
    const scaled = (value) => value >= 100
        ? String(Math.round(value))
        : String(Math.round(value * 10) / 10);
    if (n < 1e3)
        return String(n);
    if (n < 1e6)
        return `${scaled(n / 1e3)}K`;
    return `${scaled(n / 1e6)}M`;
}
export function formatDuration(ms) {
    const seconds = ms / 1e3;
    if (seconds < 60)
        return `${Math.round(seconds * 10) / 10}s`;
    const whole = Math.round(seconds);
    return `${Math.floor(whole / 60)}m${whole % 60}s`;
}
export function formatTokensPerSecond(tokensPerSecond) {
    const clamped = Math.max(0, tokensPerSecond);
    return clamped >= 10
        ? String(Math.round(clamped))
        : String(Math.round(clamped * 10) / 10);
}
export function billedInputTokens(usage) {
    return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
}
export function cacheHitPercent(usage) {
    const denominator = billedInputTokens(usage);
    if (denominator === 0)
        return null;
    return Math.round(usage.cacheReadTokens / denominator * 10000) / 100;
}
//# sourceMappingURL=stats.js.map