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
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
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
		function cacheHitPercent(usage) {
			const denominator = billedInputTokens(usage);
			if (denominator === 0) return null;
			return Math.round(usage.cacheReadTokens / denominator * 1e4) / 100;
		}
		//#endregion
		//#region lib/types/client/StatsLine.js
		const css = ".DChp_root{box-sizing:border-box;width:max-content;max-width:none;padding:4px calc(var(--dsh-composer-side-clearance) + 16px) 0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:clip;margin:0 auto;font-size:12px;line-height:20px;display:flex;flex-wrap:nowrap;justify-content:center;overflow:visible}.DChp_sep{color:var(--dsw-alias-separator-primary);margin:0 10px;flex:none}";
		const cssTagId = "@yuuu0109/dsh-cache-hit-decimal/StatsLine.css";
		if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${cssTagId}"]`) === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "@yuuu0109/dsh-cache-hit-decimal";
			style.dataset.pluginCss = cssTagId;
			style.textContent = css;
			document.head.appendChild(style);
		}
		function DecimalStatsLineComponent({ useSession, useProjection, t }) {
			const readProjection = useProjection;
			const settledNodes = useSession((snapshot) => snapshot.chat.legacy.nodes);
			const usage = readProjection("tokenUsage");
			const projected = readProjection("sessionStats");
			const stats = react.useMemo(() => projected ?? deriveStats(settledNodes), [projected, settledNodes]);
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
			const line = groups.join(" | ");
			const rootRef = react.useRef(null);
			const [truncated, setTruncated] = react.useState(false);
			react.useLayoutEffect(() => {
				const element = rootRef.current;
				if (element === null) return;
				const measure = () => setTruncated(element.scrollWidth > element.clientWidth);
				measure();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(measure);
				observer.observe(element);
				return () => observer.disconnect();
			}, [line]);
			if (groups.length === 0) return null;
			const content = react.createElement("div", {
				ref: rootRef,
				className: "DChp_root"
			}, groups.map((group, index) => react.createElement(react.Fragment, { key: `${index}-${group}` }, index > 0 ? react.createElement(react.Fragment, { key: `separator-${index}` }, react.createElement("span", {
				className: "DChp_sep",
				"aria-hidden": true
			}, "|"), " ") : null, react.createElement("span", null, group))));
			return react.createElement(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: line,
				side: "top",
				delayMs: 500,
				disabled: !truncated,
				children: content
			});
		}
		const DecimalStatsLine = react.memo(DecimalStatsLineComponent);
		//#endregion
		//#region lib/types/client/slot.js
		const STATS_DOCK_NAME = "conversation.composer.dock";
		const STATS_SLOT_ID = "stats";
		const STATS_LOCALE = "conversation";
		/**
		* Register the decimal stats line as a lower-priority occupant of the native
		* stats cell. Disposing the returned slot registration restores the native
		* integer component.
		*/
		function installStatsOverride(ctx, component) {
			const slots = ctx.slots;
			slots.inject(STATS_DOCK_NAME, () => slots.register({
				name: STATS_DOCK_NAME,
				id: STATS_SLOT_ID,
				priority: -1,
				locale: STATS_LOCALE
			}, component));
		}
		//#endregion
		//#region lib/types/client/index.js
		const inject = ["slots"];
		/**
		* Browser half of the plugin.
		*
		* The native conversation package already occupies the `stats` cell of
		* `conversation.composer.dock`. Registering the same list-slot id at a lower
		* priority shadows that native entry. Removing this plugin disposes the
		* registration and restores the original integer formatting.
		*/
		function apply(ctx) {
			installStatsOverride(ctx, DecimalStatsLine);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map