/**
 * Locale seat for this plugin.
 *
 * The plugin owns its dictionary instead of borrowing the `chat` namespace.
 * Registering with `locale: 'chat'` and reading keys such as `stats.llm`,
 * `stats.toolCall`, `stats.ttftAverage`, `stats.tokensPerSecond` and
 * `stats.tokens` does not work: none of those exist in the Chat dictionary,
 * and the locale runtime returns THE KEY ITSELF for an unknown key, so the
 * line renders literal `stats.llm` text.
 *
 * The locale service is the same dictionary registry the slot's `t` seat
 * reads. `bind` returns one identity-stable function whose lookups resolve the
 * active language on every call, so a language switch needs no
 * re-registration.
 */
/** Namespace owned by this plugin. */
export declare const LOCALE_NS = "cache-hit-decimal";
export type Translate = (key: string, params?: Record<string, unknown>) => string;
/** Minimal context face needed to reach the locale service. */
interface LocaleContext {
    get?(name: string): unknown;
    locale?: unknown;
    effect?(callback: () => unknown, label?: string): unknown;
}
/**
 * Dictionary-backed translator used when no locale service is reachable.
 *
 * Keeps the line readable in a composition without the locale plugin, and
 * acts as the fallback if registration ever fails.
 */
export declare function localTranslate(key: string, params?: Record<string, unknown>): string;
/**
 * Resolve the translator this plugin renders with.
 *
 * @param ctx - client plugin context.
 * @returns the locale-backed translator, or the local dictionary fallback.
 */
export declare function resolveTranslate(ctx: LocaleContext): Translate;
export {};
//# sourceMappingURL=locale.d.ts.map