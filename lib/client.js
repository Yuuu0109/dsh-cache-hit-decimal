window.__ModuleLoader__.load({
	id: "@yuuu0109/dsh-cache-hit-decimal",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		//#region lib/types/client/locale.js
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
		const LOCALE_NS = "cache-hit-decimal";
		/** Simplified Chinese dictionary (key-set source of truth). */
		const zh = {
			"stats.counts": "{turns} 轮 {steps} 步",
			"stats.llm": "模型 {duration}",
			"stats.toolCall": "工具 {duration}",
			"stats.ttftAverage": "首 token 平均 {duration}",
			"stats.tokensPerSecond": "{throughput} tok/s",
			"stats.cacheHit": "缓存命中 {percent}%",
			"stats.tokens": "输入 {input} · 输出 {output}"
		};
		/** English dictionary, key-for-key with {@link zh}. */
		const en = {
			"stats.counts": "{turns} turns {steps} steps",
			"stats.llm": "model {duration}",
			"stats.toolCall": "tools {duration}",
			"stats.ttftAverage": "first token {duration} avg",
			"stats.tokensPerSecond": "{throughput} tok/s",
			"stats.cacheHit": "Cache hit {percent}%",
			"stats.tokens": "in {input} · out {output}"
		};
		/**
		* Dictionary-backed translator used when no locale service is reachable.
		*
		* Keeps the line readable in a composition without the locale plugin, and
		* acts as the fallback if registration ever fails.
		*/
		function localTranslate(key, params) {
			const template = (typeof document !== "undefined" && typeof document.documentElement?.lang === "string" && document.documentElement.lang.toLowerCase().startsWith("zh") ? zh : en)[key] ?? key;
			if (params === void 0) return template;
			return template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
		}
		/**
		* Resolve the translator this plugin renders with.
		*
		* @param ctx - client plugin context.
		* @returns the locale-backed translator, or the local dictionary fallback.
		*/
		function resolveTranslate(ctx) {
			const locale = typeof ctx.get === "function" ? ctx.get("locale") : ctx.locale;
			if (locale === void 0 || typeof locale.register !== "function" || typeof locale.bind !== "function") return localTranslate;
			try {
				const dispose = locale.register(LOCALE_NS, {
					zh,
					en
				});
				if (typeof ctx.effect === "function") ctx.effect(() => dispose, "cache-hit-decimal: locale dictionary");
			} catch {}
			try {
				return locale.bind(LOCALE_NS);
			} catch {
				return localTranslate;
			}
		}
		//#endregion
		//#region lib/types/client/stats.js
		function usageOutputTokens(usage) {
			if (typeof usage !== "object" || usage === null) return null;
			const value = usage.outputTokens;
			return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
		}
		function assistantStepReading(node) {
			const value = node;
			const timing = value.timing;
			return {
				ttftMs: timing !== void 0 && timing.stepStartTime !== null && timing.firstTokenTime !== null ? Math.max(0, timing.firstTokenTime - timing.stepStartTime) : null,
				decodeMs: timing !== void 0 && timing.firstTokenTime !== null ? Math.max(0, timing.completedTime - timing.firstTokenTime) : null,
				outputTokens: usageOutputTokens(value.usage)
			};
		}
		/**
		* Fold the legacy window nodes into the same shape as the host-computed
		* `sessionStats` projection, so the two swap wholesale.
		*/
		function deriveStats(nodes) {
			const turns = /* @__PURE__ */ new Set();
			let steps = 0;
			let llmMs = 0;
			let toolMs = 0;
			let ttftMs = 0;
			let ttftSteps = 0;
			let decodeMs = 0;
			let decodeTokens = 0;
			for (const rawNode of nodes) {
				const node = rawNode;
				if (node.kind === "tool-result") {
					if (node.time !== void 0 && node.callTime !== null && node.callTime !== void 0) toolMs += Math.max(0, node.time - node.callTime);
					continue;
				}
				if (node.kind !== "assistant" || node.turn === void 0) continue;
				turns.add(node.turn);
				steps += 1;
				if (node.timing !== void 0 && node.timing.stepStartTime !== null) llmMs += Math.max(0, node.timing.completedTime - node.timing.stepStartTime);
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
				decodeTokens
			};
		}
		function formatTokens(n) {
			const scaled = (value) => value >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10);
			if (n < 1e3) return String(n);
			if (n < 1e6) return `${scaled(n / 1e3)}K`;
			return `${scaled(n / 1e6)}M`;
		}
		function formatDuration(ms) {
			const seconds = ms / 1e3;
			if (seconds < 60) return `${Math.round(seconds * 10) / 10}s`;
			const whole = Math.round(seconds);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		function formatTokensPerSecond(tokensPerSecond) {
			const clamped = Math.max(0, tokensPerSecond);
			return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10);
		}
		function billedInputTokens(usage) {
			return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		/**
		* Rounded percentage units of `cacheReadTokens / denominator`, in units of
		* `10 ** -decimalPlaces` percent, with positive ties rounded up.
		*
		* An integer binary search rather than `Math.round(ratio * scale)`: a float
		* ratio loses its last digit on the token counts this line reports, and a
		* cache-hit share is a ratio of two exact integers. Ties matter here — a
		* threshold reached exactly must round up, which is what comparing against
		* the odd `2n+1` cross-multiplied bound encodes.
		*
		* `scale >= 100` is given by the assert-free contract: callers pass 0..2.
		*/
		function roundedPercentUnits(cacheReadTokens, denominator, decimalPlaces) {
			const scale = 10 ** decimalPlaces * 100;
			const doubledScale = scale * 2;
			const denominatorQuotient = Math.floor(denominator / doubledScale);
			const denominatorRemainder = denominator % doubledScale;
			let lower = 0;
			let upper = scale;
			while (lower < upper) {
				const candidate = Math.floor((lower + upper + 1) / 2);
				const factor = candidate * 2 - 1;
				if (cacheReadTokens >= factor * denominatorQuotient + Math.ceil(factor * denominatorRemainder / doubledScale)) lower = candidate;
				else upper = candidate - 1;
			}
			return lower;
		}
		function displayPercentUnits(units, decimalPlaces) {
			if (decimalPlaces === 0) return String(units);
			const divisor = 10 ** decimalPlaces;
			const whole = Math.floor(units / divisor);
			const fraction = units % divisor;
			return `${whole}.${String(fraction).padStart(decimalPlaces, "0")}`;
		}
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
		function formatCacheHitPercent(cacheReadTokens, promptTokens, decimalPlaces = 2) {
			if (promptTokens === 0) return null;
			if (cacheReadTokens >= promptTokens) return "100";
			const units = roundedPercentUnits(cacheReadTokens, promptTokens, decimalPlaces);
			if (units < 10 ** decimalPlaces * 100) return displayPercentUnits(units, decimalPlaces);
			const missedInputTokens = promptTokens - cacheReadTokens;
			let distinguishingPlaces = 1;
			let scaledDoubleGap = missedInputTokens * 200;
			const denominatorTens = Math.floor(promptTokens / 10);
			while (scaledDoubleGap <= denominatorTens) {
				scaledDoubleGap *= 10;
				distinguishingPlaces += 1;
			}
			const denominatorOnes = promptTokens % 10;
			let roundedLoss = 5;
			for (let loss = 1; loss < 5; loss += 1) {
				const factor = loss * 2 + 1;
				if (scaledDoubleGap <= factor * denominatorTens + Math.floor(factor * denominatorOnes / 10)) {
					roundedLoss = loss;
					break;
				}
			}
			return `99.${"9".repeat(distinguishingPlaces - 1)}${10 - roundedLoss}`;
		}
		/**
		* Two-decimal cache-hit share of one `tokenUsage` projection value.
		*
		* @param usage - the session's token-usage projection value.
		* @returns percentage text, or null when no billed input exists.
		*/
		function cacheHitPercent(usage) {
			return formatCacheHitPercent(usage.cacheReadTokens, billedInputTokens(usage), 2);
		}
		//#endregion
		//#region lib/types/client/StatsLine.js
		const css = ".DChp_root{box-sizing:border-box;width:max-content;max-width:none;padding:4px calc(var(--dsh-composer-side-clearance, 0px) + 16px) 0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:clip;margin:0 auto;font-size:12px;line-height:20px;display:flex;flex-wrap:nowrap;justify-content:center;overflow:visible}.DChp_sep{color:var(--dsw-alias-separator-primary, currentColor);opacity:.6;margin:0 10px;flex:none}";
		const cssTagId = "@yuuu0109/dsh-cache-hit-decimal/StatsLine.css";
		if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${cssTagId}"]`) === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "@yuuu0109/dsh-cache-hit-decimal";
			style.dataset.pluginCss = cssTagId;
			style.textContent = css;
			document.head.appendChild(style);
		}
		const EMPTY_NODES = [];
		function DecimalStatsLineComponent({ useChat, useProjection, t }) {
			const usage = useProjection?.("tokenUsage");
			const projected = useProjection?.("sessionStats");
			const chat = useChat;
			const nodes = chat !== void 0 ? chat((snapshot) => snapshot.legacy.nodes) : EMPTY_NODES;
			const stats = react.useMemo(() => projected ?? deriveStats(nodes), [projected, nodes]);
			const groups = [];
			if (stats.steps > 0) {
				groups.push(t("stats.counts", {
					turns: stats.turns,
					steps: stats.steps
				}));
				const durations = [];
				if (stats.llmMs > 0) durations.push(t("stats.llm", { duration: formatDuration(stats.llmMs) }));
				if (stats.toolMs > 0) durations.push(t("stats.toolCall", { duration: formatDuration(stats.toolMs) }));
				if (durations.length > 0) groups.push(durations.join(" · "));
				const speeds = [];
				if (stats.ttftSteps > 0) speeds.push(t("stats.ttftAverage", { duration: formatDuration(stats.ttftMs / stats.ttftSteps) }));
				if (stats.decodeMs > 0) speeds.push(t("stats.tokensPerSecond", { throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1e3)) }));
				if (speeds.length > 0) groups.push(speeds.join(" · "));
			}
			if (usage !== void 0 && (billedInputTokens(usage) > 0 || usage.outputTokens > 0)) {
				const cacheHit = cacheHitPercent(usage);
				if (cacheHit !== null) groups.push(t("stats.cacheHit", { percent: cacheHit }));
				groups.push(t("stats.tokens", {
					input: formatTokens(billedInputTokens(usage)),
					output: formatTokens(usage.outputTokens)
				}));
			}
			if (groups.length === 0) return null;
			const line = groups.join(" | ");
			return react.createElement("div", {
				className: "DChp_root",
				title: line,
				"data-cache-hit-decimal": "1"
			}, groups.map((group, index) => react.createElement(react.Fragment, { key: `${index}-${group}` }, index > 0 ? react.createElement(react.Fragment, { key: `separator-${index}` }, react.createElement("span", {
				className: "DChp_sep",
				"aria-hidden": true
			}, "|"), " ") : null, react.createElement("span", null, group))));
		}
		const DecimalStatsLine = DecimalStatsLineComponent;
		//#endregion
		//#region lib/types/client/slot.js
		const STATS_DOCK_NAME = "conversation.composer.dock";
		const STATS_SLOT_ID = "stats";
		/**
		* Register the decimal stats line as a lower-priority occupant of the native
		* `stats` cell in the composer dock. The native entry (`dsh-client-ui-chat`)
		* registers the same cell at priority 0; priority -1 shadows it, and
		* disposing the returned slot registration restores the native integer
		* formatting.
		*
		* No `locale` option is declared: the seat it binds reads the slot's
		* namespace, and this plugin carries its own dictionary (see `./locale`). The
		* translator is supplied to the component here instead.
		*/
		function installStatsOverride(ctx, component, translate) {
			const slots = ctx.slots;
			slots.inject(STATS_DOCK_NAME, () => slots.register({
				name: STATS_DOCK_NAME,
				id: STATS_SLOT_ID,
				order: 0,
				priority: -1
			}, (props) => component({
				...props,
				t: translate
			})));
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Browser half of the plugin.
		*
		* The native conversation package already occupies the `stats` cell of
		* `conversation.composer.dock`. Registering the same list-slot id at a lower
		* priority shadows that native entry. Removing this plugin disposes the
		* registration and restores the original integer formatting.
		*
		* Only `slots` is required: the standard session props (`useChat`,
		* `useProjection`) are delivered by the slot kit, and the locale service is
		* read opportunistically so a composition without it still renders.
		*/
		function apply(ctx) {
			installStatsOverride(ctx, DecimalStatsLine, resolveTranslate(ctx));
		}
		//#endregion
		exports.apply = apply;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map