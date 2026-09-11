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
export const LOCALE_NS = 'cache-hit-decimal'

/** Simplified Chinese dictionary (key-set source of truth). */
const zh = {
  'stats.counts': '{turns} 轮 {steps} 步',
  'stats.llm': '模型 {duration}',
  'stats.toolCall': '工具 {duration}',
  'stats.ttftAverage': '首 token 平均 {duration}',
  'stats.tokensPerSecond': '{throughput} tok/s',
  'stats.cacheHit': '缓存命中 {percent}%',
  'stats.tokens': '输入 {input} · 输出 {output}',
}

/** English dictionary, key-for-key with {@link zh}. */
const en = {
  'stats.counts': '{turns} turns {steps} steps',
  'stats.llm': 'model {duration}',
  'stats.toolCall': 'tools {duration}',
  'stats.ttftAverage': 'first token {duration} avg',
  'stats.tokensPerSecond': '{throughput} tok/s',
  'stats.cacheHit': 'Cache hit {percent}%',
  'stats.tokens': 'in {input} · out {output}',
}

export type Translate = (key: string, params?: Record<string, unknown>) => string

/** Runtime face of the locale service this plugin uses. */
interface LocaleLike {
  register(namespace: string, dictionaries: Record<string, Record<string, string>>): () => void
  bind(namespace: string): Translate
}

/** Minimal context face needed to reach the locale service. */
interface LocaleContext {
  get?(name: string): unknown
  locale?: unknown
  effect?(callback: () => unknown, label?: string): unknown
}

/**
 * Dictionary-backed translator used when no locale service is reachable.
 *
 * Keeps the line readable in a composition without the locale plugin, and
 * acts as the fallback if registration ever fails.
 */
export function localTranslate(key: string, params?: Record<string, unknown>): string {
  const prefersChinese = typeof document !== 'undefined'
    && typeof document.documentElement?.lang === 'string'
    && document.documentElement.lang.toLowerCase().startsWith('zh')
  const template = (prefersChinese ? zh : en)[key as keyof typeof zh] ?? key
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match)
}

/**
 * Resolve the translator this plugin renders with.
 *
 * @param ctx - client plugin context.
 * @returns the locale-backed translator, or the local dictionary fallback.
 */
export function resolveTranslate(ctx: LocaleContext): Translate {
  const locale = (typeof ctx.get === 'function' ? ctx.get('locale') : ctx.locale) as LocaleLike | undefined
  if (
    locale === undefined
    || typeof locale.register !== 'function'
    || typeof locale.bind !== 'function'
  ) {
    return localTranslate
  }

  try {
    const dispose = locale.register(LOCALE_NS, { zh, en })
    if (typeof ctx.effect === 'function') {
      ctx.effect(() => dispose, 'cache-hit-decimal: locale dictionary')
    }
  } catch {
    // Already registered (HMR re-apply, or a previous fiber's dictionary is
    // still live). `bind` below resolves whatever is registered.
  }

  try {
    return locale.bind(LOCALE_NS)
  } catch {
    return localTranslate
  }
}
