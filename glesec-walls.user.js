// ==UserScript==
// @name         GLESEC SKYWATCH Monitor Walls
// @namespace    glesec-tools
// @version      1.0.40
// @description  Restyle all 6 GLESEC SKYWATCH SOC monitor walls in place, driven by the walls' own live data. Generated — edit redesign/ source, not this file.
// @author       GLESEC GOC
// @match        https://intranet.glesec.com/radar-wall/*
// @match        https://intranet.glesec.com/goc-notable-events/*
// @match        https://intranet.glesec.com/threat-level/*
// @match        https://intranet.glesec.com/goc-wall/*
// @match        https://intranet.glesec.com/map-wall/*
// @match        https://intranet.glesec.com/mss-csm-prtg/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/glesec-tools/monitor-wall-tampermonkey/main/glesec-walls.user.js
// @downloadURL  https://raw.githubusercontent.com/glesec-tools/monitor-wall-tampermonkey/main/glesec-walls.user.js
// ==/UserScript==
(function () {
'use strict';

/* ===== theme.css (exposed for boot)                                    ===== */

window.SW_THEME_CSS = "/* ============================================================================\n   SKYWATCH — Unified Monitor-Wall Design System\n   shadcn / neutral-dark aesthetic, vivid operational status colors\n   Authored for 1920x1080 always-on SOC video walls (display-only).\n   ============================================================================ */\n@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');\n\n:root {\n  /* ---- neutral surfaces (shadcn \"neutral\" dark, slightly deepened) ---- */\n  --bg:            #08080a;\n  --bg-grad-a:     #0b0b0e;\n  --bg-grad-b:     #060608;\n  --surface:       #0f0f12;   /* card */\n  --surface-2:     #141418;   /* inner / elevated */\n  --surface-3:     #1a1a1f;   /* hover / chips */\n  --border:        rgba(255,255,255,0.075);\n  --border-2:      rgba(255,255,255,0.12);\n  --hairline:      rgba(255,255,255,0.05);\n\n  /* ---- foreground ---- */\n  --fg:            #fafafa;\n  --fg-muted:      #a1a1aa;   /* zinc-400 */\n  --fg-subtle:     #71717a;   /* zinc-500 */\n  --fg-faint:      #52525b;   /* zinc-600 */\n\n  /* ---- semantic status (vivid, meaningful) ---- */\n  --green:   #22c55e;\n  --yellow:  #eab308;\n  --orange:  #f97316;\n  --red:     #ef4444;\n  --blue:    #3b82f6;\n  --violet:  #8b5cf6;\n  --cyan:    #22d3ee;\n\n  /* threat tiers (GLESEC escalation codes) */\n  --t1: #22c55e;   /* NONE  / green  */\n  --t2: #eab308;   /* SBEAR / yellow */\n  --t3: #f97316;   /* TEAR  / orange */\n  --t4: #ef4444;   /* TEVR  / red    */\n  --t5: #d4d4d8;   /* INCIDENT / black tier -> light ink on black */\n\n  /* severity palette — CANONICAL SOURCE is SW.SEV in common.js (these mirror it and are also\n     set at runtime from there). Scheme: low=yellow, medium=orange, high=red, critical=pink/red. */\n  --sev-critical: #ff2d6e;\n  --sev-high:     #ef4444;\n  --sev-medium:   #f97316;\n  --sev-low:      #eab308;\n  --sev-info:     #38bdf8;\n\n  --radius:    14px;\n  --radius-sm: 9px;\n  --radius-xs: 7px;\n\n  --font: 'Inter', ui-sans-serif, system-ui, 'Segoe UI', sans-serif;\n  --mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;\n\n  --shadow: 0 1px 0 0 rgba(255,255,255,0.04) inset,\n            0 18px 40px -24px rgba(0,0,0,0.9);\n}\n\n* { box-sizing: border-box; }\nhtml, body { margin: 0; padding: 0; }\n\n.sw-root {\n  width: 1920px; height: 1080px;\n  background:\n    radial-gradient(1200px 700px at 78% -10%, rgba(59,130,246,0.05), transparent 60%),\n    radial-gradient(1000px 800px at 10% 110%, rgba(139,92,246,0.04), transparent 60%),\n    linear-gradient(160deg, var(--bg-grad-a), var(--bg-grad-b));\n  color: var(--fg);\n  font-family: var(--font);\n  font-size: 15px;\n  line-height: 1.45;\n  letter-spacing: 0.01em;\n  -webkit-font-smoothing: antialiased;\n  text-rendering: optimizeLegibility;\n  display: flex; flex-direction: column;\n  overflow: hidden;\n  position: relative;\n}\n.sw-root::before { /* faint grid texture */\n  content: \"\"; position: absolute; inset: 0; pointer-events: none;\n  background-image:\n    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);\n  background-size: 48px 48px;\n  mask-image: radial-gradient(120% 120% at 50% 0%, #000 30%, transparent 90%);\n}\n\n/* ---------------------------------------------------------------- topbar -- */\n.sw-topbar {\n  flex: 0 0 auto;\n  height: 64px;\n  display: flex; align-items: center; gap: 18px;\n  padding: 0 30px;\n  border-bottom: 1px solid var(--border);\n  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);\n  position: relative; z-index: 2;\n}\n.sw-brand { display: flex; align-items: center; gap: 12px; }\n.sw-brand__logo {\n  width: 32px; height: 32px; border-radius: 9px;\n  background: linear-gradient(180deg, #16191d, #0b0d10);\n  border: 1px solid rgba(255,255,255,0.08);\n  display: grid; place-items: center; flex: 0 0 auto;\n  box-shadow: 0 6px 14px -6px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12);\n}\n.sw-brand__logo svg { width: 22px; height: 22px; filter: drop-shadow(0 0 2px rgba(147,232,223,0.85)); }\n.sw-brand__name { font-size: 15px; font-weight: 800; letter-spacing: 0.14em; }\n.sw-brand__name b { color: var(--fg); }\n.sw-brand__name span { color: var(--cyan); }\n.sw-brand__div { width: 1px; height: 26px; background: var(--border-2); margin: 0 4px; }\n.sw-title {\n  font-size: 15px; font-weight: 600; color: var(--fg);\n  letter-spacing: 0.02em;\n}\n.sw-title small { display:block; font-size: 11px; font-weight: 500; color: var(--fg-subtle); letter-spacing: 0.18em; text-transform: uppercase; }\n.sw-topbar__spacer { flex: 1 1 auto; }\n\n.sw-chip {\n  display: inline-flex; align-items: center; gap: 9px;\n  height: 38px; padding: 0 15px;\n  background: var(--surface-2);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  font-size: 13px; color: var(--fg-muted);\n  letter-spacing: 0.02em;\n}\n.sw-chip b { color: var(--fg); font-weight: 600; }\n.sw-chip__label { color: var(--fg-faint); text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.14em; font-weight: 600; }\n.sw-clock { font-family: var(--mono); font-weight: 500; font-variant-numeric: tabular-nums; }\n\n.sw-status {\n  --c: var(--green);\n  display:inline-flex; align-items:center; gap:9px;\n  height:38px; padding:0 16px; border-radius:10px;\n  font-size:12.5px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase;\n  background: color-mix(in srgb, var(--c) 13%, transparent);\n  border:1px solid color-mix(in srgb, var(--c) 36%, transparent);\n  color: color-mix(in srgb, var(--c) 72%, white);\n}\n.sw-status .dot { width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c); animation: pulse 2.4s infinite; }\n/* tone follows derived severity so the pill colour never lies */\n.sw-status.tone-green  { --c: var(--green); }\n.sw-status.tone-yellow { --c: var(--yellow); }\n.sw-status.tone-orange { --c: var(--orange); }\n.sw-status.tone-red, .sw-status.is-degraded { --c: var(--red); }\n/* neutral status shown while loading — claims nothing about live health */\n.sw-status.is-loading { --c: var(--fg-subtle); background: var(--surface-3); border-color: var(--border-2); color: var(--fg-subtle); }\n.sw-status.is-loading .dot { box-shadow: none; animation: none; }\n\n/* --------------------------------------------------------------- content -- */\n.sw-main {\n  flex: 1 1 auto;\n  padding: 22px 30px 24px;\n  display: grid;\n  gap: 18px;\n  position: relative; z-index: 1;\n  min-height: 0;\n}\n\n/* ---- card ---- */\n.sw-card {\n  background: linear-gradient(180deg, var(--surface), color-mix(in srgb, var(--surface) 88%, #000));\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  box-shadow: var(--shadow);\n  display: flex; flex-direction: column;\n  min-height: 0; overflow: hidden;\n}\n.sw-card__head {\n  flex: 0 0 auto;\n  display: flex; align-items: center; justify-content: space-between; gap: 16px;\n  padding: 15px 20px 13px;\n  border-bottom: 1px solid var(--hairline);\n}\n.sw-card__head-left { display: flex; align-items: center; gap: 12px; min-width: 0; }\n.sw-card__head-right { display: flex; align-items: baseline; gap: 14px; flex: 0 0 auto; text-align: right; }\n.sw-card__accent { width: 3px; height: 15px; border-radius: 3px; background: var(--fg-faint); flex: 0 0 auto; }\n.sw-card__title { font-size: 13px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.sw-card__sub { font-size: 12px; font-weight: 500; color: var(--fg-subtle); letter-spacing: 0.04em; white-space: nowrap; }\n.sw-card__meta { font-size: 11.5px; color: var(--fg-faint); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; white-space: nowrap; }\n.sw-card__body { flex: 1 1 auto; padding: 8px 20px 16px; min-height: 0; overflow: hidden; }\n.sw-card__body.pad { padding: 18px 20px; }\n.sw-card__body.nopad { padding: 0; }\n\n/* accent colour helpers */\n.acc-green  .sw-card__accent, .sw-card__accent.acc-green  { background: var(--green);  box-shadow:0 0 10px color-mix(in srgb,var(--green) 60%, transparent); }\n.acc-yellow .sw-card__accent, .sw-card__accent.acc-yellow { background: var(--yellow); box-shadow:0 0 10px color-mix(in srgb,var(--yellow) 60%, transparent); }\n.acc-orange .sw-card__accent, .sw-card__accent.acc-orange { background: var(--orange); box-shadow:0 0 10px color-mix(in srgb,var(--orange) 60%, transparent); }\n.acc-red    .sw-card__accent, .sw-card__accent.acc-red    { background: var(--red);    box-shadow:0 0 10px color-mix(in srgb,var(--red) 60%, transparent); }\n.acc-blue   .sw-card__accent, .sw-card__accent.acc-blue   { background: var(--blue);   box-shadow:0 0 10px color-mix(in srgb,var(--blue) 60%, transparent); }\n.acc-cyan   .sw-card__accent, .sw-card__accent.acc-cyan   { background: var(--cyan);   box-shadow:0 0 10px color-mix(in srgb,var(--cyan) 60%, transparent); }\n.acc-violet .sw-card__accent, .sw-card__accent.acc-violet { background: var(--violet); box-shadow:0 0 10px color-mix(in srgb,var(--violet) 60%, transparent); }\n\n/* ---- table ---- */\n.sw-table { width: 100%; border-collapse: collapse; font-size: 14px; }\n.sw-table thead th {\n  text-align: left; font-weight: 600; color: var(--fg-faint);\n  font-size: 11px; letter-spacing: 0.11em; text-transform: uppercase;\n  padding: 9px 12px; border-bottom: 1px solid var(--border);\n  white-space: nowrap;\n}\n.sw-table tbody td {\n  padding: 13px 14px; border-bottom: 1px solid var(--hairline);\n  color: var(--fg-muted); vertical-align: middle;\n}\n.sw-table.roomy tbody td { padding: 17px 14px; }\n.sw-table.compact { font-size: 12.5px; }\n.sw-table.compact thead th { padding: 7px 9px; font-size: 10px; letter-spacing: 0.09em; }\n.sw-table.compact tbody td { padding: 8px 9px; }\n.sw-table tbody tr:last-child td { border-bottom: none; }\n.sw-table tbody tr:nth-child(even) td { background: rgba(255,255,255,0.012); }\n.sw-table .num { text-align: right; font-variant-numeric: tabular-nums; font-family: var(--mono); color: var(--fg); }\n.sw-table .strong { color: var(--fg); font-weight: 600; }\n.sw-table .muted { color: var(--fg-subtle); }\n.sw-table .mono { font-family: var(--mono); font-size: 13px; }\n/* auto-scroll feed: the tbody is translated (not scrolled), so the header just needs to be an\n   opaque row stacked ABOVE the tbody — rows pass up behind it. No sticky => no per-frame jitter. */\n.sw-feed-table thead th { position: relative; z-index: 2; background: var(--surface); }\n.sw-rank { color: var(--fg-faint); font-family: var(--mono); font-weight:600; }\n\n/* ---- badge ---- */\n.sw-badge {\n  --c: var(--fg-subtle);\n  display: inline-flex; align-items: center; gap: 6px;\n  padding: 3px 9px; border-radius: 999px;\n  font-size: 11.5px; font-weight: 600; letter-spacing: 0.04em;\n  background: color-mix(in srgb, var(--c) 15%, transparent);\n  border: 1px solid color-mix(in srgb, var(--c) 36%, transparent);\n  color: color-mix(in srgb, var(--c) 62%, white);\n  white-space: nowrap; line-height: 1.3;\n}\n.sw-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); }\n.sw-badge.solid { background: var(--c); color: #0a0a0a; border-color: transparent; font-weight: 700; }\n.sw-badge.is-critical { --c: var(--sev-critical); }\n.sw-badge.is-high     { --c: var(--sev-high); }\n.sw-badge.is-medium   { --c: var(--sev-medium); }\n.sw-badge.is-low      { --c: var(--sev-low); }\n.sw-badge.is-info     { --c: var(--sev-info); }\n.sw-badge.is-none, .sw-badge.is-t1 { --c: var(--t1); }\n.sw-badge.is-sbear, .sw-badge.is-t2 { --c: var(--t2); }\n.sw-badge.is-tear,  .sw-badge.is-t3 { --c: var(--t3); }\n.sw-badge.is-tevr,  .sw-badge.is-t4 { --c: var(--t4); }\n.sw-badge.is-open    { --c: var(--blue); }\n.sw-badge.is-ok      { --c: var(--green); }\n.sw-badge.is-down    { --c: var(--red); }\n.sw-badge.is-warn    { --c: var(--yellow); }\n.sw-badge.is-breach  { --c: var(--red); }\n\n/* ---- kpi ---- */\n.sw-kpi {\n  --c: var(--fg-muted);\n  position: relative;\n  background: linear-gradient(180deg, var(--surface), color-mix(in srgb,var(--surface) 86%, #000));\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  padding: 16px 18px 15px;\n  display: flex; flex-direction: column; gap: 4px;\n  overflow: hidden;\n}\n.sw-kpi::before { content:\"\"; position:absolute; left:0; top:0; bottom:0; width:3px; background: var(--c); box-shadow: 0 0 16px color-mix(in srgb, var(--c) 55%, transparent); }\n.sw-kpi::after { content:\"\"; position:absolute; right:-30px; top:-30px; width:120px; height:120px; border-radius:50%; background: radial-gradient(circle, color-mix(in srgb,var(--c) 16%, transparent), transparent 70%); }\n.sw-kpi__label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-subtle); }\n.sw-kpi__value { font-size: 46px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: var(--fg); }\n.sw-kpi__value.tint { color: color-mix(in srgb, var(--c) 72%, white); }\n.sw-kpi__foot { font-size: 12px; color: var(--fg-faint); font-weight: 500; }\n.sw-kpi.c-red    { --c: var(--red); }\n.sw-kpi.c-orange { --c: var(--orange); }\n.sw-kpi.c-yellow { --c: var(--yellow); }\n.sw-kpi.c-green  { --c: var(--green); }\n.sw-kpi.c-blue   { --c: var(--blue); }\n.sw-kpi.c-violet { --c: var(--violet); }\n\n/* ---- trend / metric ---- */\n.sw-metric { display:flex; flex-direction:column; gap:10px; padding: 16px 18px; background: var(--surface-2); border:1px solid var(--border); border-radius: var(--radius-sm); }\n.sw-metric__label { font-size:12px; color: var(--fg-subtle); font-weight:600; letter-spacing:0.1em; text-transform:uppercase; }\n.sw-metric__row { display:flex; align-items:baseline; gap:10px; }\n.sw-metric__delta { font-size:34px; font-weight:700; letter-spacing:-0.02em; font-variant-numeric:tabular-nums; display:flex; align-items:center; gap:8px; }\n.sw-metric__delta.up { color: var(--green); }\n.sw-metric__delta.down { color: var(--red); }\n.sw-metric__arrow { font-size:22px; }\n.sw-metric__sub { font-size:12px; color: var(--fg-faint); font-family: var(--mono); }\n\n/* ---- stat bars (level counters) ---- */\n.sw-bars { display:flex; flex-direction:column; gap:10px; }\n.sw-bar { --c: var(--fg-subtle); position:relative; display:flex; align-items:center; justify-content:space-between;\n  height: 46px; padding: 0 16px; border-radius: var(--radius-sm); overflow:hidden;\n  background: color-mix(in srgb, var(--c) 12%, var(--surface-2));\n  border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);\n}\n.sw-bar__fill { position:absolute; left:0; top:0; bottom:0; background: color-mix(in srgb, var(--c) 26%, transparent); border-right:2px solid var(--c); }\n.sw-bar__name { position:relative; font-size:13.5px; font-weight:600; letter-spacing:0.05em; color: color-mix(in srgb, var(--c) 55%, white); display:flex; align-items:center; gap:10px; }\n.sw-bar__dot { width:10px;height:10px;border-radius:50%; background:var(--c); box-shadow:0 0 10px var(--c); }\n.sw-bar__val { position:relative; font-size:18px; font-weight:700; font-variant-numeric:tabular-nums; font-family:var(--mono); color: var(--fg); }\n.sw-bar.t1 { --c: var(--t1); } .sw-bar.t2 { --c: var(--t2); } .sw-bar.t3 { --c: var(--t3); } .sw-bar.t4 { --c: var(--t4); }\n.sw-bar.t5 { --c: #71717a; }\n\n/* ---- generic helpers ---- */\n.sw-eyebrow { font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color: var(--fg-faint); }\n.sw-big { font-size:54px; font-weight:800; letter-spacing:-0.03em; line-height:1; }\n.sw-muted { color: var(--fg-muted); }\n.sw-subtle { color: var(--fg-subtle); }\n.flex { display:flex; } .col{flex-direction:column;} .center{align-items:center;justify-content:center;}\n.gap-s{gap:8px;} .gap-m{gap:14px;} .gap-l{gap:20px;}\n.grow{flex:1 1 auto;} .between{justify-content:space-between;}\n\n/* ---- horizontal bar list (mini bar chart) ---- */\n.sw-hbars { display:flex; flex-direction:column; gap:0; height:100%; justify-content:space-around; padding:4px 2px; }\n.sw-hbar { display:flex; flex-direction:column; gap:7px; }\n.sw-hbar__top { display:flex; justify-content:space-between; align-items:baseline; gap:12px; }\n.sw-hbar__name { font-size:13.5px; font-weight:600; color:var(--fg); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n.sw-hbar__val { font-size:13px; font-weight:700; font-family:var(--mono); color:var(--fg-muted); flex:0 0 auto; }\n.sw-hbar__track { height:11px; border-radius:6px; background:var(--surface-3); overflow:hidden; border:1px solid var(--border); }\n.sw-hbar__fill { height:100%; border-radius:6px; box-shadow:0 0 10px -2px currentColor; transition:width 1s ease; }\n\n/* ---- stacked posture bar ---- */\n.sw-stack { display:flex; height:26px; border-radius:8px; overflow:hidden; border:1px solid var(--border); }\n.sw-stack > div { height:100%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#0a0a0a; }\n.sw-legend { display:flex; gap:18px; margin-top:14px; flex-wrap:wrap; }\n.sw-legend > div { display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--fg-muted); }\n.sw-legend i { width:10px; height:10px; border-radius:3px; display:inline-block; }\n\n@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }\n@keyframes countup { from { opacity:0; } to { opacity:1; } }\n@keyframes sweep { to { transform: rotate(360deg); } }\n@keyframes dash { to { stroke-dashoffset: 0; } }\n@keyframes arcflow { to { stroke-dashoffset: -1000; } }\n@keyframes blip { 0%{transform:scale(0.2);opacity:0.9;} 100%{transform:scale(2.4);opacity:0;} }\n\n/* ----------------------------------------------------- loading / skeleton -- */\n/* Slow, low-contrast shimmer — safe for an always-on 24/7 video wall. */\n@keyframes sw-shimmer { 100% { transform: translateX(100%); } }\n.sw-skel {\n  position: relative; overflow: hidden;\n  background: var(--surface-2);\n  border-radius: var(--radius-xs);\n}\n.sw-skel::after {\n  content: \"\"; position: absolute; inset: 0; transform: translateX(-100%);\n  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent);\n  animation: sw-shimmer 1.6s ease-in-out infinite;\n}\n.sw-skel-ring { position: absolute; border: 2px solid var(--border); border-radius: 50%; }\n/* card chrome stays crisp while the body shimmers; a hair dimmer signals \"not live yet\" */\n.sw-skel-card .sw-card__title { opacity: 0.78; }\n\n/* ring spinner — reuses the sweep keyframe (refresh indicator / inline fallback) */\n.sw-spin { animation: sweep 0.9s linear infinite; transform-origin: center; }\n\n/* topbar \"refreshing\" indicator — subtle, no layout shift, never a full skeleton */\n.sw-refreshing { display: inline-flex; align-items: center; gap: 8px; color: var(--fg-subtle); font-size: 12px; letter-spacing: 0.04em; }\n.sw-stale { color: color-mix(in srgb, var(--yellow) 70%, white) !important; }\n";

/* ===== world-dots basemap                                              ===== */

window.SW_WORLD = {"dots":[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],[21,0],[22,0],[23,0],[24,0],[25,0],[26,0],[27,0],[28,0],[29,0],[30,0],[31,0],[32,0],[33,0],[34,0],[35,0],[36,0],[37,0],[38,0],[39,0],[40,0],[41,0],[42,0],[43,0],[44,0],[45,0],[46,0],[47,0],[48,0],[49,0],[50,0],[51,0],[52,0],[53,0],[54,0],[55,0],[56,0],[57,0],[58,0],[59,0],[60,0],[61,0],[62,0],[63,0],[64,0],[65,0],[66,0],[67,0],[68,0],[69,0],[70,0],[71,0],[72,0],[73,0],[74,0],[75,0],[76,0],[77,0],[78,0],[79,0],[80,0],[81,0],[82,0],[83,0],[84,0],[85,0],[86,0],[87,0],[88,0],[89,0],[90,0],[91,0],[92,0],[93,0],[94,0],[95,0],[96,0],[97,0],[98,0],[99,0],[100,0],[101,0],[102,0],[103,0],[104,0],[105,0],[106,0],[107,0],[108,0],[109,0],[110,0],[111,0],[112,0],[113,0],[114,0],[115,0],[116,0],[117,0],[118,0],[119,0],[120,0],[121,0],[122,0],[123,0],[124,0],[125,0],[126,0],[127,0],[128,0],[129,0],[130,0],[131,0],[132,0],[133,0],[134,0],[135,0],[136,0],[137,0],[138,0],[139,0],[140,0],[141,0],[142,0],[143,0],[144,0],[145,0],[146,0],[147,0],[148,0],[149,0],[150,0],[151,0],[152,0],[153,0],[154,0],[155,0],[156,0],[157,0],[158,0],[159,0],[160,0],[161,0],[162,0],[163,0],[164,0],[165,0],[166,0],[167,0],[0,1],[167,1],[0,2],[167,2],[0,3],[167,3],[0,4],[43,4],[44,4],[45,4],[46,4],[47,4],[48,4],[49,4],[50,4],[51,4],[55,4],[56,4],[57,4],[58,4],[59,4],[60,4],[62,4],[63,4],[64,4],[65,4],[66,4],[67,4],[68,4],[69,4],[70,4],[71,4],[72,4],[74,4],[75,4],[76,4],[77,4],[110,4],[167,4],[0,5],[35,5],[41,5],[42,5],[43,5],[44,5],[45,5],[46,5],[47,5],[54,5],[55,5],[56,5],[57,5],[58,5],[59,5],[60,5],[61,5],[62,5],[63,5],[64,5],[65,5],[66,5],[67,5],[68,5],[69,5],[70,5],[71,5],[72,5],[73,5],[74,5],[90,5],[91,5],[92,5],[123,5],[124,5],[128,5],[129,5],[131,5],[167,5],[0,6],[28,6],[43,6],[44,6],[45,6],[46,6],[51,6],[52,6],[53,6],[54,6],[55,6],[56,6],[57,6],[58,6],[59,6],[60,6],[61,6],[62,6],[63,6],[64,6],[65,6],[66,6],[67,6],[68,6],[69,6],[70,6],[71,6],[73,6],[74,6],[75,6],[128,6],[131,6],[132,6],[133,6],[167,6],[0,7],[7,7],[32,7],[38,7],[40,7],[41,7],[42,7],[43,7],[44,7],[45,7],[46,7],[58,7],[59,7],[60,7],[61,7],[62,7],[63,7],[64,7],[65,7],[66,7],[67,7],[68,7],[69,7],[70,7],[71,7],[72,7],[73,7],[74,7],[110,7],[111,7],[124,7],[125,7],[126,7],[127,7],[128,7],[129,7],[130,7],[131,7],[132,7],[133,7],[134,7],[135,7],[146,7],[148,7],[149,7],[150,7],[151,7],[152,7],[153,7],[154,7],[160,7],[167,7],[0,8],[5,8],[26,8],[27,8],[28,8],[30,8],[31,8],[34,8],[36,8],[37,8],[38,8],[42,8],[43,8],[44,8],[45,8],[46,8],[58,8],[59,8],[60,8],[61,8],[62,8],[63,8],[64,8],[65,8],[66,8],[67,8],[68,8],[69,8],[70,8],[73,8],[108,8],[109,8],[116,8],[117,8],[118,8],[119,8],[120,8],[121,8],[122,8],[123,8],[124,8],[125,8],[126,8],[127,8],[128,8],[129,8],[130,8],[131,8],[132,8],[133,8],[134,8],[135,8],[136,8],[137,8],[138,8],[139,8],[140,8],[141,8],[142,8],[143,8],[144,8],[149,8],[150,8],[151,8],[152,8],[153,8],[160,8],[165,8],[167,8],[0,9],[7,9],[9,9],[10,9],[11,9],[12,9],[13,9],[14,9],[24,9],[32,9],[33,9],[34,9],[35,9],[39,9],[40,9],[43,9],[44,9],[45,9],[46,9],[47,9],[48,9],[49,9],[50,9],[51,9],[59,9],[60,9],[61,9],[62,9],[63,9],[64,9],[65,9],[66,9],[67,9],[68,9],[69,9],[70,9],[71,9],[94,9],[95,9],[96,9],[97,9],[115,9],[116,9],[117,9],[118,9],[119,9],[120,9],[121,9],[122,9],[123,9],[124,9],[125,9],[126,9],[127,9],[128,9],[129,9],[130,9],[131,9],[132,9],[133,9],[134,9],[135,9],[136,9],[137,9],[138,9],[139,9],[140,9],[141,9],[142,9],[143,9],[144,9],[145,9],[146,9],[147,9],[148,9],[149,9],[150,9],[151,9],[152,9],[153,9],[154,9],[155,9],[156,9],[157,9],[158,9],[159,9],[167,9],[0,10],[1,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[13,10],[14,10],[15,10],[16,10],[17,10],[18,10],[19,10],[20,10],[21,10],[22,10],[23,10],[24,10],[25,10],[26,10],[27,10],[28,10],[29,10],[30,10],[34,10],[35,10],[40,10],[41,10],[42,10],[44,10],[45,10],[49,10],[50,10],[51,10],[52,10],[59,10],[60,10],[61,10],[62,10],[63,10],[64,10],[65,10],[66,10],[67,10],[68,10],[69,10],[91,10],[92,10],[93,10],[94,10],[95,10],[96,10],[97,10],[98,10],[99,10],[100,10],[101,10],[104,10],[105,10],[108,10],[109,10],[110,10],[111,10],[112,10],[113,10],[114,10],[115,10],[116,10],[117,10],[118,10],[119,10],[120,10],[121,10],[122,10],[123,10],[124,10],[125,10],[126,10],[127,10],[129,10],[130,10],[131,10],[132,10],[133,10],[134,10],[135,10],[136,10],[137,10],[138,10],[139,10],[140,10],[141,10],[142,10],[143,10],[144,10],[145,10],[146,10],[147,10],[148,10],[149,10],[150,10],[151,10],[152,10],[153,10],[154,10],[155,10],[156,10],[157,10],[158,10],[159,10],[160,10],[161,10],[162,10],[163,10],[164,10],[165,10],[166,10],[167,10],[0,11],[1,11],[2,11],[3,11],[4,11],[7,11],[9,11],[10,11],[11,11],[12,11],[13,11],[14,11],[15,11],[16,11],[17,11],[18,11],[19,11],[20,11],[21,11],[22,11],[23,11],[24,11],[25,11],[29,11],[30,11],[32,11],[33,11],[34,11],[35,11],[36,11],[37,11],[38,11],[39,11],[40,11],[41,11],[42,11],[43,11],[50,11],[52,11],[53,11],[54,11],[59,11],[60,11],[61,11],[62,11],[63,11],[64,11],[65,11],[66,11],[73,11],[76,11],[90,11],[91,11],[92,11],[93,11],[94,11],[95,11],[96,11],[97,11],[98,11],[99,11],[101,11],[102,11],[103,11],[104,11],[105,11],[106,11],[107,11],[108,11],[109,11],[110,11],[111,11],[112,11],[113,11],[114,11],[115,11],[116,11],[117,11],[118,11],[119,11],[120,11],[121,11],[122,11],[123,11],[124,11],[125,11],[126,11],[127,11],[128,11],[129,11],[130,11],[131,11],[132,11],[133,11],[134,11],[135,11],[136,11],[137,11],[138,11],[139,11],[140,11],[141,11],[142,11],[143,11],[144,11],[145,11],[146,11],[147,11],[148,11],[149,11],[150,11],[151,11],[152,11],[153,11],[154,11],[155,11],[156,11],[157,11],[158,11],[159,11],[160,11],[161,11],[162,11],[163,11],[164,11],[165,11],[166,11],[167,11],[0,12],[7,12],[9,12],[10,12],[11,12],[12,12],[13,12],[14,12],[15,12],[16,12],[17,12],[18,12],[19,12],[20,12],[21,12],[22,12],[23,12],[24,12],[25,12],[26,12],[27,12],[28,12],[29,12],[30,12],[31,12],[32,12],[33,12],[34,12],[35,12],[36,12],[37,12],[38,12],[39,12],[40,12],[41,12],[42,12],[44,12],[45,12],[46,12],[50,12],[51,12],[52,12],[60,12],[61,12],[62,12],[63,12],[64,12],[73,12],[74,12],[75,12],[89,12],[90,12],[91,12],[92,12],[93,12],[95,12],[96,12],[97,12],[98,12],[99,12],[100,12],[101,12],[102,12],[103,12],[104,12],[105,12],[106,12],[107,12],[108,12],[109,12],[110,12],[111,12],[112,12],[113,12],[114,12],[115,12],[116,12],[117,12],[118,12],[119,12],[120,12],[121,12],[122,12],[123,12],[124,12],[125,12],[126,12],[127,12],[128,12],[129,12],[130,12],[131,12],[132,12],[133,12],[134,12],[135,12],[136,12],[137,12],[138,12],[139,12],[140,12],[141,12],[142,12],[143,12],[144,12],[145,12],[146,12],[147,12],[148,12],[149,12],[150,12],[151,12],[152,12],[153,12],[154,12],[155,12],[156,12],[157,12],[158,12],[159,12],[160,12],[161,12],[162,12],[163,12],[164,12],[165,12],[166,12],[167,12],[0,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],[14,13],[15,13],[16,13],[17,13],[18,13],[19,13],[20,13],[21,13],[22,13],[23,13],[24,13],[25,13],[26,13],[27,13],[28,13],[29,13],[30,13],[31,13],[32,13],[33,13],[34,13],[35,13],[36,13],[37,13],[38,13],[39,13],[40,13],[48,13],[49,13],[50,13],[61,13],[62,13],[63,13],[86,13],[87,13],[88,13],[89,13],[90,13],[91,13],[94,13],[95,13],[96,13],[97,13],[98,13],[99,13],[101,13],[102,13],[103,13],[104,13],[105,13],[106,13],[107,13],[108,13],[109,13],[110,13],[111,13],[112,13],[113,13],[114,13],[115,13],[116,13],[117,13],[118,13],[119,13],[120,13],[121,13],[122,13],[123,13],[124,13],[125,13],[126,13],[127,13],[128,13],[129,13],[130,13],[131,13],[132,13],[133,13],[134,13],[135,13],[136,13],[137,13],[138,13],[139,13],[140,13],[141,13],[142,13],[143,13],[144,13],[145,13],[146,13],[147,13],[148,13],[149,13],[150,13],[151,13],[152,13],[153,13],[154,13],[155,13],[156,13],[157,13],[158,13],[159,13],[160,13],[161,13],[162,13],[163,13],[164,13],[167,13],[0,14],[8,14],[9,14],[10,14],[11,14],[12,14],[14,14],[19,14],[20,14],[21,14],[22,14],[23,14],[24,14],[25,14],[26,14],[27,14],[28,14],[29,14],[30,14],[31,14],[32,14],[33,14],[34,14],[35,14],[36,14],[37,14],[38,14],[39,14],[48,14],[49,14],[50,14],[51,14],[86,14],[87,14],[88,14],[89,14],[90,14],[91,14],[92,14],[97,14],[98,14],[99,14],[100,14],[101,14],[102,14],[103,14],[104,14],[105,14],[106,14],[107,14],[108,14],[109,14],[110,14],[111,14],[112,14],[113,14],[114,14],[115,14],[116,14],[117,14],[118,14],[119,14],[120,14],[121,14],[122,14],[123,14],[124,14],[125,14],[126,14],[127,14],[128,14],[129,14],[130,14],[131,14],[132,14],[133,14],[134,14],[135,14],[136,14],[137,14],[138,14],[139,14],[140,14],[141,14],[142,14],[143,14],[144,14],[145,14],[146,14],[147,14],[148,14],[149,14],[150,14],[151,14],[152,14],[153,14],[154,14],[155,14],[159,14],[167,14],[0,15],[11,15],[12,15],[22,15],[23,15],[24,15],[25,15],[26,15],[27,15],[28,15],[29,15],[30,15],[31,15],[32,15],[33,15],[34,15],[35,15],[37,15],[38,15],[39,15],[40,15],[48,15],[49,15],[50,15],[51,15],[52,15],[53,15],[54,15],[81,15],[82,15],[88,15],[89,15],[90,15],[91,15],[92,15],[94,15],[95,15],[96,15],[97,15],[98,15],[99,15],[100,15],[101,15],[102,15],[103,15],[104,15],[105,15],[106,15],[107,15],[108,15],[109,15],[110,15],[111,15],[112,15],[113,15],[114,15],[115,15],[116,15],[117,15],[118,15],[119,15],[120,15],[121,15],[122,15],[123,15],[124,15],[125,15],[126,15],[127,15],[128,15],[129,15],[130,15],[131,15],[132,15],[133,15],[134,15],[135,15],[136,15],[137,15],[138,15],[139,15],[140,15],[141,15],[142,15],[143,15],[144,15],[145,15],[146,15],[147,15],[148,15],[157,15],[158,15],[159,15],[167,15],[0,16],[8,16],[9,16],[22,16],[23,16],[24,16],[25,16],[26,16],[27,16],[28,16],[29,16],[30,16],[31,16],[32,16],[33,16],[34,16],[35,16],[36,16],[37,16],[38,16],[39,16],[40,16],[41,16],[42,16],[43,16],[44,16],[45,16],[48,16],[49,16],[50,16],[51,16],[52,16],[53,16],[54,16],[55,16],[82,16],[88,16],[89,16],[94,16],[95,16],[96,16],[97,16],[98,16],[99,16],[100,16],[101,16],[102,16],[103,16],[104,16],[105,16],[106,16],[107,16],[108,16],[109,16],[110,16],[111,16],[112,16],[113,16],[114,16],[115,16],[116,16],[117,16],[118,16],[119,16],[120,16],[121,16],[122,16],[123,16],[124,16],[125,16],[126,16],[127,16],[128,16],[129,16],[130,16],[131,16],[132,16],[133,16],[134,16],[135,16],[136,16],[137,16],[138,16],[139,16],[140,16],[141,16],[142,16],[143,16],[144,16],[145,16],[146,16],[156,16],[157,16],[158,16],[167,16],[0,17],[7,17],[22,17],[24,17],[25,17],[26,17],[27,17],[28,17],[29,17],[30,17],[31,17],[32,17],[33,17],[34,17],[35,17],[36,17],[37,17],[38,17],[39,17],[40,17],[41,17],[42,17],[43,17],[44,17],[45,17],[46,17],[47,17],[48,17],[49,17],[50,17],[51,17],[52,17],[53,17],[54,17],[55,17],[56,17],[57,17],[79,17],[80,17],[82,17],[83,17],[84,17],[85,17],[86,17],[87,17],[88,17],[89,17],[90,17],[91,17],[92,17],[93,17],[94,17],[95,17],[96,17],[97,17],[98,17],[99,17],[100,17],[101,17],[102,17],[103,17],[104,17],[105,17],[106,17],[107,17],[108,17],[109,17],[110,17],[111,17],[112,17],[113,17],[114,17],[115,17],[116,17],[117,17],[118,17],[119,17],[120,17],[121,17],[122,17],[123,17],[124,17],[125,17],[126,17],[127,17],[128,17],[129,17],[130,17],[131,17],[132,17],[133,17],[134,17],[135,17],[136,17],[137,17],[138,17],[139,17],[140,17],[141,17],[142,17],[143,17],[144,17],[145,17],[146,17],[147,17],[148,17],[149,17],[156,17],[157,17],[167,17],[0,18],[25,18],[26,18],[27,18],[28,18],[29,18],[30,18],[31,18],[32,18],[33,18],[34,18],[35,18],[36,18],[37,18],[38,18],[39,18],[40,18],[41,18],[42,18],[43,18],[44,18],[45,18],[46,18],[47,18],[48,18],[49,18],[50,18],[51,18],[52,18],[53,18],[54,18],[55,18],[56,18],[82,18],[83,18],[85,18],[86,18],[87,18],[88,18],[89,18],[90,18],[91,18],[92,18],[93,18],[94,18],[95,18],[96,18],[97,18],[98,18],[99,18],[100,18],[101,18],[102,18],[103,18],[104,18],[105,18],[106,18],[107,18],[108,18],[109,18],[110,18],[111,18],[112,18],[113,18],[114,18],[115,18],[116,18],[117,18],[118,18],[119,18],[120,18],[121,18],[122,18],[123,18],[124,18],[125,18],[126,18],[127,18],[128,18],[129,18],[130,18],[131,18],[132,18],[133,18],[134,18],[135,18],[136,18],[137,18],[138,18],[139,18],[140,18],[141,18],[142,18],[143,18],[144,18],[145,18],[146,18],[147,18],[148,18],[150,18],[167,18],[0,19],[26,19],[27,19],[28,19],[29,19],[30,19],[31,19],[32,19],[33,19],[34,19],[35,19],[36,19],[37,19],[38,19],[39,19],[40,19],[41,19],[42,19],[43,19],[44,19],[45,19],[46,19],[47,19],[48,19],[49,19],[50,19],[51,19],[53,19],[57,19],[58,19],[82,19],[83,19],[84,19],[85,19],[86,19],[87,19],[88,19],[89,19],[90,19],[91,19],[92,19],[93,19],[94,19],[95,19],[96,19],[97,19],[98,19],[99,19],[100,19],[101,19],[102,19],[103,19],[104,19],[105,19],[106,19],[107,19],[108,19],[109,19],[110,19],[111,19],[112,19],[113,19],[114,19],[115,19],[116,19],[117,19],[118,19],[119,19],[120,19],[121,19],[122,19],[123,19],[124,19],[125,19],[126,19],[127,19],[128,19],[129,19],[130,19],[131,19],[132,19],[133,19],[134,19],[135,19],[136,19],[137,19],[138,19],[139,19],[140,19],[141,19],[142,19],[143,19],[144,19],[145,19],[146,19],[147,19],[148,19],[167,19],[0,20],[26,20],[27,20],[28,20],[29,20],[30,20],[31,20],[32,20],[33,20],[34,20],[35,20],[36,20],[37,20],[38,20],[39,20],[40,20],[41,20],[42,20],[44,20],[45,20],[46,20],[47,20],[48,20],[49,20],[50,20],[51,20],[52,20],[53,20],[83,20],[84,20],[85,20],[86,20],[87,20],[88,20],[89,20],[90,20],[91,20],[92,20],[93,20],[94,20],[95,20],[96,20],[97,20],[98,20],[99,20],[100,20],[101,20],[102,20],[103,20],[104,20],[105,20],[106,20],[107,20],[108,20],[109,20],[110,20],[111,20],[112,20],[113,20],[114,20],[115,20],[116,20],[117,20],[118,20],[119,20],[121,20],[122,20],[123,20],[124,20],[125,20],[126,20],[127,20],[128,20],[129,20],[130,20],[131,20],[132,20],[133,20],[134,20],[135,20],[136,20],[137,20],[138,20],[139,20],[140,20],[141,20],[142,20],[143,20],[144,20],[145,20],[146,20],[147,20],[150,20],[167,20],[0,21],[26,21],[27,21],[28,21],[29,21],[30,21],[31,21],[32,21],[33,21],[34,21],[35,21],[36,21],[37,21],[38,21],[39,21],[40,21],[41,21],[42,21],[44,21],[46,21],[47,21],[48,21],[49,21],[50,21],[51,21],[52,21],[53,21],[83,21],[84,21],[85,21],[86,21],[87,21],[88,21],[89,21],[91,21],[92,21],[93,21],[94,21],[95,21],[96,21],[102,21],[103,21],[104,21],[105,21],[107,21],[108,21],[109,21],[110,21],[111,21],[112,21],[113,21],[114,21],[115,21],[116,21],[117,21],[118,21],[119,21],[120,21],[121,21],[122,21],[123,21],[124,21],[125,21],[126,21],[127,21],[128,21],[129,21],[130,21],[131,21],[132,21],[133,21],[134,21],[135,21],[136,21],[137,21],[138,21],[139,21],[140,21],[141,21],[142,21],[143,21],[144,21],[145,21],[146,21],[167,21],[0,22],[26,22],[27,22],[28,22],[29,22],[30,22],[31,22],[32,22],[33,22],[34,22],[35,22],[36,22],[37,22],[38,22],[39,22],[40,22],[41,22],[42,22],[44,22],[45,22],[47,22],[48,22],[49,22],[50,22],[80,22],[81,22],[82,22],[83,22],[84,22],[89,22],[90,22],[93,22],[94,22],[95,22],[96,22],[103,22],[104,22],[105,22],[108,22],[109,22],[110,22],[111,22],[112,22],[113,22],[114,22],[115,22],[116,22],[117,22],[118,22],[120,22],[121,22],[122,22],[123,22],[124,22],[125,22],[126,22],[127,22],[128,22],[129,22],[130,22],[131,22],[132,22],[133,22],[134,22],[135,22],[136,22],[137,22],[138,22],[139,22],[140,22],[141,22],[142,22],[143,22],[144,22],[150,22],[167,22],[0,23],[26,23],[27,23],[28,23],[29,23],[30,23],[31,23],[32,23],[33,23],[34,23],[35,23],[36,23],[37,23],[38,23],[39,23],[40,23],[41,23],[42,23],[43,23],[44,23],[45,23],[46,23],[47,23],[48,23],[49,23],[80,23],[81,23],[82,23],[83,23],[91,23],[92,23],[93,23],[96,23],[97,23],[98,23],[99,23],[100,23],[101,23],[102,23],[103,23],[104,23],[105,23],[106,23],[108,23],[109,23],[110,23],[111,23],[112,23],[113,23],[114,23],[115,23],[116,23],[117,23],[118,23],[119,23],[120,23],[121,23],[122,23],[123,23],[124,23],[125,23],[126,23],[127,23],[128,23],[129,23],[130,23],[131,23],[132,23],[133,23],[134,23],[135,23],[136,23],[137,23],[138,23],[139,23],[140,23],[141,23],[142,23],[143,23],[149,23],[167,23],[0,24],[27,24],[28,24],[29,24],[30,24],[31,24],[32,24],[33,24],[34,24],[35,24],[36,24],[37,24],[38,24],[39,24],[40,24],[41,24],[42,24],[43,24],[44,24],[45,24],[46,24],[47,24],[48,24],[80,24],[81,24],[82,24],[83,24],[90,24],[94,24],[97,24],[98,24],[99,24],[100,24],[101,24],[102,24],[103,24],[104,24],[105,24],[106,24],[109,24],[110,24],[111,24],[112,24],[113,24],[114,24],[115,24],[116,24],[117,24],[118,24],[119,24],[120,24],[121,24],[122,24],[123,24],[124,24],[125,24],[126,24],[127,24],[128,24],[129,24],[130,24],[131,24],[132,24],[133,24],[134,24],[135,24],[136,24],[137,24],[138,24],[139,24],[142,24],[143,24],[148,24],[167,24],[0,25],[28,25],[29,25],[30,25],[31,25],[32,25],[33,25],[34,25],[35,25],[36,25],[37,25],[38,25],[39,25],[40,25],[41,25],[42,25],[43,25],[44,25],[45,25],[46,25],[47,25],[48,25],[81,25],[84,25],[85,25],[86,25],[87,25],[88,25],[101,25],[102,25],[103,25],[104,25],[105,25],[106,25],[107,25],[108,25],[109,25],[110,25],[111,25],[112,25],[113,25],[114,25],[115,25],[116,25],[117,25],[118,25],[119,25],[120,25],[121,25],[122,25],[123,25],[124,25],[125,25],[126,25],[127,25],[128,25],[129,25],[130,25],[131,25],[132,25],[133,25],[134,25],[135,25],[136,25],[137,25],[138,25],[139,25],[143,25],[147,25],[148,25],[167,25],[0,26],[29,26],[30,26],[31,26],[32,26],[33,26],[34,26],[35,26],[36,26],[37,26],[38,26],[39,26],[40,26],[41,26],[42,26],[43,26],[44,26],[45,26],[46,26],[47,26],[81,26],[82,26],[83,26],[84,26],[85,26],[86,26],[87,26],[88,26],[100,26],[101,26],[102,26],[103,26],[104,26],[105,26],[106,26],[107,26],[108,26],[109,26],[110,26],[111,26],[112,26],[113,26],[114,26],[115,26],[116,26],[117,26],[118,26],[119,26],[120,26],[121,26],[122,26],[123,26],[124,26],[125,26],[126,26],[127,26],[128,26],[129,26],[130,26],[131,26],[132,26],[133,26],[134,26],[135,26],[136,26],[137,26],[138,26],[139,26],[140,26],[144,26],[145,26],[167,26],[0,27],[30,27],[31,27],[32,27],[33,27],[34,27],[35,27],[36,27],[37,27],[38,27],[39,27],[40,27],[41,27],[42,27],[43,27],[44,27],[45,27],[79,27],[80,27],[81,27],[82,27],[83,27],[84,27],[85,27],[86,27],[87,27],[88,27],[89,27],[90,27],[93,27],[94,27],[95,27],[98,27],[100,27],[101,27],[102,27],[103,27],[104,27],[105,27],[106,27],[107,27],[108,27],[109,27],[110,27],[111,27],[112,27],[113,27],[114,27],[115,27],[116,27],[117,27],[118,27],[119,27],[120,27],[121,27],[122,27],[123,27],[124,27],[125,27],[126,27],[127,27],[128,27],[129,27],[130,27],[131,27],[132,27],[133,27],[134,27],[135,27],[136,27],[137,27],[138,27],[139,27],[140,27],[144,27],[167,27],[0,28],[31,28],[32,28],[33,28],[34,28],[35,28],[36,28],[37,28],[38,28],[39,28],[41,28],[42,28],[45,28],[79,28],[80,28],[81,28],[82,28],[83,28],[84,28],[85,28],[86,28],[87,28],[88,28],[89,28],[90,28],[91,28],[92,28],[93,28],[94,28],[95,28],[96,28],[97,28],[98,28],[99,28],[100,28],[101,28],[102,28],[103,28],[104,28],[105,28],[106,28],[107,28],[108,28],[109,28],[110,28],[111,28],[112,28],[113,28],[114,28],[115,28],[116,28],[117,28],[118,28],[119,28],[120,28],[121,28],[122,28],[123,28],[124,28],[125,28],[126,28],[127,28],[128,28],[129,28],[130,28],[131,28],[132,28],[133,28],[134,28],[135,28],[136,28],[137,28],[138,28],[139,28],[140,28],[167,28],[0,29],[31,29],[33,29],[34,29],[35,29],[36,29],[37,29],[38,29],[46,29],[78,29],[79,29],[80,29],[81,29],[82,29],[83,29],[84,29],[85,29],[86,29],[87,29],[88,29],[89,29],[90,29],[91,29],[92,29],[93,29],[94,29],[95,29],[96,29],[97,29],[98,29],[99,29],[101,29],[102,29],[103,29],[104,29],[105,29],[106,29],[108,29],[109,29],[110,29],[111,29],[112,29],[113,29],[114,29],[115,29],[116,29],[117,29],[118,29],[119,29],[120,29],[121,29],[122,29],[123,29],[124,29],[125,29],[126,29],[127,29],[128,29],[129,29],[130,29],[131,29],[132,29],[133,29],[134,29],[135,29],[136,29],[137,29],[138,29],[139,29],[167,29],[0,30],[32,30],[34,30],[35,30],[36,30],[37,30],[38,30],[46,30],[77,30],[78,30],[79,30],[80,30],[81,30],[82,30],[83,30],[84,30],[85,30],[86,30],[87,30],[88,30],[89,30],[90,30],[91,30],[92,30],[93,30],[94,30],[95,30],[96,30],[97,30],[98,30],[99,30],[101,30],[102,30],[103,30],[104,30],[105,30],[106,30],[107,30],[109,30],[115,30],[116,30],[117,30],[118,30],[119,30],[120,30],[121,30],[122,30],[123,30],[124,30],[125,30],[126,30],[127,30],[128,30],[129,30],[130,30],[131,30],[132,30],[133,30],[134,30],[135,30],[136,30],[137,30],[138,30],[167,30],[0,31],[35,31],[36,31],[37,31],[38,31],[45,31],[46,31],[76,31],[77,31],[78,31],[79,31],[80,31],[81,31],[82,31],[83,31],[84,31],[85,31],[86,31],[87,31],[88,31],[89,31],[90,31],[91,31],[92,31],[93,31],[94,31],[95,31],[96,31],[97,31],[98,31],[99,31],[100,31],[102,31],[103,31],[104,31],[105,31],[106,31],[107,31],[108,31],[109,31],[110,31],[111,31],[116,31],[117,31],[118,31],[119,31],[120,31],[121,31],[122,31],[123,31],[124,31],[125,31],[126,31],[127,31],[128,31],[129,31],[130,31],[131,31],[132,31],[133,31],[134,31],[135,31],[136,31],[137,31],[167,31],[0,32],[11,32],[35,32],[36,32],[37,32],[38,32],[42,32],[43,32],[48,32],[76,32],[77,32],[78,32],[79,32],[80,32],[81,32],[82,32],[83,32],[84,32],[85,32],[86,32],[87,32],[88,32],[89,32],[90,32],[91,32],[92,32],[93,32],[94,32],[95,32],[96,32],[97,32],[98,32],[99,32],[100,32],[102,32],[103,32],[104,32],[105,32],[106,32],[107,32],[108,32],[109,32],[110,32],[117,32],[118,32],[119,32],[120,32],[121,32],[122,32],[123,32],[127,32],[128,32],[129,32],[130,32],[131,32],[132,32],[133,32],[167,32],[0,33],[36,33],[37,33],[38,33],[39,33],[41,33],[42,33],[49,33],[50,33],[51,33],[53,33],[76,33],[77,33],[78,33],[79,33],[80,33],[81,33],[82,33],[83,33],[84,33],[85,33],[86,33],[87,33],[88,33],[89,33],[90,33],[91,33],[92,33],[93,33],[94,33],[95,33],[96,33],[97,33],[98,33],[99,33],[100,33],[101,33],[103,33],[104,33],[105,33],[106,33],[107,33],[108,33],[109,33],[118,33],[119,33],[120,33],[121,33],[122,33],[128,33],[129,33],[130,33],[131,33],[132,33],[134,33],[167,33],[0,34],[38,34],[39,34],[40,34],[41,34],[42,34],[55,34],[76,34],[77,34],[78,34],[79,34],[80,34],[81,34],[82,34],[83,34],[84,34],[85,34],[86,34],[87,34],[88,34],[89,34],[90,34],[91,34],[92,34],[93,34],[94,34],[95,34],[96,34],[97,34],[98,34],[99,34],[100,34],[101,34],[104,34],[105,34],[106,34],[107,34],[118,34],[119,34],[120,34],[121,34],[128,34],[129,34],[130,34],[131,34],[132,34],[133,34],[140,34],[167,34],[0,35],[41,35],[42,35],[43,35],[44,35],[76,35],[77,35],[78,35],[79,35],[80,35],[81,35],[82,35],[83,35],[84,35],[85,35],[86,35],[87,35],[88,35],[89,35],[90,35],[91,35],[92,35],[93,35],[94,35],[95,35],[96,35],[97,35],[98,35],[99,35],[100,35],[101,35],[102,35],[104,35],[105,35],[106,35],[119,35],[120,35],[129,35],[130,35],[131,35],[132,35],[133,35],[134,35],[167,35],[0,36],[44,36],[50,36],[51,36],[76,36],[77,36],[78,36],[79,36],[80,36],[81,36],[82,36],[83,36],[84,36],[85,36],[86,36],[87,36],[88,36],[89,36],[90,36],[91,36],[92,36],[93,36],[94,36],[95,36],[96,36],[97,36],[98,36],[99,36],[100,36],[101,36],[102,36],[103,36],[107,36],[119,36],[120,36],[129,36],[132,36],[133,36],[134,36],[140,36],[141,36],[167,36],[0,37],[44,37],[45,37],[49,37],[50,37],[51,37],[52,37],[53,37],[54,37],[55,37],[78,37],[79,37],[80,37],[81,37],[82,37],[83,37],[84,37],[85,37],[86,37],[87,37],[88,37],[89,37],[90,37],[91,37],[92,37],[93,37],[94,37],[95,37],[96,37],[97,37],[98,37],[99,37],[100,37],[101,37],[102,37],[103,37],[104,37],[105,37],[106,37],[107,37],[119,37],[120,37],[133,37],[141,37],[142,37],[167,37],[0,38],[46,38],[48,38],[49,38],[50,38],[51,38],[52,38],[53,38],[54,38],[55,38],[56,38],[78,38],[79,38],[80,38],[81,38],[82,38],[83,38],[84,38],[85,38],[86,38],[87,38],[88,38],[89,38],[90,38],[91,38],[92,38],[93,38],[94,38],[95,38],[96,38],[97,38],[98,38],[99,38],[100,38],[101,38],[102,38],[103,38],[104,38],[105,38],[106,38],[121,38],[130,38],[141,38],[142,38],[167,38],[0,39],[48,39],[49,39],[50,39],[51,39],[52,39],[53,39],[54,39],[55,39],[56,39],[57,39],[58,39],[59,39],[80,39],[81,39],[82,39],[83,39],[86,39],[87,39],[88,39],[89,39],[90,39],[91,39],[92,39],[93,39],[94,39],[95,39],[96,39],[97,39],[98,39],[99,39],[100,39],[101,39],[102,39],[103,39],[104,39],[105,39],[106,39],[130,39],[131,39],[137,39],[138,39],[167,39],[0,40],[48,40],[49,40],[50,40],[51,40],[52,40],[53,40],[54,40],[55,40],[56,40],[57,40],[58,40],[59,40],[60,40],[89,40],[90,40],[91,40],[92,40],[93,40],[94,40],[95,40],[96,40],[97,40],[98,40],[99,40],[100,40],[101,40],[102,40],[103,40],[104,40],[105,40],[129,40],[131,40],[136,40],[137,40],[138,40],[167,40],[0,41],[47,41],[48,41],[49,41],[50,41],[51,41],[52,41],[53,41],[54,41],[55,41],[56,41],[57,41],[58,41],[59,41],[60,41],[61,41],[88,41],[89,41],[90,41],[91,41],[92,41],[93,41],[94,41],[95,41],[96,41],[97,41],[98,41],[99,41],[100,41],[101,41],[102,41],[103,41],[130,41],[131,41],[134,41],[135,41],[136,41],[137,41],[138,41],[143,41],[167,41],[0,42],[47,42],[48,42],[49,42],[50,42],[51,42],[52,42],[53,42],[54,42],[55,42],[56,42],[57,42],[58,42],[59,42],[60,42],[61,42],[62,42],[88,42],[89,42],[90,42],[91,42],[92,42],[93,42],[94,42],[95,42],[96,42],[97,42],[98,42],[99,42],[100,42],[101,42],[102,42],[131,42],[132,42],[135,42],[136,42],[137,42],[139,42],[140,42],[145,42],[167,42],[0,43],[47,43],[48,43],[49,43],[50,43],[51,43],[52,43],[53,43],[54,43],[55,43],[56,43],[57,43],[58,43],[59,43],[60,43],[61,43],[62,43],[63,43],[64,43],[65,43],[89,43],[90,43],[91,43],[92,43],[93,43],[94,43],[95,43],[96,43],[97,43],[98,43],[99,43],[100,43],[101,43],[102,43],[131,43],[132,43],[135,43],[136,43],[137,43],[139,43],[140,43],[142,43],[144,43],[145,43],[146,43],[147,43],[148,43],[149,43],[154,43],[167,43],[0,44],[46,44],[47,44],[48,44],[49,44],[50,44],[51,44],[52,44],[53,44],[54,44],[55,44],[56,44],[57,44],[58,44],[59,44],[60,44],[61,44],[62,44],[63,44],[64,44],[65,44],[66,44],[67,44],[90,44],[91,44],[92,44],[93,44],[94,44],[95,44],[96,44],[97,44],[98,44],[99,44],[100,44],[101,44],[131,44],[132,44],[139,44],[140,44],[148,44],[149,44],[150,44],[151,44],[154,44],[167,44],[0,45],[47,45],[48,45],[49,45],[50,45],[51,45],[52,45],[53,45],[54,45],[55,45],[56,45],[57,45],[58,45],[59,45],[60,45],[61,45],[62,45],[63,45],[64,45],[65,45],[66,45],[67,45],[90,45],[91,45],[92,45],[93,45],[94,45],[95,45],[96,45],[97,45],[98,45],[99,45],[100,45],[101,45],[134,45],[135,45],[148,45],[149,45],[150,45],[151,45],[157,45],[167,45],[0,46],[48,46],[49,46],[50,46],[51,46],[52,46],[53,46],[54,46],[55,46],[56,46],[57,46],[58,46],[59,46],[60,46],[61,46],[62,46],[63,46],[64,46],[65,46],[66,46],[90,46],[91,46],[92,46],[93,46],[94,46],[95,46],[96,46],[97,46],[98,46],[99,46],[100,46],[101,46],[139,46],[141,46],[152,46],[153,46],[158,46],[167,46],[0,47],[48,47],[49,47],[50,47],[51,47],[52,47],[53,47],[54,47],[55,47],[56,47],[57,47],[58,47],[59,47],[60,47],[61,47],[62,47],[63,47],[64,47],[65,47],[66,47],[90,47],[91,47],[92,47],[93,47],[94,47],[95,47],[96,47],[97,47],[98,47],[99,47],[100,47],[101,47],[102,47],[144,47],[145,47],[167,47],[0,48],[49,48],[50,48],[51,48],[52,48],[53,48],[54,48],[55,48],[56,48],[57,48],[58,48],[59,48],[60,48],[61,48],[62,48],[63,48],[64,48],[65,48],[90,48],[91,48],[92,48],[93,48],[94,48],[95,48],[96,48],[97,48],[98,48],[99,48],[100,48],[101,48],[102,48],[106,48],[142,48],[144,48],[145,48],[146,48],[150,48],[167,48],[0,49],[50,49],[51,49],[52,49],[53,49],[54,49],[55,49],[56,49],[57,49],[58,49],[59,49],[60,49],[61,49],[62,49],[63,49],[64,49],[65,49],[89,49],[90,49],[91,49],[92,49],[93,49],[94,49],[95,49],[96,49],[97,49],[98,49],[99,49],[100,49],[101,49],[102,49],[104,49],[105,49],[106,49],[141,49],[142,49],[143,49],[144,49],[145,49],[146,49],[147,49],[149,49],[150,49],[167,49],[0,50],[51,50],[52,50],[53,50],[54,50],[55,50],[56,50],[57,50],[58,50],[59,50],[60,50],[61,50],[62,50],[63,50],[64,50],[65,50],[90,50],[91,50],[92,50],[93,50],[94,50],[95,50],[96,50],[97,50],[98,50],[99,50],[100,50],[104,50],[105,50],[106,50],[141,50],[142,50],[143,50],[144,50],[145,50],[146,50],[147,50],[148,50],[149,50],[150,50],[151,50],[167,50],[0,51],[51,51],[52,51],[53,51],[54,51],[55,51],[56,51],[57,51],[58,51],[59,51],[60,51],[61,51],[62,51],[63,51],[64,51],[90,51],[91,51],[92,51],[93,51],[94,51],[95,51],[96,51],[97,51],[98,51],[99,51],[104,51],[105,51],[106,51],[138,51],[139,51],[140,51],[141,51],[142,51],[143,51],[144,51],[145,51],[146,51],[147,51],[148,51],[149,51],[150,51],[151,51],[152,51],[160,51],[161,51],[167,51],[0,52],[51,52],[52,52],[53,52],[54,52],[55,52],[56,52],[57,52],[58,52],[59,52],[60,52],[61,52],[62,52],[63,52],[64,52],[91,52],[92,52],[93,52],[94,52],[95,52],[96,52],[97,52],[98,52],[99,52],[104,52],[105,52],[137,52],[138,52],[139,52],[140,52],[141,52],[142,52],[143,52],[144,52],[145,52],[146,52],[147,52],[148,52],[149,52],[150,52],[151,52],[152,52],[153,52],[167,52],[0,53],[51,53],[52,53],[53,53],[54,53],[55,53],[56,53],[57,53],[58,53],[59,53],[60,53],[61,53],[91,53],[92,53],[93,53],[94,53],[95,53],[96,53],[97,53],[98,53],[99,53],[104,53],[105,53],[137,53],[138,53],[139,53],[140,53],[141,53],[142,53],[143,53],[144,53],[145,53],[146,53],[147,53],[148,53],[149,53],[150,53],[151,53],[152,53],[153,53],[154,53],[167,53],[0,54],[51,54],[52,54],[53,54],[54,54],[55,54],[56,54],[57,54],[58,54],[59,54],[60,54],[61,54],[91,54],[92,54],[93,54],[94,54],[95,54],[96,54],[97,54],[98,54],[137,54],[138,54],[139,54],[140,54],[141,54],[142,54],[143,54],[144,54],[145,54],[146,54],[147,54],[148,54],[149,54],[150,54],[151,54],[152,54],[153,54],[154,54],[167,54],[0,55],[51,55],[52,55],[53,55],[54,55],[55,55],[56,55],[57,55],[58,55],[59,55],[60,55],[92,55],[93,55],[94,55],[95,55],[96,55],[97,55],[98,55],[137,55],[138,55],[139,55],[140,55],[141,55],[142,55],[143,55],[144,55],[145,55],[146,55],[147,55],[148,55],[149,55],[150,55],[151,55],[152,55],[153,55],[154,55],[167,55],[0,56],[51,56],[52,56],[53,56],[54,56],[55,56],[56,56],[57,56],[58,56],[59,56],[92,56],[93,56],[94,56],[95,56],[96,56],[97,56],[138,56],[139,56],[140,56],[141,56],[142,56],[143,56],[144,56],[145,56],[146,56],[147,56],[148,56],[149,56],[150,56],[151,56],[152,56],[153,56],[154,56],[167,56],[0,57],[51,57],[52,57],[53,57],[54,57],[55,57],[56,57],[57,57],[58,57],[92,57],[93,57],[94,57],[95,57],[137,57],[138,57],[139,57],[140,57],[147,57],[148,57],[149,57],[150,57],[151,57],[152,57],[153,57],[167,57],[0,58],[50,58],[51,58],[52,58],[53,58],[54,58],[55,58],[56,58],[57,58],[147,58],[149,58],[150,58],[151,58],[152,58],[153,58],[164,58],[167,58],[0,59],[50,59],[51,59],[52,59],[53,59],[54,59],[55,59],[56,59],[149,59],[150,59],[151,59],[152,59],[165,59],[166,59],[167,59],[0,60],[50,60],[51,60],[52,60],[53,60],[54,60],[165,60],[167,60],[0,61],[50,61],[51,61],[52,61],[53,61],[54,61],[151,61],[152,61],[163,61],[164,61],[167,61],[0,62],[7,62],[49,62],[50,62],[51,62],[52,62],[53,62],[160,62],[162,62],[167,62],[0,63],[49,63],[50,63],[51,63],[52,63],[167,63],[0,64],[49,64],[50,64],[51,64],[52,64],[167,64],[0,65],[49,65],[50,65],[51,65],[167,65],[0,66],[50,66],[51,66],[167,66],[0,67],[167,67],[0,68],[167,68],[0,69],[167,69],[0,70],[167,70],[0,71],[56,71],[167,71],[0,72],[53,72],[54,72],[55,72],[108,72],[109,72],[128,72],[129,72],[130,72],[131,72],[132,72],[136,72],[137,72],[141,72],[143,72],[144,72],[145,72],[147,72],[167,72],[0,73],[54,73],[55,73],[104,73],[105,73],[106,73],[107,73],[108,73],[109,73],[110,73],[111,73],[112,73],[113,73],[114,73],[115,73],[116,73],[121,73],[122,73],[123,73],[124,73],[125,73],[126,73],[127,73],[128,73],[129,73],[130,73],[131,73],[132,73],[133,73],[134,73],[135,73],[136,73],[137,73],[138,73],[139,73],[140,73],[141,73],[142,73],[143,73],[144,73],[145,73],[146,73],[147,73],[148,73],[149,73],[150,73],[151,73],[152,73],[153,73],[155,73],[167,73],[0,74],[49,74],[50,74],[51,74],[52,74],[53,74],[55,74],[81,74],[82,74],[83,74],[84,74],[85,74],[86,74],[87,74],[88,74],[89,74],[90,74],[91,74],[92,74],[93,74],[94,74],[95,74],[96,74],[97,74],[98,74],[100,74],[101,74],[102,74],[103,74],[104,74],[105,74],[106,74],[107,74],[108,74],[109,74],[110,74],[111,74],[112,74],[113,74],[114,74],[115,74],[116,74],[117,74],[118,74],[119,74],[120,74],[121,74],[122,74],[123,74],[124,74],[125,74],[126,74],[127,74],[128,74],[129,74],[130,74],[131,74],[132,74],[133,74],[134,74],[135,74],[136,74],[137,74],[138,74],[139,74],[140,74],[141,74],[142,74],[143,74],[144,74],[145,74],[146,74],[147,74],[148,74],[149,74],[150,74],[151,74],[152,74],[153,74],[154,74],[155,74],[156,74],[157,74],[158,74],[159,74],[160,74],[167,74],[0,75],[36,75],[37,75],[38,75],[39,75],[40,75],[41,75],[42,75],[47,75],[50,75],[51,75],[52,75],[53,75],[54,75],[55,75],[75,75],[77,75],[78,75],[79,75],[80,75],[81,75],[82,75],[83,75],[84,75],[85,75],[86,75],[87,75],[88,75],[89,75],[90,75],[91,75],[92,75],[93,75],[94,75],[96,75],[97,75],[98,75],[99,75],[101,75],[102,75],[103,75],[104,75],[105,75],[106,75],[107,75],[108,75],[109,75],[110,75],[111,75],[112,75],[113,75],[114,75],[115,75],[116,75],[117,75],[118,75],[119,75],[120,75],[121,75],[122,75],[123,75],[124,75],[125,75],[126,75],[127,75],[128,75],[129,75],[130,75],[131,75],[132,75],[133,75],[134,75],[135,75],[136,75],[137,75],[138,75],[139,75],[140,75],[141,75],[142,75],[143,75],[144,75],[145,75],[146,75],[147,75],[148,75],[149,75],[150,75],[151,75],[152,75],[153,75],[154,75],[155,75],[156,75],[157,75],[158,75],[159,75],[160,75],[161,75],[162,75],[167,75],[0,76],[7,76],[17,76],[18,76],[19,76],[20,76],[21,76],[22,76],[23,76],[24,76],[25,76],[26,76],[27,76],[28,76],[29,76],[30,76],[31,76],[32,76],[33,76],[34,76],[35,76],[36,76],[37,76],[38,76],[39,76],[40,76],[41,76],[42,76],[43,76],[44,76],[45,76],[46,76],[47,76],[48,76],[49,76],[50,76],[51,76],[52,76],[53,76],[54,76],[72,76],[73,76],[74,76],[75,76],[76,76],[77,76],[78,76],[79,76],[80,76],[81,76],[82,76],[83,76],[84,76],[85,76],[86,76],[87,76],[88,76],[89,76],[90,76],[91,76],[92,76],[93,76],[94,76],[95,76],[96,76],[97,76],[98,76],[99,76],[100,76],[101,76],[102,76],[103,76],[104,76],[105,76],[106,76],[107,76],[108,76],[109,76],[110,76],[111,76],[112,76],[113,76],[114,76],[115,76],[116,76],[117,76],[118,76],[119,76],[120,76],[121,76],[122,76],[123,76],[124,76],[125,76],[126,76],[127,76],[128,76],[129,76],[130,76],[131,76],[132,76],[133,76],[134,76],[135,76],[136,76],[137,76],[138,76],[139,76],[140,76],[141,76],[142,76],[143,76],[144,76],[145,76],[146,76],[147,76],[148,76],[149,76],[150,76],[151,76],[152,76],[153,76],[154,76],[155,76],[156,76],[157,76],[158,76],[159,76],[167,76],[0,77],[11,77],[12,77],[13,77],[14,77],[15,77],[16,77],[17,77],[18,77],[19,77],[20,77],[21,77],[22,77],[23,77],[24,77],[25,77],[26,77],[27,77],[28,77],[29,77],[30,77],[31,77],[32,77],[33,77],[34,77],[35,77],[36,77],[37,77],[38,77],[39,77],[40,77],[41,77],[42,77],[43,77],[44,77],[45,77],[46,77],[47,77],[48,77],[49,77],[50,77],[51,77],[52,77],[53,77],[54,77],[55,77],[56,77],[57,77],[58,77],[59,77],[69,77],[70,77],[71,77],[72,77],[73,77],[74,77],[75,77],[76,77],[77,77],[78,77],[79,77],[80,77],[81,77],[82,77],[83,77],[84,77],[85,77],[86,77],[87,77],[88,77],[89,77],[90,77],[91,77],[92,77],[93,77],[94,77],[95,77],[96,77],[97,77],[98,77],[99,77],[100,77],[101,77],[102,77],[103,77],[104,77],[105,77],[106,77],[107,77],[108,77],[109,77],[110,77],[111,77],[112,77],[113,77],[114,77],[115,77],[116,77],[117,77],[118,77],[119,77],[120,77],[121,77],[122,77],[123,77],[124,77],[125,77],[126,77],[127,77],[128,77],[129,77],[130,77],[131,77],[132,77],[133,77],[134,77],[135,77],[136,77],[137,77],[138,77],[139,77],[140,77],[141,77],[142,77],[143,77],[144,77],[145,77],[146,77],[147,77],[148,77],[149,77],[150,77],[151,77],[152,77],[153,77],[154,77],[155,77],[156,77],[157,77],[158,77],[159,77],[161,77],[162,77],[167,77],[0,78],[1,78],[2,78],[3,78],[4,78],[5,78],[6,78],[7,78],[8,78],[9,78],[10,78],[11,78],[12,78],[13,78],[14,78],[15,78],[16,78],[17,78],[18,78],[19,78],[20,78],[21,78],[22,78],[23,78],[24,78],[25,78],[26,78],[27,78],[28,78],[29,78],[30,78],[31,78],[32,78],[33,78],[34,78],[35,78],[36,78],[37,78],[38,78],[39,78],[40,78],[41,78],[42,78],[43,78],[44,78],[45,78],[46,78],[47,78],[48,78],[49,78],[50,78],[51,78],[52,78],[53,78],[54,78],[55,78],[56,78],[57,78],[58,78],[59,78],[60,78],[61,78],[62,78],[63,78],[64,78],[65,78],[66,78],[67,78],[68,78],[69,78],[70,78],[71,78],[72,78],[73,78],[74,78],[75,78],[76,78],[77,78],[78,78],[79,78],[80,78],[81,78],[82,78],[83,78],[84,78],[85,78],[86,78],[87,78],[88,78],[89,78],[90,78],[91,78],[92,78],[93,78],[94,78],[95,78],[96,78],[97,78],[98,78],[99,78],[100,78],[101,78],[102,78],[103,78],[104,78],[105,78],[106,78],[107,78],[108,78],[109,78],[110,78],[111,78],[112,78],[113,78],[114,78],[115,78],[116,78],[117,78],[118,78],[119,78],[120,78],[121,78],[122,78],[123,78],[124,78],[125,78],[126,78],[127,78],[128,78],[129,78],[130,78],[131,78],[132,78],[133,78],[134,78],[135,78],[136,78],[137,78],[138,78],[139,78],[140,78],[141,78],[142,78],[143,78],[144,78],[145,78],[146,78],[147,78],[148,78],[149,78],[150,78],[151,78],[152,78],[153,78],[154,78],[155,78],[156,78],[157,78],[158,78],[159,78],[160,78],[161,78],[162,78],[163,78],[164,78],[165,78],[166,78],[167,78],[0,79],[1,79],[2,79],[3,79],[4,79],[5,79],[6,79],[7,79],[8,79],[9,79],[10,79],[11,79],[12,79],[13,79],[14,79],[15,79],[16,79],[17,79],[18,79],[19,79],[20,79],[21,79],[22,79],[23,79],[24,79],[25,79],[26,79],[27,79],[28,79],[29,79],[30,79],[31,79],[32,79],[33,79],[34,79],[35,79],[36,79],[37,79],[38,79],[39,79],[40,79],[41,79],[42,79],[43,79],[44,79],[45,79],[46,79],[47,79],[48,79],[49,79],[50,79],[51,79],[52,79],[53,79],[54,79],[55,79],[56,79],[57,79],[58,79],[59,79],[60,79],[61,79],[62,79],[63,79],[64,79],[65,79],[66,79],[67,79],[68,79],[69,79],[70,79],[71,79],[72,79],[73,79],[74,79],[75,79],[76,79],[77,79],[78,79],[79,79],[80,79],[81,79],[82,79],[83,79],[84,79],[85,79],[86,79],[87,79],[88,79],[89,79],[90,79],[91,79],[92,79],[93,79],[94,79],[95,79],[96,79],[97,79],[98,79],[99,79],[100,79],[101,79],[102,79],[103,79],[104,79],[105,79],[106,79],[107,79],[108,79],[109,79],[110,79],[111,79],[112,79],[113,79],[114,79],[115,79],[116,79],[117,79],[118,79],[119,79],[120,79],[121,79],[122,79],[123,79],[124,79],[125,79],[126,79],[127,79],[128,79],[129,79],[130,79],[131,79],[132,79],[133,79],[134,79],[135,79],[136,79],[137,79],[138,79],[139,79],[140,79],[141,79],[142,79],[143,79],[144,79],[145,79],[146,79],[147,79],[148,79],[149,79],[150,79],[151,79],[152,79],[153,79],[154,79],[155,79],[156,79],[157,79],[158,79],[159,79],[160,79],[161,79],[162,79],[163,79],[164,79],[165,79],[166,79],[167,79],[0,80],[1,80],[2,80],[3,80],[4,80],[5,80],[6,80],[7,80],[8,80],[9,80],[10,80],[11,80],[12,80],[13,80],[14,80],[15,80],[16,80],[17,80],[18,80],[19,80],[20,80],[21,80],[22,80],[23,80],[24,80],[25,80],[26,80],[27,80],[28,80],[29,80],[30,80],[31,80],[32,80],[33,80],[34,80],[35,80],[36,80],[37,80],[38,80],[39,80],[40,80],[41,80],[42,80],[43,80],[44,80],[45,80],[46,80],[47,80],[48,80],[49,80],[50,80],[51,80],[52,80],[53,80],[54,80],[55,80],[56,80],[57,80],[58,80],[59,80],[60,80],[61,80],[62,80],[63,80],[64,80],[65,80],[66,80],[67,80],[68,80],[69,80],[70,80],[71,80],[72,80],[73,80],[74,80],[75,80],[76,80],[77,80],[78,80],[79,80],[80,80],[81,80],[82,80],[83,80],[84,80],[85,80],[86,80],[87,80],[88,80],[89,80],[90,80],[91,80],[92,80],[93,80],[94,80],[95,80],[96,80],[97,80],[98,80],[99,80],[100,80],[101,80],[102,80],[103,80],[104,80],[105,80],[106,80],[107,80],[108,80],[109,80],[110,80],[111,80],[112,80],[113,80],[114,80],[115,80],[116,80],[117,80],[118,80],[119,80],[120,80],[121,80],[122,80],[123,80],[124,80],[125,80],[126,80],[127,80],[128,80],[129,80],[130,80],[131,80],[132,80],[133,80],[134,80],[135,80],[136,80],[137,80],[138,80],[139,80],[140,80],[141,80],[142,80],[143,80],[144,80],[145,80],[146,80],[147,80],[148,80],[149,80],[150,80],[151,80],[152,80],[153,80],[154,80],[155,80],[156,80],[157,80],[158,80],[159,80],[160,80],[161,80],[162,80],[163,80],[164,80],[165,80],[166,80],[167,80],[0,81],[1,81],[2,81],[3,81],[4,81],[5,81],[6,81],[7,81],[8,81],[9,81],[10,81],[11,81],[12,81],[14,81],[15,81],[16,81],[17,81],[18,81],[19,81],[20,81],[21,81],[23,81],[24,81],[25,81],[26,81],[27,81],[28,81],[29,81],[30,81],[31,81],[32,81],[33,81],[34,81],[35,81],[36,81],[37,81],[38,81],[39,81],[40,81],[41,81],[42,81],[43,81],[44,81],[45,81],[46,81],[47,81],[48,81],[49,81],[50,81],[51,81],[52,81],[53,81],[54,81],[55,81],[56,81],[57,81],[58,81],[59,81],[60,81],[61,81],[62,81],[63,81],[64,81],[65,81],[66,81],[67,81],[68,81],[69,81],[70,81],[71,81],[72,81],[73,81],[74,81],[75,81],[76,81],[77,81],[78,81],[79,81],[80,81],[81,81],[82,81],[83,81],[84,81],[85,81],[86,81],[87,81],[88,81],[89,81],[90,81],[91,81],[92,81],[93,81],[94,81],[95,81],[96,81],[97,81],[98,81],[99,81],[100,81],[101,81],[102,81],[103,81],[104,81],[105,81],[106,81],[107,81],[108,81],[109,81],[110,81],[111,81],[112,81],[113,81],[114,81],[115,81],[116,81],[117,81],[118,81],[119,81],[120,81],[121,81],[122,81],[123,81],[124,81],[125,81],[126,81],[127,81],[128,81],[129,81],[130,81],[131,81],[132,81],[133,81],[134,81],[135,81],[136,81],[137,81],[138,81],[139,81],[140,81],[141,81],[142,81],[143,81],[144,81],[145,81],[146,81],[147,81],[148,81],[149,81],[150,81],[151,81],[152,81],[153,81],[154,81],[155,81],[156,81],[157,81],[158,81],[159,81],[160,81],[161,81],[162,81],[163,81],[164,81],[165,81],[166,81],[167,81],[0,82],[1,82],[2,82],[3,82],[4,82],[5,82],[6,82],[7,82],[8,82],[9,82],[10,82],[11,82],[12,82],[13,82],[14,82],[15,82],[16,82],[17,82],[18,82],[19,82],[20,82],[21,82],[22,82],[23,82],[24,82],[25,82],[26,82],[27,82],[28,82],[29,82],[30,82],[31,82],[32,82],[33,82],[34,82],[35,82],[36,82],[37,82],[38,82],[39,82],[40,82],[41,82],[42,82],[43,82],[44,82],[45,82],[46,82],[47,82],[48,82],[49,82],[50,82],[51,82],[52,82],[53,82],[54,82],[55,82],[56,82],[57,82],[58,82],[59,82],[60,82],[61,82],[62,82],[63,82],[64,82],[65,82],[66,82],[67,82],[68,82],[69,82],[70,82],[71,82],[72,82],[73,82],[74,82],[75,82],[76,82],[77,82],[78,82],[79,82],[80,82],[81,82],[82,82],[83,82],[84,82],[85,82],[86,82],[87,82],[88,82],[89,82],[90,82],[91,82],[92,82],[93,82],[94,82],[95,82],[96,82],[97,82],[98,82],[99,82],[100,82],[101,82],[102,82],[103,82],[104,82],[105,82],[106,82],[107,82],[108,82],[109,82],[110,82],[111,82],[112,82],[113,82],[114,82],[115,82],[116,82],[117,82],[118,82],[119,82],[120,82],[121,82],[122,82],[123,82],[124,82],[125,82],[126,82],[127,82],[128,82],[129,82],[130,82],[131,82],[132,82],[133,82],[134,82],[135,82],[136,82],[137,82],[138,82],[139,82],[140,82],[141,82],[142,82],[143,82],[144,82],[145,82],[146,82],[147,82],[148,82],[149,82],[150,82],[151,82],[152,82],[153,82],[154,82],[155,82],[156,82],[157,82],[158,82],[159,82],[160,82],[161,82],[162,82],[163,82],[164,82],[165,82],[166,82],[167,82],[0,83],[1,83],[2,83],[3,83],[4,83],[5,83],[6,83],[7,83],[8,83],[9,83],[10,83],[11,83],[12,83],[13,83],[14,83],[15,83],[16,83],[17,83],[18,83],[19,83],[20,83],[21,83],[22,83],[23,83],[24,83],[25,83],[26,83],[27,83],[28,83],[29,83],[30,83],[31,83],[32,83],[33,83],[34,83],[35,83],[36,83],[37,83],[38,83],[39,83],[40,83],[41,83],[42,83],[43,83],[44,83],[45,83],[46,83],[47,83],[48,83],[49,83],[50,83],[51,83],[52,83],[53,83],[54,83],[55,83],[56,83],[57,83],[58,83],[59,83],[60,83],[61,83],[62,83],[63,83],[64,83],[65,83],[66,83],[67,83],[68,83],[69,83],[70,83],[71,83],[72,83],[73,83],[74,83],[75,83],[76,83],[77,83],[78,83],[79,83],[80,83],[81,83],[82,83],[83,83],[84,83],[85,83],[86,83],[87,83],[88,83],[89,83],[90,83],[91,83],[92,83],[93,83],[94,83],[95,83],[96,83],[97,83],[98,83],[99,83],[100,83],[101,83],[102,83],[103,83],[104,83],[105,83],[106,83],[107,83],[108,83],[109,83],[110,83],[111,83],[112,83],[113,83],[114,83],[115,83],[116,83],[117,83],[118,83],[119,83],[120,83],[121,83],[122,83],[123,83],[124,83],[125,83],[126,83],[127,83],[128,83],[129,83],[130,83],[131,83],[132,83],[133,83],[134,83],[135,83],[136,83],[137,83],[138,83],[139,83],[140,83],[141,83],[142,83],[143,83],[144,83],[145,83],[146,83],[147,83],[148,83],[149,83],[150,83],[151,83],[152,83],[153,83],[154,83],[155,83],[156,83],[157,83],[158,83],[159,83],[160,83],[161,83],[162,83],[163,83],[164,83],[165,83],[166,83],[167,83]],"GW":168,"GH":84};

/* ===== common.js                                                       ===== */

/* ============================================================================
   SKYWATCH redesign — shared component helpers (no framework)
   Used identically by the offline previews and the Tampermonkey userscripts.
   ============================================================================ */
(function (root) {
  const NS = 'http://www.w3.org/2000/svg';

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('data-') || k === 'role') el.setAttribute(k, v);
      else el[k] = v;
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  function svg(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    for (const kid of kids.flat()) if (kid) el.appendChild(kid);
    return el;
  }
  const fmt = (n) => (n == null || n === '' || isNaN(+n)) ? (n ?? '—') : (+n).toLocaleString('en-US');

  // GLESEC brand mark (teal swoosh) — Elevated badge style is in theme.css (.sw-brand__logo)
  const GLESEC_MARK = "M75.2,34.2 L90,34.2 L90,50.2 L44.4,50.2 C51.604,40.796 62.864,34.808 75.2,34.2 Z M44.4,50.2 C36.216,59.128 24.888,65.356 12.4,65.8 L10,65.8 L10,50.2 Z";
  function brandMark() {
    const s = svg('svg', { viewBox: '0 0 100 100' });
    s.appendChild(svg('path', { d: GLESEC_MARK, fill: '#93e8df' }));
    return s;
  }

  /* ----- shared top bar ----------------------------------------------------- */
  function topbar(opts) {
    const right = [];
    if (opts.account) right.push(h('div', { class: 'sw-chip' },
      h('span', { class: 'sw-chip__label' }, 'Scope'), h('b', null, opts.account)));
    if (opts.clock !== false) right.push(h('div', { class: 'sw-chip' },
      h('span', { class: 'sw-chip__label' }, 'GOC'),
      h('span', { class: 'sw-clock', id: 'sw-clock' }, opts.clock || nowStr())));
    if (opts.status) {
      const st = opts.status;
      if (st.loading) {
        // boot-time / loading: status is derived from data we haven't fetched yet — stay neutral
        right.push(h('div', { class: 'sw-status is-loading' },
          h('span', { class: 'dot' }), st.label || 'Connecting…'));
      } else {
        // tone reflects derived severity (green/yellow/orange/red); ok:false is shorthand for red
        const tone = st.tone || (st.ok === false ? 'red' : 'green');
        right.push(h('div', { class: 'sw-status tone-' + tone },
          h('span', { class: 'dot' }), st.label || (st.ok === false ? 'Degraded' : 'Operational')));
      }
    }
    return h('header', { class: 'sw-topbar' },
      h('div', { class: 'sw-brand' },
        h('div', { class: 'sw-brand__logo' }, brandMark()),
        h('div', { class: 'sw-brand__name' }, h('b', null, 'SKYWATCH'), ' ', h('span', null, 'GOC'))),
      h('div', { class: 'sw-brand__div' }),
      h('div', { class: 'sw-title' }, opts.title, opts.sub ? h('small', null, opts.sub) : null),
      h('div', { class: 'sw-topbar__spacer' }),
      ...right);
  }
  function nowStr() {
    try {
      const d = new Date();
      return d.toLocaleDateString('en-US') + ' · ' + d.toLocaleTimeString('en-US', { hour12: false });
    } catch (e) { return ''; }
  }

  /* ----- card --------------------------------------------------------------- */
  function card(opts, body) {
    // header: title (left) ... secondary title / meta (right, justify-between)
    const left = h('div', { class: 'sw-card__head-left' },
      h('div', { class: 'sw-card__accent ' + (opts.accent ? 'acc-' + opts.accent : '') }),
      h('div', { class: 'sw-card__title' }, opts.title));
    const rightKids = [];
    if (opts.sub) rightKids.push(h('div', { class: 'sw-card__sub' }, opts.sub));
    if (opts.meta) rightKids.push(h('div', { class: 'sw-card__meta' }, opts.meta));
    const head = h('div', { class: 'sw-card__head' }, left,
      rightKids.length ? h('div', { class: 'sw-card__head-right' }, ...rightKids) : null);
    const bodyEl = h('div', { class: 'sw-card__body ' + (opts.bodyClass || '') });
    if (body) (Array.isArray(body) ? body : [body]).forEach(b => b && bodyEl.appendChild(b));
    const c = h('div', { class: 'sw-card ' + (opts.class || '') });
    if (opts.head !== false) c.appendChild(head);
    c.appendChild(bodyEl);
    c._body = bodyEl;
    return c;
  }

  function badge(text, cls) { return h('span', { class: 'sw-badge ' + (cls || '') }, h('span', { class: 'dot' }), text); }

  /* ── Canonical severity / priority palette — THE single source of truth ─────────────────
     Exact scheme: low=yellow, medium=orange, high=red, critical=pink/red. (info=blue and
     blocked=green are extra vocab used ONLY by the map's severity field.) Everything colours
     severity/priority through here:
       SW.sevColor(x)  -> hex   (x = a label string OR a numeric priority_id)
       SW.sevClass(x)  -> badge class (is-critical / is-high / is-medium / is-low / is-info)
       SW.PRIORITY     -> backend priority_id -> label   (NON-contiguous: 4=Crit,2=High,1=Med,0=Low)
     The hexes are also pushed into the --sev-* CSS vars so class-styled badges match the
     JS-coloured SVG arcs / bars exactly. DO NOT hardcode severity colours anywhere else. */
  const SEV = { critical: '#ff2d6e', high: '#ef4444', medium: '#f97316', low: '#eab308', info: '#38bdf8', blocked: '#22c55e' };
  const PRIORITY = { 0: 'Low', 1: 'Medium', 2: 'High', 4: 'Critical' };
  const prioLabel = (id) => PRIORITY[id] || '';
  const sevKey = (s) => {
    if (s == null) return '';
    if (typeof s === 'number') { const l = PRIORITY[s]; return l ? l.toLowerCase() : ''; }
    s = String(s).toLowerCase();
    if (s.indexOf('crit') !== -1) return 'critical';
    if (s.indexOf('high') !== -1) return 'high';
    if (s.indexOf('med') !== -1) return 'medium';
    if (s.indexOf('low') !== -1) return 'low';
    if (s.indexOf('block') !== -1) return 'blocked';
    if (s.indexOf('info') !== -1) return 'info';
    return '';
  };
  const sevColor = (s) => SEV[sevKey(s)] || SEV.medium;
  const sevClass = (s) => { const k = sevKey(s); return (k && k !== 'blocked') ? 'is-' + k : ''; };
  try {
    const _rs = document.documentElement && document.documentElement.style;
    if (_rs) { _rs.setProperty('--sev-critical', SEV.critical); _rs.setProperty('--sev-high', SEV.high); _rs.setProperty('--sev-medium', SEV.medium); _rs.setProperty('--sev-low', SEV.low); _rs.setProperty('--sev-info', SEV.info); }
  } catch (e) {}
  const TIER = { 1: { c: 'is-t1', name: 'NONE' }, 2: { c: 'is-t2', name: 'SBEAR' }, 3: { c: 'is-t3', name: 'TEAR' }, 4: { c: 'is-t4', name: 'TEVR' }, 5: { c: 'is-t5', name: 'INCIDENT' } };

  /* ----- donut gauge -------------------------------------------------------- */
  function gauge(opts) {
    const size = opts.size || 150, sw = opts.stroke || 12, r = (size - sw) / 2 - 2, cx = size / 2;
    const C = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(1, opts.value / (opts.max || 100)));
    const color = opts.color || 'var(--green)';
    const g = svg('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, class: 'sw-gauge' });
    g.appendChild(svg('circle', { cx, cy: cx, r, fill: 'none', stroke: 'rgba(255,255,255,0.07)', 'stroke-width': sw }));
    const arc = svg('circle', {
      cx, cy: cx, r, fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'round',
      'stroke-dasharray': C, 'stroke-dashoffset': C * (1 - pct),
      transform: `rotate(-90 ${cx} ${cx})`, style: `filter:drop-shadow(0 0 6px ${color}); transition:stroke-dashoffset 1.2s ease;`
    });
    g.appendChild(arc);
    const wrap = h('div', { class: 'sw-gauge-wrap', style: { position: 'relative', width: size + 'px', height: size + 'px' } }, g,
      h('div', { style: { position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
        h('div', { style: { fontSize: (size * 0.27) + 'px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', lineHeight: '1' } }, opts.display != null ? opts.display : fmt(opts.value)),
        opts.unit ? h('div', { style: { fontSize: '12px', color: 'var(--fg-subtle)', marginTop: '3px' } }, opts.unit) : null));
    return wrap;
  }

  /* ----- count-up animation ------------------------------------------------- */
  function countUp(el, to, dur) {
    to = +to; if (isNaN(to)) { el.textContent = '—'; return; }
    dur = dur || 1100; const start = performance.now(); const from = 0;
    function step(t) {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ----- mount helper: build the page shell --------------------------------- */
  function shell(topbarOpts, mainStyle) {
    const main = h('main', { class: 'sw-main' });
    if (mainStyle) Object.assign(main.style, mainStyle);
    const r = h('div', { class: 'sw-root' }, topbar(topbarOpts), main);
    r._main = main;
    return r;
  }

  root.SW = { h, svg, fmt, topbar, card, badge, gauge, countUp, shell, sevClass, sevColor, sevKey, SEV, PRIORITY, prioLabel, TIER, brandMark, nowStr };
})(window);


/* ===== skeleton.js                                                     ===== */

/* ============================================================================
   SKYWATCH redesign — shared loading / skeleton layer (no framework)
   Used identically by the offline previews and the Tampermonkey userscripts.

   Design rule: skeletons are keyed by BODY ARCHETYPE (shape), never per widget.
   ~10 archetypes cover every card on all 6 walls, so nothing is duplicated.
   A wall declares a tiny `skel` spec (grid + per-card archetype); the real
   render() reads the same {title,accent} chrome, so the two can't drift.

   Loading only matters for the "Class B" walls that paint empty and hydrate
   over a multi-second XHR fan-out (01 CSA / 05 Map / 06 PRTG). The "Class A"
   walls (02/03/04) have window.initialData at boot and render instantly — they
   use this only for the subtle "refreshing" indicator, never a full skeleton.
   ============================================================================ */
(function (root) {
  const SW = root.SW;
  if (!SW) { console.warn('skeleton.js: SW (common.js) not loaded'); return; }
  const { h, svg, card, shell } = SW;

  /* ---- atom: one shimmering block ---------------------------------------- */
  const px = v => (typeof v === 'number' ? v + 'px' : v);
  function blk(w, ht, r) {
    return h('div', { class: 'sw-skel', style: {
      width: px(w), height: px(ht),
      borderRadius: r == null ? null : px(r), flex: '0 0 auto'
    } });
  }
  const sp = ht => h('div', { style: { height: px(ht) } });        // vertical spacer
  // deterministic "organic" widths so rows don't look mechanical (no Math.random)
  const VW = [92, 74, 108, 86, 98, 70, 104, 82, 96, 78];

  /* ---- archetype builders (shape -> skeleton body) ----------------------- */
  const SKEL = {
    lines(cd) {
      return h('div', { class: 'flex col gap-m', style: { paddingTop: '6px' } },
        blk('70%', 13, 5), blk('90%', 13, 5), blk('55%', 13, 5));
    },
    // big number + name/sub/reason (Top Risk Domain)
    hero(cd) {
      return h('div', { class: 'flex', style: { alignItems: 'center', gap: '18px' } },
        blk(64, 50, 10),
        h('div', { style: { borderLeft: '1px solid var(--border)', paddingLeft: '18px', flex: '1', minWidth: '0' } },
          blk(120, 22, 6), sp(8), blk(86, 13, 5), sp(6), blk('70%', 13, 5)));
    },
    // status word on the left, small stat cluster on the right (Posture Trend)
    inline(cd) {
      return h('div', { class: 'flex between', style: { alignItems: 'center', height: '100%', padding: '8px 0', gap: '12px' } },
        h('div', null, blk(120, 20, 5), sp(6), blk(58, 9, 4)),
        h('div', { class: 'flex', style: { gap: '14px' } },
          ...[0, 1, 2].map(() => h('div', { class: 'flex col center', style: { gap: '5px' } }, blk(26, 20, 5), blk(40, 9, 4)))));
    },
    // horizontal bar list (Domain Risk Index)
    bars(cd) {
      const n = cd.rows || 7;
      return h('div', { class: 'sw-hbars' }, ...Array.from({ length: n }, (_, i) =>
        h('div', { class: 'sw-hbar' },
          h('div', { class: 'sw-hbar__top' }, blk(VW[i % VW.length], 12, 4), blk(26, 12, 4)),
          h('div', { class: 'sw-skel', style: { height: '8.8px', borderRadius: '6px' } }))));
    },
    // dot + two lines + value, repeated (Contributing Conditions / event feeds)
    feed(cd) {
      const n = cd.rows || 5;
      return h('div', { style: { padding: '4px 16px' } }, ...Array.from({ length: n }, (_, i) =>
        h('div', { class: 'flex', style: { alignItems: 'center', gap: '13px', padding: '11px 2px', borderTop: i ? '1px solid var(--hairline)' : 'none' } },
          blk(10, 10, '50%'),
          h('div', { style: { flex: '1', minWidth: '0' } }, blk(VW[i % VW.length], 13, 4), sp(5), blk(90, 11, 4)),
          blk(22, 17, 4))));
    },
    // big highlighted tile + a metric row (Threat Level)
    tile(cd) {
      return h('div', { class: 'flex col center', style: { height: '100%', gap: '16px', justifyContent: 'center' } },
        blk('100%', 112, 12),
        h('div', { class: 'flex between', style: { width: '100%', padding: '0 6px', alignItems: 'center' } },
          blk(70, 13, 4), blk(54, 40, 6), blk(36, 13, 4)));
    },
    // concentric rings + shimmer core (radar / spider)
    radar(cd) {
      const S = 320, rings = [1, 0.72, 0.46, 0.22];
      const box = h('div', { style: { position: 'relative', width: S + 'px', height: S + 'px' } });
      rings.forEach(f => {
        const d = S * f;
        box.appendChild(h('div', { class: 'sw-skel-ring', style: { width: d + 'px', height: d + 'px', left: (S - d) / 2 + 'px', top: (S - d) / 2 + 'px' } }));
      });
      const core = blk(86, 86, '50%');
      Object.assign(core.style, { position: 'absolute', left: (S - 86) / 2 + 'px', top: (S - 86) / 2 + 'px' });
      box.appendChild(core);
      return h('div', { class: 'flex center', style: { height: '100%', width: '100%' } }, box);
    },
    // donut ring (PRTG gauges)
    gauge(cd) {
      const d = cd.size || 150, hole = d - 28;
      return h('div', { class: 'flex center', style: { height: '100%' } },
        h('div', { style: { position: 'relative', width: d + 'px', height: d + 'px' } },
          h('div', { class: 'sw-skel', style: { width: d + 'px', height: d + 'px', borderRadius: '50%' } }),
          h('div', { style: { position: 'absolute', width: hole + 'px', height: hole + 'px', left: '14px', top: '14px', borderRadius: '50%', background: 'var(--surface)' } })));
    },
    // line / area chart (PRTG ping)
    chart(cd) {
      return h('div', { class: 'flex col', style: { height: '100%', justifyContent: 'flex-end' } },
        h('div', { class: 'sw-skel', style: { width: '100%', height: '72%', borderRadius: '10px' } }));
    },
    // full-bleed panel with a faint graticule so it reads as a map while loading (Map)
    map(cd) {
      const box = h('div', { style: { position: 'relative', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--surface-2)' } });
      box.appendChild(h('div', { style: { position: 'absolute', inset: '0',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px' } }));
      box.appendChild(h('div', { class: 'sw-skel', style: { position: 'absolute', inset: '0', background: 'transparent' } }));
      return box;
    },
    // horizontal strip of N headerless gauge tiles (PRTG gauges row — rendered raw, no card)
    gaugeStrip(cd) {
      const n = cd.n || 4, d = 92, hole = d - 12;
      const tile = () => h('div', { class: 'sw-card', style: { flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '14px 18px' } },
        h('div', { style: { position: 'relative', width: d + 'px', height: d + 'px', flex: '0 0 auto' } },
          h('div', { class: 'sw-skel', style: { width: d + 'px', height: d + 'px', borderRadius: '50%' } }),
          h('div', { style: { position: 'absolute', width: hole + 'px', height: hole + 'px', left: '6px', top: '6px', borderRadius: '50%', background: 'var(--surface)' } })),
        h('div', null, blk(96, 11, 4), sp(8), blk(70, 13, 4)));
      return h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: '16px' } }, ...Array.from({ length: n }, tile));
    },
    // centered status mark + message (PRTG Infrastructure & Certificates)
    check(cd) {
      return h('div', { class: 'flex col center', style: { height: '100%', gap: '12px', justifyContent: 'center' } },
        blk(40, 40, '50%'), blk(160, 12, 4), blk(120, 12, 4));
    },
    // three counter tiles, each two metrics, divided (Map Attack Counters)
    counters3(cd) {
      const tile = () => h('div', { style: { flex: '1', padding: '0 18px' } },
        blk(58, 9, 3),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '11px' } },
          ...[0, 1].map(() => h('div', null, blk(40, 22, 5), sp(5), blk(48, 9, 4)))));
      const divider = () => h('div', { style: { width: '1px', alignSelf: 'stretch', margin: '2px 0', background: 'rgba(255,255,255,0.10)' } });
      return h('div', { class: 'flex', style: { alignItems: 'stretch', padding: '14px 10px 16px' } },
        tile(), divider(), tile(), divider(), tile());
    },
    // row of N trend metric tiles: label + big delta + sub (Notable Trending Analysis)
    metrics3(cd) {
      const n = cd.n || 3;
      return h('div', { class: 'flex gap-m' }, ...Array.from({ length: n }, () =>
        h('div', { class: 'sw-metric', style: { flex: '1' } }, blk(80, 12, 4), sp(10), blk(70, 30, 6), sp(8), blk(96, 12, 4))));
    },
    // headerless hero banner: semicircle gauge + title lines (Threat Level banner) — rendered raw
    banner(cd) {
      return h('div', { class: 'sw-card', style: { flexDirection: 'row', alignItems: 'center', padding: '14px 22px' } },
        h('div', { style: { width: '150px', height: '88px', flex: '0 0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' } },
          h('div', { class: 'sw-skel', style: { width: '112px', height: '56px', borderRadius: '56px 56px 0 0' } })),
        h('div', { style: { paddingLeft: '24px', flex: '1', minWidth: '0' } }, blk(140, 11, 4), sp(8), blk(220, 26, 6), sp(7), blk(180, 12, 4)));
    },
    // five tier rows: dot + label + value, thin track below (Threat Level Counters)
    counters5(cd) {
      const n = cd.rows || 5;
      return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } }, ...Array.from({ length: n }, (_, i) =>
        h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '9px 2px', borderTop: i ? '1px solid var(--hairline)' : 'none' } },
          h('div', { class: 'flex between', style: { alignItems: 'center', marginBottom: '7px' } },
            h('div', { class: 'flex', style: { alignItems: 'center', gap: '9px' } }, blk(9, 9, '50%'), blk(VW[i % VW.length], 13, 4)),
            blk(28, 16, 4)),
          h('div', { class: 'sw-skel', style: { height: '5px', borderRadius: '3px' } }))));
    },
    // row of N headerless KPI tiles: label + big value + foot (Cases KPI row) — rendered raw
    kpiRow(cd) {
      const n = cd.n || 6;
      return h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: '16px' } }, ...Array.from({ length: n }, () =>
        h('div', { style: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: '8px' } },
          blk(80, 10, 3), blk(54, 34, 6), blk(70, 10, 3))));
    },
    // 2x3 grid of scorecard tiles (Cases Response Summary)
    summary6(cd) {
      const n = cd.n || 6;
      return h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(3,1fr)', gap: '14px', height: '100%' } }, ...Array.from({ length: n }, () =>
        h('div', { style: { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '11px', padding: '15px 17px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '7px' } },
          h('div', { class: 'flex between', style: { alignItems: 'center' } }, blk(80, 10, 3), blk(7, 7, '50%')),
          blk(60, 26, 6), blk(90, 10, 3))));
    },
    // row of KPI tiles
    kpi(cd) {
      const n = cd.cols || 4;
      return h('div', { class: 'flex', style: { gap: '14px' } }, ...Array.from({ length: n }, () =>
        h('div', { class: 'sw-kpi', style: { flex: '1' } }, blk(70, 11, 4), sp(10), blk(56, 40, 6))));
    },
    // header row + body rows (tables on Class A walls)
    table(cd) {
      const n = cd.rows || 8, cols = cd.tcols || 4;
      return h('div', null,
        h('div', { class: 'flex', style: { gap: '18px', padding: '9px 12px', borderBottom: '1px solid var(--border)' } },
          ...Array.from({ length: cols }, () => blk(60, 10, 3))),
        ...Array.from({ length: n }, (_, i) => h('div', { class: 'flex', style: { gap: '18px', padding: '13px 12px', borderBottom: '1px solid var(--hairline)', alignItems: 'center' } },
          ...Array.from({ length: cols }, (_, j) => blk(j === 0 ? VW[i % VW.length] : 46, 13, 4)))));
    },
  };

  /* ---- a single skeleton card (real chrome, shimmer body) ---------------- */
  function skelCard(cd) {
    const body = (SKEL[cd.archetype] || SKEL.lines)(cd);
    const c = card({
      title: cd.title, accent: cd.accent, sub: cd.sub,
      meta: cd.meta === true ? blk(48, 12, 4) : cd.meta,
      bodyClass: cd.bodyClass, head: cd.head,
      class: (cd.grow ? 'grow ' : '') + 'sw-skel-card'
    }, body);
    if (cd.cardStyle) Object.assign(c.style, cd.cardStyle);
    return c;
  }

  /* ---- recursive cell builder -------------------------------------------
     A cell is one of:
       { stack:[cell...], gap }   -> flex column
       { grid:'1fr 1fr', cards:[cell...], gap } -> nested CSS grid
       { raw:'archetype', ...opts } -> archetype body, no card wrapper
       { title, accent, archetype, ... } -> a skeleton card                  */
  function buildCell(cell) {
    if (cell.raw) return (SKEL[cell.raw] || SKEL.lines)(cell);
    if (cell.stack) {
      const wrap = h('div', { class: 'flex col', style: { gap: cell.gap || '14px', minHeight: '0' } });
      cell.stack.forEach(c => wrap.appendChild(buildCell(c)));
      return wrap;
    }
    if (cell.grid) {
      const wrap = h('div', { style: { display: 'grid', gridTemplateColumns: cell.grid, gap: cell.gap || '18px', minHeight: '0' } });
      cell.cards.forEach(c => wrap.appendChild(buildCell(c)));
      return wrap;
    }
    return skelCard(cell);
  }

  /* ---- mount the full skeleton page (real topbar + shimmer grid) --------- */
  function mountSkeleton(rootEl, spec) {
    spec = spec || {};
    const r = shell(spec.topbar || {});
    const main = r._main;
    if (spec.columns) main.style.gridTemplateColumns = spec.columns;
    if (spec.rows) main.style.gridTemplateRows = spec.rows;
    if (spec.gap) main.style.gap = spec.gap;
    // `cells` is the general model; `cols` (array of card-stacks) kept for back-compat
    const cells = spec.cells || (spec.cols ? spec.cols.map(c => ({ stack: c })) : (spec.cards || []).map(c => c));
    cells.forEach(cell => main.appendChild(buildCell(cell)));
    rootEl.appendChild(r);
    return r;
  }

  /* ---- ring spinner (refresh indicator / inline fallback) ---------------- */
  function spinner(size, color) {
    size = size || 18; color = color || 'var(--fg-subtle)';
    const s = svg('svg', { viewBox: '0 0 50 50', width: size, height: size, class: 'sw-spin' });
    s.appendChild(svg('circle', { cx: 25, cy: 25, r: 20, fill: 'none', stroke: 'currentColor', 'stroke-opacity': 0.18, 'stroke-width': 5 }));
    s.appendChild(svg('circle', { cx: 25, cy: 25, r: 20, fill: 'none', stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '80 200' }));
    s.style.color = color;
    return s;
  }

  SW.skel = SKEL;
  SW.mountSkeleton = mountSkeleton;
  SW.skelCard = skelCard;
  SW.spinner = spinner;
})(window);


/* ===== walls/01-csa.js                                                 ===== */

/* Wall 01 — CSA Dashboards (rebuilt radar / spider situational chart) */
(function () {
  const { h, svg, card, badge, shell, sevColor } = window.SW;
  const TAU = Math.PI * 2;
  // 0-100 risk scale (real radar risks run 0..100)
  const gradeColor = s => s >= 75 ? 'var(--red)' : s >= 50 ? 'var(--orange)' : s >= 25 ? 'var(--yellow)' : 'var(--green)';
  const gradeHex = s => s >= 75 ? '#ef4444' : s >= 50 ? '#f97316' : s >= 25 ? '#eab308' : '#22c55e';

  function radar(d) {
    const S = 620, c = S / 2, maxR = 232;
    const doms = d.domains, N = doms.length;
    const ang = i => -Math.PI / 2 + i * TAU / N;
    const pt = (i, r) => [c + r * Math.cos(ang(i)), c + r * Math.sin(ang(i))];
    const g = svg('svg', { viewBox: `0 0 ${S} ${S}`, width: S, height: S, style: 'overflow:visible;' });

    const defs = svg('defs', null);
    defs.innerHTML = `
      <radialGradient id="coreg" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#0b1220"/><stop offset="100%" stop-color="#0a0a0c"/>
      </radialGradient>`;
    g.appendChild(defs);

    const maxScale = 100;                // real risk scale 0..100
    const half = (TAU / N) / 2;
    const rOf = s => maxR * Math.min(1, s / maxScale);

    // per-domain radial heat wedges (to value radius) + glowing arc end (no single dots)
    doms.forEach((dm, i) => {
      if (dm.hasData === false || !dm.score) return;
      const r = rOf(dm.score), a1 = ang(i) - half, a2 = ang(i) + half;
      const p1 = [c + r * Math.cos(a1), c + r * Math.sin(a1)];
      const p2 = [c + r * Math.cos(a2), c + r * Math.sin(a2)];
      const col = gradeHex(dm.score);
      g.appendChild(svg('path', { d: `M ${c} ${c} L ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A ${r} ${r} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z`, fill: col, 'fill-opacity': 0.16, stroke: col, 'stroke-opacity': 0.28, 'stroke-width': 1 }));
      const top = dm.name === d.topDomain.name;
      g.appendChild(svg('path', { d: `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A ${r} ${r} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`, fill: 'none', stroke: col, 'stroke-width': top ? 5 : 3.5, 'stroke-linecap': 'round', style: `filter:drop-shadow(0 0 ${top ? 10 : 6}px ${col});` }));
    });

    // concentric rings + scale labels
    [0.25, 0.5, 0.75, 1].forEach(f => {
      g.appendChild(svg('circle', { cx: c, cy: c, r: maxR * f, fill: 'none', stroke: 'rgba(255,255,255,0.08)', 'stroke-width': 1 }));
      const t = svg('text', { x: c + 4, y: c - maxR * f + 2, fill: 'var(--fg-faint)', 'font-size': 9.5, 'font-family': 'JetBrains Mono', 'dominant-baseline': 'middle' });
      t.textContent = Math.round(maxScale * f); g.appendChild(t);
    });
    // axes
    const guide = [];
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(i, maxR);
      g.appendChild(svg('line', { x1: c, y1: c, x2: x, y2: y, stroke: 'rgba(255,255,255,0.07)', 'stroke-width': 1 }));
      guide.push(pt(i, maxR));
    }
    g.appendChild(svg('polygon', { points: guide.map(p => p.join(',')).join(' '), fill: 'none', stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1 }));

    // domain labels
    doms.forEach((dm, i) => {
      const [lx, ly] = pt(i, maxR + 30);
      const a = ang(i); const anchor = Math.abs(Math.cos(a)) < 0.3 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
      const lab = svg('text', { x: lx, y: ly, 'text-anchor': anchor, 'dominant-baseline': 'middle', fill: 'var(--fg-muted)', 'font-size': 13, 'font-weight': 600, 'letter-spacing': '0.06em', 'font-family': 'Inter' });
      lab.textContent = dm.name;
      g.appendChild(lab);
      const noData = dm.hasData === false;
      const val = svg('text', { x: lx, y: ly + 16, 'text-anchor': anchor, 'dominant-baseline': 'middle', fill: noData ? 'var(--fg-faint)' : gradeHex(dm.score), 'font-size': 12, 'font-weight': 700, 'font-family': 'JetBrains Mono' });
      val.textContent = noData ? 'n/a' : dm.score;
      g.appendChild(val);
    });

    // center core
    g.appendChild(svg('circle', { cx: c, cy: c, r: 59, fill: 'url(#coreg)', stroke: 'rgba(34,211,238,0.35)', 'stroke-width': 1.5, style: 'filter:drop-shadow(0 0 18px rgba(34,211,238,0.25));' }));
    // composite risk = mean of domains that actually returned data (no-data sectors excluded, not counted as 0)
    const active = doms.filter(x => x.hasData !== false && x.score > 0).map(x => x.score);
    const composite = active.length ? Math.round(active.reduce((a, b) => a + b, 0) / active.length) : 0;
    const ct = svg('text', { x: c, y: c - 3, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#fff', 'font-size': 35, 'font-weight': 800, 'font-family': 'Inter', 'letter-spacing': '-0.03em' });
    ct.textContent = composite + '%';
    g.appendChild(ct);
    const cl = svg('text', { x: c, y: c + 21, 'text-anchor': 'middle', fill: 'var(--fg-subtle)', 'font-size': 8.4, 'font-weight': 600, 'letter-spacing': '0.08em', 'font-family': 'Inter' });
    cl.textContent = 'COMPOSITE RISK';
    g.appendChild(cl);

    // rotating radar sweep — 5s / 360°, light-blue with a smoothly fading glow trail.
    // CSS conic-gradient (genuinely smooth, no chunks) layered behind the svg so the radar draws over it.
    const wrap = h('div', { class: 'flex center', style: { position: 'relative', height: '100%', width: '100%' } });
    // Class B wall: the fan-out re-renders the radar ~5-8x in the first seconds, and each rebuild
    // would restart this CSS animation from 0deg (visible "jump back"). Anchor it to a GLOBAL 5s
    // timeline via a negative animation-delay = -(now mod 5000)ms, so every freshly-built sweep
    // resumes at the exact phase a continuous spin would be at — no restart, purely visual.
    const SWEEP_MS = 5000;
    const sweepDelay = '-' + Math.round((typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) % SWEEP_MS) + 'ms';
    const sweepEl = h('div', {
      style: {
        position: 'absolute', inset: '0', margin: 'auto', pointerEvents: 'none', zIndex: '2',
        width: (maxR * 2) + 'px', height: (maxR * 2) + 'px', borderRadius: '50%',
        // trail fades out BEHIND the arm: arm leads at 0°/360° (top), trail runs counter-clockwise (320°→360°) since the sweep rotates clockwise
        background: 'conic-gradient(from 0deg, transparent 0deg 320deg, rgba(125,211,252,0) 320deg, rgba(125,211,252,0.1) 326deg, rgba(125,211,252,0.25) 356deg, rgba(125,211,252,0.25) 360deg)',
        // cut the sweep right at the core edge (r=59) so it tucks under the core instead of washing over "74%"
        mask: 'radial-gradient(circle at center, transparent 58px, #000 64px)',
        WebkitMask: 'radial-gradient(circle at center, transparent 58px, #000 64px)',
        animation: 'sweep 5s linear infinite',
        animationDelay: sweepDelay
      }
    });
    // leading "sweep arm" — a brighter line with a slight glow at the front of the trail
    const leadLine = h('div', {
      style: {
        position: 'absolute', left: '50%', top: '0', width: '2px', height: maxR + 'px',
        transform: 'translateX(-50%)', borderRadius: '2px', pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(125,211,252,0.95), rgba(125,211,252,0.12))',
        boxShadow: '0 0 7px rgba(125,211,252,0.6)'
      }
    });
    sweepEl.appendChild(leadLine);
    g.style.position = 'relative'; g.style.zIndex = '1';
    // scale the whole radar (svg + sweep) up 15% as one unit — keeps every proportion intact
    const inner = h('div', {
      style: {
        position: 'relative', width: S + 'px', height: S + 'px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'scale(1.15)', transformOrigin: 'center center'
      }
    });
    inner.appendChild(sweepEl); inner.appendChild(g);
    wrap.appendChild(inner);

    // Pin the radar's geometric centre to the viewport's vertical centre.
    // The card lives below the topbar + its own header, so flex-centering inside the
    // body lands the radar low; measure the actual offset and translate the whole wrap
    // (svg + sweep move together, so they stay aligned). Re-runs on resize.
    const recenter = () => {
      if (!wrap.isConnected) { requestAnimationFrame(recenter); return; }
      wrap.style.transform = 'none';
      const r = wrap.getBoundingClientRect();
      const delta = (window.innerHeight / 2) - (r.top + r.height / 2);
      wrap.style.transform = `translateY(${delta.toFixed(1)}px)`;
    };
    requestAnimationFrame(recenter);
    window.addEventListener('resize', recenter);
    return wrap;
  }

  function render(rootEl, d) {
    // top-right status = composite risk across domains that returned data (mirrors the radar centre)
    const cActive = d.domains.filter(x => x.hasData !== false && x.score > 0).map(x => x.score);
    const composite = cActive.length ? Math.round(cActive.reduce((a, b) => a + b, 0) / cActive.length) : 0;
    const cTone = composite >= 75 ? 'red' : composite >= 50 ? 'orange' : composite >= 25 ? 'yellow' : 'green';
    const cStatus = cActive.length ? { tone: cTone, label: 'Risk ' + composite } : { loading: true, label: 'No Data' };
    const root = shell({ title: 'CSA Monitor Wall · Security', sub: 'Cybersecurity Situational Awareness', account: d.account, status: cStatus });
    const main = root._main;
    main.style.gridTemplateColumns = '380px 1fr 380px';
    main.style.gridTemplateRows = '1fr';

    /* LEFT */
    // Top Risk Domain — Hero number (gallery-csa-topdomain option 3); colour tracks the score range
    const td = d.topDomain;
    const tHex = gradeHex(td.score);
    const tMix = p => `color-mix(in srgb, ${tHex} ${p}%, white)`;
    const gradeAccent = s => s >= 75 ? 'red' : s >= 50 ? 'orange' : s >= 25 ? 'yellow' : 'green';
    const heroNum = h('div');
    heroNum.style.cssText = `flex:0 0 auto;font-family:Inter;font-size:50px;font-weight:800;line-height:0.9;background:linear-gradient(180deg,${tMix(85)},${tHex});-webkit-background-clip:text;background-clip:text;color:transparent;`;
    heroNum.textContent = td.score;
    const topCard = card({ title: 'Top Risk Domain', accent: gradeAccent(td.score) },
      h('div', { class: 'flex', style: { alignItems: 'center', gap: '18px' } },
        heroNum,
        h('div', { style: { minWidth: '0', borderLeft: '1px solid var(--border)', paddingLeft: '18px' } },
          h('div', { style: { fontSize: '22px', fontWeight: '800', color: tMix(72) } }, td.name),
          h('div', { style: { fontSize: '12.5px', color: 'var(--fg-subtle)', marginTop: '6px' } }, td.service),
          h('div', { style: { fontSize: '12.5px', color: tMix(55), marginTop: '3px', lineHeight: '1.25' } }, td.reason))));

    // Posture trend from real trajectory counts (improving / stable / worsening domains). No fabricated sparkline.
    // Posture Trend — Inline row (gallery-csa-posture option 8); arrow sits to the right of the status
    const trajIcon = d.trajectory === 'STABLE' ? '→' : d.trajectory === 'WORSENING' ? '↘' : '↗';
    const tc = d.trajectoryCounts;
    const trendCard = card({ title: 'Posture Trend', sub: 'Domain trajectory', accent: 'cyan' },
      h('div', { class: 'flex between', style: { alignItems: 'center', gap: '12px', height: '100%', padding: '8px 0' } },
        h('div', { style: { flex: '0 0 auto' } },
          h('div', { style: { fontSize: '20px', fontWeight: '800', color: 'var(--cyan)', whiteSpace: 'nowrap' } }, d.trajectory + ' ' + trajIcon),
          h('div', { class: 'sw-eyebrow', style: { marginTop: '4px' } }, 'Trajectory')),
        h('div', { class: 'flex', style: { gap: '12px' } },
          ...[['Improving', tc.improving, 'var(--green)'], ['Stable', tc.stable, 'var(--fg-subtle)'], ['Worsening', tc.worsening, 'var(--red)']]
            .map(([l, v, col]) => h('div', { style: { textAlign: 'center' } },
              h('div', { style: { fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: '700', color: col } }, v),
              h('div', { style: { fontSize: '9px', color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' } }, l))))));

    // Domain Risk Index (real per-domain risk, 0..100; no-data sectors shown as n/a)
    const domBars = [...d.domains].sort((a, b) => b.score - a.score).map(dm => {
      const noData = dm.hasData === false;
      return h('div', { class: 'sw-hbar' },
        h('div', { class: 'sw-hbar__top' },
          h('span', { class: 'sw-hbar__name', style: noData ? { color: 'var(--fg-faint)' } : null }, dm.name),
          h('span', { class: 'sw-hbar__val', style: { color: noData ? 'var(--fg-faint)' : gradeColor(dm.score) } }, noData ? 'n/a' : dm.score)),
        h('div', { class: 'sw-hbar__track', style: { height: '8.8px' } }, h('div', { class: 'sw-hbar__fill', style: { width: (noData ? 0 : dm.score) + '%', background: gradeColor(dm.score), color: gradeColor(dm.score) } })));
    });
    const domainCard = card({ title: 'Domain Risk Index', sub: 'All 7 sectors', accent: 'orange', class: 'grow' }, h('div', { class: 'sw-hbars' }, ...domBars));

    const leftCol = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } }, topCard, trendCard, domainCard);

    /* CENTER radar */
    const centerCard = card({ title: 'Security Domain Radar', sub: '7-sector risk surface', accent: 'cyan', bodyClass: 'nopad' }, radar(d));

    /* RIGHT — contributing conditions (real; ~5 now, capped at 10) — Severity dots (gallery-csa-conditions option 4) */
    const conds = d.conditions.slice(0, 10);
    const sevHex = sevColor;   // canonical severity colour (low=yellow, med=orange, high=red, crit=pink/red)
    const condRows = conds.map((cd, i) => h('div', { class: 'flex', style: { alignItems: 'center', gap: '13px', padding: '11px 2px', borderTop: i ? '1px solid var(--hairline)' : 'none' } },
      h('span', { style: { width: '10px', height: '10px', borderRadius: '50%', flex: '0 0 auto', background: sevHex(cd.severity), boxShadow: `0 0 8px color-mix(in srgb, ${sevHex(cd.severity)} 50%, transparent)` } }),
      h('div', { style: { flex: '1', minWidth: '0' } },
        h('div', { style: { fontSize: '13px', fontWeight: '600', color: 'var(--fg)' } }, cd.reason),
        h('div', { style: { fontSize: '11px', color: 'var(--fg-faint)' } }, cd.domain + ' · ' + cd.service)),
      h('span', { style: { fontFamily: 'var(--mono)', fontSize: '17px', fontWeight: '700', color: gradeColor(cd.risk) } }, cd.risk)));
    const condCard = card({ title: 'Contributing Conditions', meta: conds.length + ' active', accent: 'orange', bodyClass: 'nopad' },
      h('div', { style: { padding: '4px 16px' } }, ...condRows));

    // Threat level from /radar-wall/csa-threat-level (max_threat_level + active_count + label).
    // If the endpoint returns no level, show UNKNOWN (neutral) rather than a misleading default.
    const t = d.threat || {};
    const known = t.tier >= 1 && t.tier <= 5;
    const tcol = known ? `var(--t${t.tier})` : 'var(--fg-subtle)';
    const tLabel = known ? t.label : 'UNKNOWN';
    const tCode = known ? t.code : 'no data from threat endpoint';
    const tCases = (t.cases != null && t.cases !== '') ? t.cases : '—';
    const tAccent = known ? { 1: 'green', 2: 'yellow', 3: 'orange', 4: 'red', 5: 'violet' }[t.tier] : null;
    const threatCard = card({ title: 'Threat Level', accent: tAccent, class: 'grow' },
      h('div', { class: 'flex col center', style: { height: '100%', gap: '16px', justifyContent: 'center' } },
        h('div', {
          style: {
            width: '100%', padding: '20px', borderRadius: '12px', textAlign: 'center',
            background: `radial-gradient(circle at 50% 0%, color-mix(in srgb,${tcol} 12%, transparent), transparent 70%), var(--surface-2)`,
            border: `1px solid color-mix(in srgb,${tcol} 34%, transparent)`, boxShadow: `inset 0 0 24px color-mix(in srgb,${tcol} 8%, transparent)`
          }
        },
          h('div', { class: 'sw-eyebrow', style: { color: `color-mix(in srgb,${tcol} 65%, white)` } }, 'Current Threat Level'),
          h('div', { style: { fontSize: '34px', fontWeight: '800', marginTop: '8px', color: `color-mix(in srgb,${tcol} 72%, white)` } }, tLabel),
          h('div', { style: { fontSize: '16px', color: 'var(--fg-muted)', fontWeight: '600', letterSpacing: '0.1em' } }, tCode)),
        h('div', { class: 'flex between', style: { width: '100%', padding: '0 6px', alignItems: 'baseline' } },
          h('span', { class: 'sw-eyebrow' }, 'Active Threats'),
          h('span', { style: { fontSize: '40px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--fg)' } }, tCases),
          h('span', { class: 'sw-subtle', style: { fontSize: '13px' } }, 'cases'))));

    const rightCol = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } }, condCard, threatCard);

    main.appendChild(leftCol); main.appendChild(centerCard); main.appendChild(rightCol);
    rootEl.appendChild(root);
  }
  // Loading skeleton — same grid + chrome the render above paints, shape-only bodies.
  // Class B wall: paints empty then hydrates over a 39-call radar fan-out, so this shows
  // until the first batch lands. Accents that are data-driven (hero/threat) stay neutral.
  const skel = {
    topbar: { title: 'CSA Monitor Wall · Security', sub: 'Cybersecurity Situational Awareness', status: { loading: true } },
    columns: '340px 1fr 380px', rows: '1fr',
    cols: [
      [ { title: 'Top Risk Domain', archetype: 'hero' },
        { title: 'Posture Trend', sub: 'Domain trajectory', accent: 'cyan', archetype: 'inline' },
        { title: 'Domain Risk Index', sub: 'All 7 sectors', accent: 'orange', archetype: 'bars', rows: 7, grow: true } ],
      [ { title: 'Security Domain Radar', sub: '7-sector risk surface', accent: 'cyan', archetype: 'radar', bodyClass: 'nopad', grow: true } ],
      [ { title: 'Contributing Conditions', meta: true, accent: 'orange', archetype: 'feed', rows: 5, bodyClass: 'nopad' },
        { title: 'Threat Level', archetype: 'tile', grow: true } ],
    ],
  };
  /* ---- live adapter: the radar fan-out (39× POST get-widget-data-radar) + threat GET --
     Each radar response is {status, data:[[...]], data_labels:[...]}; columns are looked up
     BY LABEL (order isn't guaranteed), exactly like the wall's own csaVal(). We dispatch on
     the labels alone (no POST body needed): a row whose labels include `trajectory` is the
     posture-trend widget; rows with `domain`+`risk` are condition/radar rows. Domain risk =
     MAX across all clients (worst-case SOC view). Threat = GET radar-wall/csa-threat-level. */
  const DOMAINS = ['NETWORK', 'ENDPOINT', 'APPLICATION', 'DATA', 'USERS', 'PERSISTENCY', 'CLOUD/EXTERNAL'];
  const SIGNAL = {
    internal_vuln: 'Internal Vulnerability', internal_vuln_critical: 'Critical Internal Vulnerability',
    external_vuln_critical: 'Critical External Vulnerability',
    dlp_incident: 'DLP Incident', bas_dlp_gap: 'BAS DLP Gap',
    webapp_attack: 'CloudWAF Attack Detected', cloud_waf_vuln: 'Multiple Critical CloudWAF Vulnerabilities',
    bas_application_gap: 'BAS Application Gap', bas_endpoint_gap: 'BAS Endpoint Gap',
    endpoint_anomaly: 'Endpoint Anomaly', malicious_file: 'Malicious File',
    suspicious_process: 'Suspicious Process', endpoint_network: 'Endpoint Network Anomaly',
    duo_denied: 'Authentication Denied', duo_locked_out: 'Account Locked Out',
    perimeter_attack: 'Perimeter Attack', pan_threat: 'Firewall Threat',
    persistent_attacker: 'Persistent Attacker Detected'
  };
  const THREAT_LABEL = { 1: 'GREEN', 2: 'YELLOW', 3: 'ORANGE', 4: 'RED', 5: 'BLACK' };
  const THREAT_CODE = { 1: 'NONE', 2: 'SBEAR', 3: 'TEAR', 4: 'TEVR', 5: 'INCIDENT' };
  function colIdx(labels, name) { if (!labels) return -1; name = String(name).toLowerCase(); for (let i = 0; i < labels.length; i++) if (String(labels[i]).toLowerCase() === name) return i; return -1; }
  function cell(row, labels, name) { const i = colIdx(labels, name); return i >= 0 ? row[i] : undefined; }
  function canonDomain(d) { d = String(d || '').trim().toUpperCase(); if (d === 'USER') return 'USERS'; if (d === 'CLOUD/EXT' || d === 'CLOUD' || d === 'EXTERNAL' || d === 'CLOUD/EXTERNAL') return 'CLOUD/EXTERNAL'; return d; }
  function sevFromRisk(r) { return r >= 90 ? 'critical' : r >= 70 ? 'high' : r >= 40 ? 'medium' : 'low'; }
  function signalLabel(sig) { if (!sig) return ''; if (SIGNAL[sig]) return SIGNAL[sig]; return String(sig).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  function scopeFromPage(s) { try { const sel = s.doc && s.doc.querySelector('select'); const o = sel && sel.selectedOptions && sel.selectedOptions[0]; const t = o && o.textContent.trim(); if (t) return t; } catch (e) {} return null; }
  // fallback: the wall renders the threat pill into the DOM (#csa-threat-text "THREAT LEVEL: YELLOW (SBEAR)"
  // + #csa-active-count) before/independent of the csa-threat-level XHR — read it off the live page.
  const TLABELS = { GREEN: 1, YELLOW: 2, ORANGE: 3, RED: 4, BLACK: 5 };
  const TCODES = { NONE: 1, SBEAR: 2, TEAR: 3, TEVR: 4, INCIDENT: 5 };
  function threatFromDom(s) {
    try {
      const doc = s.doc; const te = doc.getElementById('csa-threat-text') || doc.getElementById('csa-threat-pill');
      const up = (te && te.textContent || '').toUpperCase(); if (!up) return null;
      let tier = 0, label = '', code = '';
      for (const k in TLABELS) if (up.indexOf(k) !== -1) { tier = TLABELS[k]; label = k; break; }
      for (const k in TCODES) if (up.indexOf(k) !== -1) { code = k; if (!tier) tier = TCODES[k]; break; }
      if (!tier) return null;
      const ce = doc.getElementById('csa-active-count');
      const cases = ce ? (+String(ce.textContent).replace(/[^0-9]/g, '') || '') : '';
      return { tier: tier, label: label || THREAT_LABEL[tier] || '', code: code || THREAT_CODE[tier] || '', cases: cases };
    } catch (e) { return null; }
  }

  function adapt(s) {
    const radar = s.all('get-widget-data-radar');
    // The fan-out returns THREE distinct widgets (same endpoint, different POST widget id):
    //   16 CSA-TOP-RISK-DOMAIN     -> the radar surface  (labels: cust_name,domain,risk,service,...)
    //   17 CSA-POSTURE-TREND       -> trajectory
    //   18 CSA-CONTRIBUTING-CONDITIONS -> individual signals (labels add _time + severity)
    // Dispatch by labels (the response carries no widget id): a `trajectory` column => posture;
    // a `_time`/`severity` column => a contributing-condition row; otherwise a domain-risk row.
    // Keeping them SEPARATE matters: the radar must show the domain aggregate, not be spiked by an
    // individual critical condition, and the conditions list must be the signals, not domain rows.
    const domainRows = []; const condRows = []; let posture = null;
    radar.forEach(resp => {
      if (!resp || !Array.isArray(resp.data)) return;
      const labels = resp.data_labels || [];
      if (colIdx(labels, 'trajectory') >= 0) {
        resp.data.forEach(row => {
          if (!Array.isArray(row)) return;
          posture = {
            trajectory: String(cell(row, labels, 'trajectory') || '').toLowerCase(),
            improving: +cell(row, labels, 'improving_domains') || 0,
            stable: +cell(row, labels, 'stable_domains') || 0,
            worsening: +cell(row, labels, 'worsening_domains') || 0
          };
        });
        return;
      }
      const isCondition = colIdx(labels, '_time') >= 0 || colIdx(labels, 'severity') >= 0;
      resp.data.forEach(row => {
        if (!Array.isArray(row)) return;
        const domain = canonDomain(cell(row, labels, 'domain') !== undefined ? cell(row, labels, 'domain') : cell(row, labels, 'type'));
        const riskRaw = cell(row, labels, 'risk');
        if (!domain || riskRaw == null || riskRaw === '') return;
        const risk = Math.round(+riskRaw);
        if (!isFinite(risk)) return;
        const sevCell = String(cell(row, labels, 'severity') || '').toLowerCase();
        (isCondition ? condRows : domainRows).push({
          domain, risk: Math.max(0, Math.min(100, risk)),
          service: cell(row, labels, 'service') || '',
          signal: cell(row, labels, 'contributing_signal') || '',
          severity: sevCell || sevFromRisk(risk)
        });
      });
    });

    if (!domainRows.length && !condRows.length) return s.prev || null;   // wait for the fan-out
    // tolerate one widget landing before the other: fall back across types so neither card is blank
    const domSrc = domainRows.length ? domainRows : condRows;
    const condSrc = condRows.length ? condRows : domainRows;

    // domains: MAX domain-aggregate risk per canonical sector (no-data sectors stay hasData:false)
    const best = {};
    domSrc.forEach(r => { if (!best[r.domain] || r.risk > best[r.domain].risk) best[r.domain] = r; });
    const domains = DOMAINS.map(name => best[name] ? { name, score: best[name].risk, hasData: true } : { name, score: 0, hasData: false });

    // top risk domain = highest-risk domain-aggregate row
    let top = domSrc[0]; domSrc.forEach(r => { if (r.risk > top.risk) top = r; });
    const topDomain = { name: top.domain, score: top.risk, service: top.service, reason: signalLabel(top.signal) };

    // contributing conditions: top distinct (domain+signal) condition rows by risk
    const seen = {};
    const conditions = condSrc.slice().sort((a, b) => b.risk - a.risk).filter(r => { const k = r.domain + '|' + r.signal; if (seen[k]) return false; seen[k] = true; return true; })
      .slice(0, 10).map(r => ({ domain: r.domain, reason: signalLabel(r.signal), service: r.service, severity: r.severity, risk: r.risk }));

    // posture trend: real widget if present, else neutral (active domains treated as stable, no invented movement)
    const activeN = domains.filter(d => d.hasData).length;
    const pt = posture || { trajectory: 'stable', improving: 0, stable: activeN, worsening: 0 };
    const trajectory = (pt.trajectory || 'stable').toUpperCase();
    const trajectoryCounts = { improving: pt.improving, stable: pt.stable, worsening: pt.worsening };

    // threat level: prefer the csa-threat-level XHR, fall back to the wall's own DOM pill,
    // then to the last good value (so it never regresses to UNKNOWN once known)
    const tl = s.latest('csa-threat-level');
    let threat;
    if (tl && tl.max_threat_level != null && tl.max_threat_level !== '') {
      const tier = +tl.max_threat_level;
      threat = { tier, label: THREAT_LABEL[tier] || '', code: THREAT_CODE[tier] || '', cases: (tl.active_count != null ? +tl.active_count : '') };
    }
    if (!threat) threat = threatFromDom(s) || (s.prev && s.prev.threat) || undefined;

    const account = scopeFromPage(s) || (s.prev && s.prev.account) || 'All Clients';
    return { account, topDomain, domains, trajectory, trajectoryCounts, conditions, threat };
  }

  (window.SW_WALLS = window.SW_WALLS || []).push({
    slug: '01-csa-dashboards', match: /^\/radar-wall\//, cls: 'B',
    endpoints: ['get-widget-data-radar', 'csa-threat-level'], adapt, render, skel
  });
})();


/* ===== walls/02-notable.js                                             ===== */

/* Wall 02 — Notable Events Intelligence */
(function () {
  const { h, card, badge, countUp, shell, sevClass, sevColor, PRIORITY } = window.SW;
  const prioCls = sevClass;   // canonical badge class
  // GNE search health derived from real command counts (no fabricated status string):
  // STALE = no successful results (silent failure); DEGRADED = more failures than successes.
  const engHealth = e => (e.success > 0) ? (e.errors > e.success ? 'DEGRADED' : 'OPTIMAL') : 'STALE';
  const engCls = s => s === 'OPTIMAL' ? 'is-ok' : s === 'DEGRADED' ? 'is-warn' : 'is-down';

  function render(rootEl, d) {
    // top-right status = GNE engine health derived from the per-search status column
    const degraded = (d.engine || []).filter(e => engHealth(e) !== 'OPTIMAL').length;
    const engStatus = degraded ? { tone: 'orange', label: degraded + ' Degraded' } : { tone: 'green', label: 'Engine Optimal' };
    const root = shell({ title: 'Notable Events Intelligence', sub: 'GNE Detection Engine', account: d.account, status: engStatus });
    const main = root._main;
    main.style.gridTemplateColumns = '1.5fr 1fr';
    main.style.gridTemplateRows = '1fr';

    /* ---- LEFT: Top 10 GNE ---- */
    const rows = d.topGne.map(g => h('tr', null,
      h('td', { class: 'sw-rank' }, g.gne),
      h('td', { class: 'strong' }, g.name),
      h('td', { class: 'num' }, SW.fmt(g.c24)),
      h('td', { class: 'num muted' }, SW.fmt(g.c7)),
      h('td', null, badge(g.priority, prioCls(g.priority))),
      h('td', { class: 'num' }, SW.fmt(g.created)),
    ));
    const table = h('table', { class: 'sw-table roomy' },
      h('thead', null, h('tr', null,
        h('th', null, 'GNE'), h('th', null, 'Notable Event'),
        h('th', { class: 'num' }, '24h'), h('th', { class: 'num' }, '7d'),
        h('th', null, 'Priority'), h('th', { class: 'num' }, 'Cases'))),
      h('tbody', null, ...rows));
    const gneTable = card({ title: 'Top 10 GNE Types', sub: 'Last 24 hours', accent: 'cyan', meta: d.topGne.length + ' active', bodyClass: 'nopad' }, h('div', { style: { padding: '4px 8px' } }, table));

    // 24h volume bar chart (fills remaining vertical space)
    const maxV = Math.max(...d.topGne.map(g => g.c24));
    const barCol = sevColor;   // canonical severity colour
    const volBars = [...d.topGne].sort((a, b) => b.c24 - a.c24).map(g => h('div', { class: 'sw-hbar' },
      h('div', { class: 'sw-hbar__top' },
        h('span', { class: 'sw-hbar__name' }, h('span', { class: 'sw-rank', style: { marginRight: '8px' } }, g.gne), g.name),
        h('span', { class: 'sw-hbar__val' }, SW.fmt(g.c24))),
      h('div', { class: 'sw-hbar__track' }, h('div', { class: 'sw-hbar__fill', style: { width: Math.max(3, g.c24 / maxV * 100) + '%', background: barCol(g.priority), color: barCol(g.priority) } }))));
    const volCard = card({ title: 'Event Volume', sub: 'Firings · last 24h', accent: 'blue', class: 'grow' }, h('div', { class: 'sw-hbars' }, ...volBars));

    const left = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } }, gneTable, volCard);

    /* ---- RIGHT column ---- */
    const right = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } });

    // new events
    // header line composites lighter here (short card, high on the page) than the other tables'
    // translucent var(--border); pin it to a solid dim line so it matches GNE Engine Health.
    const neTh = (label) => h('th', { style: { borderBottomColor: '#1f1f21' } }, label);
    const neBody = d.newEvents.length
      ? h('table', { class: 'sw-table' },
          h('thead', null, h('tr', null, neTh('Time'), neTh('GNE'), neTh('Event'), neTh('Priority'), neTh('Case'), neTh('Status'))),
          h('tbody', null, ...d.newEvents.map(e => h('tr', null,
            h('td', { class: 'mono' }, e.time), h('td', { class: 'sw-rank' }, e.gne),
            h('td', { class: 'strong' }, e.name), h('td', null, badge(e.priority, prioCls(e.priority))),
            h('td', { class: 'mono', style: { color: 'var(--blue)' } }, e.case),
            h('td', null, badge(e.status, 'is-open'))))))
      : h('div', { class: 'sw-subtle', style: { padding: '14px 4px' } }, 'No new critical/high events.');
    const neCard = card({ title: 'New Critical / High', sub: 'Last 60 minutes', accent: 'red', bodyClass: 'nopad' }, h('div', { style: { padding: '2px 8px' } }, neBody));

    // trends
    const trendCards = d.trends.map(t => {
      const up = t.pct >= 0;
      return h('div', { class: 'sw-metric', style: { flex: '1' } },
        h('div', { class: 'sw-metric__label' }, t.label),
        h('div', { class: 'sw-metric__row' },
          h('div', { class: 'sw-metric__delta ' + (up ? 'up' : 'down') },
            h('span', { class: 'sw-metric__arrow' }, up ? '▲' : '▼'),
            (up ? '+' : '') + t.pct + '%')),
        h('div', { class: 'sw-metric__sub' }, SW.fmt(t.now) + ' vs ' + SW.fmt(t.prev)));
    });
    const trendCard = card({ title: 'Trending Analysis', sub: 'Summarized trajectory', accent: 'violet', bodyClass: 'pad' },
      h('div', { class: 'flex gap-m' }, ...trendCards));

    // engine health
    const engRows = d.engine.map(e => h('tr', null,
      h('td', { class: 'strong' }, e.name),
      h('td', null, badge(engHealth(e), engCls(engHealth(e)))),
      h('td', { class: 'num', style: { color: 'var(--orange)' } }, e.errors),
      h('td', { class: 'num' }, SW.fmt(e.success)),
      h('td', { class: 'mono muted' }, e.last)));
    const engCard = card({ title: 'GNE Engine Health', sub: 'Preventing silent failures', accent: 'green', bodyClass: 'nopad', class: 'grow' },
      h('div', { style: { padding: '2px 8px' } },
        h('table', { class: 'sw-table roomy' },
          h('thead', null, h('tr', null, h('th', null, 'Search'), h('th', null, 'Status'), h('th', { class: 'num' }, 'Errors'), h('th', { class: 'num' }, 'Success'), h('th', null, 'Last Result'))),
          h('tbody', null, ...engRows))));

    right.appendChild(neCard); right.appendChild(trendCard); right.appendChild(engCard);
    main.appendChild(left); main.appendChild(right);
    rootEl.appendChild(root);
  }
  // Loading skeleton (Class A — normally renders instantly from window.initialData; this is
  // only for the all-walls-loading view / refresh fallback). Mirrors the 2-column layout.
  const skel = {
    topbar: { title: 'Notable Events Intelligence', sub: 'GNE Detection Engine', status: { loading: true } },
    columns: '1.5fr 1fr', rows: '1fr',
    cells: [
      { stack: [
        { title: 'Top 10 GNE Types', sub: 'Last 24 hours', accent: 'cyan', meta: true, archetype: 'table', rows: 8, tcols: 6, bodyClass: 'nopad' },
        { title: 'Event Volume', sub: 'Firings · last 24h', accent: 'blue', archetype: 'bars', rows: 8, grow: true },
      ] },
      { stack: [
        { title: 'New Critical / High', sub: 'Last 60 minutes', accent: 'red', archetype: 'table', rows: 5, tcols: 6, bodyClass: 'nopad' },
        { title: 'Trending Analysis', sub: 'Summarized trajectory', accent: 'violet', archetype: 'metrics3', bodyClass: 'pad' },
        { title: 'GNE Engine Health', sub: 'Preventing silent failures', accent: 'green', archetype: 'table', rows: 6, tcols: 5, bodyClass: 'nopad', grow: true },
      ] },
    ],
  };
  /* ---- live adapter: get-notable-events-data / window.initialData -> d -------------
     topGne   <- splunkSearchNotableEvents (24h/7d successful-command sums, notable_events_count,
                 priority from case_config.priority_id), ranked by volume.
     newEvents <- criticalNotableEvents (search + case join).
     trends    <- notableEventStatistic (now vs previous window -> % delta).
     engine    <- lastNotableEvents (per-search failed/successful 7d sums + last result time). */
  const PRIO = PRIORITY;   // canonical backend priority_id -> label (one place: SW.PRIORITY)
  const STATUS = { 1: 'Open', 2: 'Answered', 3: 'Suspended', 4: 'Closed', 5: 'Closed' };
  const num = v => { const n = +v; return isFinite(n) ? n : 0; };
  const hm = v => { const m = String(v || '').match(/(\d{2}):(\d{2})/); return m ? m[1] + ':' + m[2] : ''; };
  function scopeFromPage(s) {
    try { const sel = s.doc && s.doc.querySelector('select'); const o = sel && sel.selectedOptions && sel.selectedOptions[0]; const t = o && o.textContent.trim(); if (t) return t; } catch (e) {}
    return null;
  }
  function adapt(s) {
    const raw = s.latest('get-notable-events-data') || s.initialData;
    if (!raw || !Array.isArray(raw.splunkSearchNotableEvents)) return s.prev || null;
    const topGne = raw.splunkSearchNotableEvents.map(g => ({
      gne: '#' + g.gne, name: g.name,
      c24: num(g.successful_commands_sum_last_day), c7: num(g.successful_commands_sum_last_7_days),
      priority: PRIO[g.case_config && g.case_config.priority_id] || 'Medium',
      created: num(g.notable_events_count)
    })).sort((a, b) => b.created - a.created).slice(0, 10);

    const newEvents = (raw.criticalNotableEvents || []).map(e => ({
      time: hm(e.updated_at),
      gne: '#' + (e.search && e.search.gne), name: (e.search && e.search.name) || '',
      priority: PRIO[e.case && e.case.priority] || 'High',
      case: '#' + (e.case && e.case.id), status: STATUS[e.case && e.case.status] || 'Open'
    }));

    const ns = raw.notableEventStatistic || {};
    const trend = (label, now, prev) => {
      const n = num(now), p = num(prev);
      return { label, now: n, prev: p, pct: p > 0 ? Math.round((n - p) / p * 100) : (n > 0 ? 100 : 0) };
    };
    const trends = [
      trend('Last Hour', ns.last_hour, ns.previous_hour),
      trend('Last 24 Hours', ns.last_24h, ns.previous_24h),
      trend('Last 7 Days', ns.last_7d, ns.previous_7d)
    ];

    const len = raw.lastNotableEvents || {};
    const engine = Object.keys(len).map(k => {
      const e = len[k];
      return { name: (e.search && e.search.name) || '', errors: num(e.failed_commands_sum_last_7_days), success: num(e.successful_commands_sum_last_7_days), last: e.updated_at || '' };
    });

    const account = scopeFromPage(s) || (s.prev && s.prev.account) || 'All Accounts';
    return { account, topGne, newEvents, trends, engine };
  }

  (window.SW_WALLS = window.SW_WALLS || []).push({
    slug: '02-notable-events', match: /^\/goc-notable-events\//, cls: 'A',
    endpoints: ['get-notable-events-data'], adapt, render, skel
  });
})();


/* ===== walls/03-threat.js                                              ===== */

/* Wall 03 — Threat Level & Active Threat Conditions */
(function () {
  const { h, card, badge, shell, TIER } = window.SW;
  const TIERS = [
    { n: 1, code: 'NONE', col: 'var(--t1)' }, { n: 2, code: 'SBEAR', col: 'var(--t2)' },
    { n: 3, code: 'TEAR', col: 'var(--t3)' }, { n: 4, code: 'TEVR', col: 'var(--t4)' },
    { n: 5, code: 'INCIDENT', col: '#a1a1aa' },
  ];
  function ageStr(s) { return s.replace('2026-', '').replace(/:\d{2}$/, ''); }

  function render(rootEl, d) {
    const cur = TIERS[d.level - 1];
    // top-right status = the actual current threat level, coloured by tier
    const lvlTone = { 1: 'green', 2: 'yellow', 3: 'orange', 4: 'red', 5: 'red' }[d.level] || 'green';
    const root = shell({ title: 'Threat Level & Active Conditions', sub: 'Global SOC Posture', account: d.account, status: { tone: lvlTone, label: 'LEVEL ' + d.level + ' · ' + d.code } });
    const main = root._main;
    main.style.gridTemplateRows = '1fr';
    main.style.gridTemplateColumns = '3fr 2fr';

    /* ---- HERO BANNER (v2 option 1 — Semicircle arc) ---- */
    const col = cur.col;
    const cx = 74, cy = 70, r = 56, f = d.level / 5;
    const pol = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    const [sx, sy] = pol(Math.PI), [ex, ey] = pol(0), [vx, vy] = pol(Math.PI * (1 - f));
    const gauge = `<svg width="150" height="88" viewBox="0 0 150 88"><path d="M${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="12" stroke-linecap="round"/><path d="M${sx} ${sy} A ${r} ${r} 0 0 1 ${vx.toFixed(1)} ${vy.toFixed(1)}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" style="filter:drop-shadow(0 0 5px ${col})"/><text x="${cx}" y="64" text-anchor="middle" font-family="Inter" font-size="34" font-weight="800" fill="color-mix(in srgb, ${col} 78%, white)">${d.level}</text><text x="${cx}" y="80" text-anchor="middle" font-family="Inter" font-size="9" font-weight="700" letter-spacing="1" fill="var(--fg-subtle)">OF 5</text></svg>`;
    // factual sub-line from real per-level case counts (replaces the fabricated tagline)
    const activeAtLevel = (d.counts && d.counts[d.level]) || 0;
    const levelSub = SW.fmt(activeAtLevel) + ' active TAC case' + (activeAtLevel === 1 ? '' : 's') + ' at this level';
    const txt = `<div style="padding-left:24px;flex:1;min-width:0;">
      <div class="sw-eyebrow" style="color:color-mix(in srgb, ${col} 60%, white);">Active Threat Condition</div>
      <div style="font-size:28px;font-weight:800;letter-spacing:-0.01em;line-height:1.05;margin-top:4px;">LEVEL ${d.level} · <span style="color:color-mix(in srgb, ${col} 72%, white);">${d.code}</span></div>
      <div style="font-size:13px;color:var(--fg-muted);margin-top:5px;">${levelSub}</div></div>`;
    const banner = h('div', {
      class: 'sw-card', style: {
        flexDirection: 'row', alignItems: 'center', padding: '14px 22px',
        background: `linear-gradient(100deg, color-mix(in srgb, ${col} 4.5%, var(--surface)), var(--surface) 60%)`,
        borderColor: `color-mix(in srgb, ${col} 26%, transparent)`
      }
    });
    banner.innerHTML = gauge + txt;

    // cases
    const caseRows = d.cases.map(c => h('tr', null,
      h('td', { class: 'mono', style: { color: 'var(--blue)' } }, '#' + c.id),
      h('td', { class: 'strong' }, c.account),
      h('td', null, h('span', { class: 'flex', style: { alignItems: 'center', gap: '7px', fontWeight: '600', color: `color-mix(in srgb, ${TIER[c.level].c} 62%, white)` } },
        h('span', { style: { width: '7px', height: '7px', borderRadius: '50%', flex: '0 0 auto', background: TIER[c.level].c, boxShadow: `0 0 6px color-mix(in srgb, ${TIER[c.level].c} 70%, transparent)` } }),
        'L' + c.level + ' · ' + TIER[c.level].name)),
      h('td', { class: 'muted' }, c.owner),
      h('td', { class: 'mono muted' }, ageStr(c.created)),
    ));
    const casesCard = card({ title: 'Contributing TAC Cases', sub: 'Most recent', accent: 'blue', meta: d.cases.length + ' cases', bodyClass: 'nopad', class: 'grow' },
      h('div', { style: { padding: '2px 8px', height: '100%' } },
        // table fills the card so rows stretch vertically; cap total height to header + rows×85px
        // (~155% of the natural ~54px row) so rows keep their height as a floor but don't over-stretch
        h('table', { class: 'sw-table roomy', style: { height: '100%', maxHeight: (34 + d.cases.length * 85) + 'px' } },
          h('thead', null, h('tr', null, h('th', null, 'Case'), h('th', null, 'Account'), h('th', null, 'Threat Level'), h('th', null, 'Owner'), h('th', null, 'Age'))),
          h('tbody', null, ...caseRows))));

    // counters — refined bars (label + count + thin progress track)
    const cmix = (c, p, b = 'white') => `color-mix(in srgb, ${c} ${p}%, ${b})`;
    const maxC = Math.max(1, ...Object.values(d.counts));
    const counterBody = h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } });
    counterBody.innerHTML = [5, 4, 3, 2, 1].map((n, i) => {
      const v = d.counts[n] || 0, t = TIERS[n - 1], c = t.col, on = v > 0;
      const w = Math.max(2, v / maxC * 100);
      return `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:9px 2px;${i !== 0 ? 'border-top:1px solid var(--hairline);' : ''}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;">
          <div style="display:flex;align-items:center;gap:9px;">
            <span style="width:9px;height:9px;border-radius:50%;background:${c};${on ? `box-shadow:0 0 8px ${c};` : 'opacity:.4;'}"></span>
            <span style="font-size:13px;font-weight:600;color:${on ? cmix(c, 55) : 'var(--fg-subtle)'};">L${n} · ${t.code}</span>
          </div>
          <span style="font-family:var(--mono);font-size:16px;font-weight:700;color:${on ? 'var(--fg)' : 'var(--fg-faint)'};">${SW.fmt(v)}</span>
        </div>
        <div style="height:5px;border-radius:3px;background:rgba(255,255,255,0.05);overflow:hidden;"><div style="height:100%;width:${w}%;background:${c};${on ? `box-shadow:0 0 8px ${c};` : 'opacity:.3;'}border-radius:3px;"></div></div>
      </div>`;
    }).join('');
    const countersCard = card({ title: 'Level Counters', sub: 'Active cases by tier', accent: 'cyan' }, counterBody);

    // L4/L5 escalations: list the real cases at that tier; if the counts say some exist but none
    // are in the recent set, show the count. No placeholder text.
    const escN = (d.counts[4] || 0) + (d.counts[5] || 0);
    const escCases = (d.cases || []).filter(c => c.level >= 4);
    const escCard = card({ title: 'Escalation Strip', sub: 'Critical only · L4 / L5', accent: 'red', class: 'grow' },
      escN === 0
        ? h('div', { class: 'flex col center', style: { height: '100%', gap: '12px', color: 'var(--fg-subtle)' } },
            h('div', { style: { fontSize: '34px' } }, '✓'),
            h('div', { style: { fontSize: '15px', fontWeight: '600', color: 'var(--fg-muted)' } }, 'No Active Escalations'),
            h('div', { style: { fontSize: '13px' } }, 'No cases at TEVR or Incident level'))
        : escCases.length
          ? h('div', { style: { display: 'flex', flexDirection: 'column', padding: '2px 2px' } },
              ...escCases.map((c, i) => h('div', { class: 'flex between', style: { alignItems: 'center', padding: '9px 4px', borderTop: i ? '1px solid var(--hairline)' : 'none' } },
                h('span', { class: 'mono', style: { color: 'var(--blue)' } }, '#' + c.id),
                badge('L' + c.level + ' · ' + TIER[c.level].name, TIER[c.level].c),
                h('span', { class: 'muted', style: { fontSize: '12px' } }, c.account))))
          : h('div', { class: 'flex col center', style: { height: '100%', gap: '8px' } },
              h('div', { style: { fontSize: '40px', fontWeight: '800', fontFamily: 'var(--mono)', color: 'var(--red)' } }, SW.fmt(escN)),
              h('div', { class: 'sw-subtle', style: { fontSize: '13px' } }, 'cases at TEVR / Incident level')));

    // Level Counters : Escalation Strip height ratio = 4 : 3 (banner stays auto)
    countersCard.style.flex = '4 1 0';
    escCard.style.flex = '3 1 0';
    const leftCol = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } }, banner, countersCard, escCard);
    const rightCol = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } }, casesCard);
    main.appendChild(rightCol); main.appendChild(leftCol);
    rootEl.appendChild(root);
  }
  // Loading skeleton (Class A — normally instant from window.initialData; this is for the
  // all-walls-loading view / refresh fallback). Left = banner + counters + escalation, right = cases.
  const skel = {
    topbar: { title: 'Threat Level & Active Conditions', sub: 'Global SOC Posture', status: { loading: true } },
    columns: '2fr 3fr', rows: '1fr',
    cells: [
      { stack: [
        { raw: 'banner' },
        { title: 'Level Counters', sub: 'Active cases by tier', accent: 'cyan', archetype: 'counters5', cardStyle: { flex: '4 1 0' } },
        { title: 'Escalation Strip', sub: 'Critical only · L4 / L5', accent: 'red', archetype: 'check', cardStyle: { flex: '3 1 0' } },
      ] },
      { stack: [
        { title: 'Contributing TAC Cases', sub: 'Most recent', accent: 'blue', meta: true, archetype: 'table', rows: 10, tcols: 5, bodyClass: 'nopad', grow: true },
      ] },
    ],
  };
  /* ---- live adapter: map the page's real response -> the `d` render() expects -------
     Source is identical for first paint and refresh:
       window.initialData            (synchronous at DOMContentLoaded)  — Class A
       GET get-threat-level-data     (the ~60s AJAX poll, teed by boot's interceptor)
     Both carry { cases[10]{id,name,control,organization_data,threat_level,created_at},
                  casesCountByThreatLevel{1,2} }  (confirmed live + in endpoints-digest). */
  const CODE = { 1: 'NONE', 2: 'SBEAR', 3: 'TEAR', 4: 'TEVR', 5: 'INCIDENT' };
  function scopeFromPage(s) {
    try {
      const sel = s.doc && s.doc.querySelector('select');
      const opt = sel && sel.selectedOptions && sel.selectedOptions[0];
      const t = opt && opt.textContent.trim();
      if (t) return t;
    } catch (e) {}
    return null;
  }
  function adapt(s) {
    // prefer the freshest teed poll response; fall back to the boot-time initialData
    const raw = s.latest('get-threat-level-data') || s.initialData;
    if (!raw || !Array.isArray(raw.cases)) return s.prev || null; // nothing usable yet
    const lvl = (raw.cases[0] && raw.cases[0].threat_level) || 1;
    const counts = {};
    for (let i = 1; i <= 5; i++) counts[i] = (raw.casesCountByThreatLevel && raw.casesCountByThreatLevel[i]) || 0;
    const account = scopeFromPage(s) || (s.prev && s.prev.account) || 'All Accounts';
    return {
      account, level: lvl, code: CODE[lvl] || ('L' + lvl), counts,
      cases: raw.cases.slice(0, 15).map(c => ({
        id: c.id,
        account: c.organization_data,
        level: c.threat_level,
        owner: c.control === 'Glesec' ? 'GLESEC' : c.organization_data,
        created: c.created_at
      }))
    };
  }

  (window.SW_WALLS = window.SW_WALLS || []).push({
    slug: '03-threat-level', match: /^\/threat-level\//, cls: 'A',
    endpoints: ['get-threat-level-data'], adapt, render, skel
  });
})();


/* ===== walls/04-cases.js                                               ===== */

/* Wall 04 — Cases / Response Command */
(function () {
  const { h, card, badge, countUp, shell, TIER, sevClass, PRIORITY } = window.SW;
  const slaBadge = s => s === 'breach' ? badge('SLA Breached', 'is-breach')
    : s === 'near' ? badge('Near Breach', 'is-warn')
    : badge('On Track', 'is-ok');
  const prioCls = sevClass;   // canonical badge class (was hardcoded 'is-high' -> everything orange)

  const KPICOL = { 'c-red': 'var(--red)', 'c-orange': 'var(--orange)', 'c-yellow': 'var(--yellow)', 'c-blue': 'var(--blue)', 'c-green': 'var(--green)', 'c-violet': 'var(--violet)' };
  function kpi(label, value, color, foot) {
    const c = KPICOL[color] || color;
    const v = h('div', null, '0');
    v.style.cssText = `font-family:Inter;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;font-size:38px;background:linear-gradient(180deg,color-mix(in srgb, ${c} 85%, white),${c});-webkit-background-clip:text;background-clip:text;color:transparent;`;
    countUp(v, value, 1200);
    return h('div', {
      style: {
        flex: '1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: '7px', position: 'relative', overflow: 'hidden'
      }
    },
      h('div', { style: { fontSize: '10.5px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-subtle)' } }, label),
      v,
      foot ? h('div', { style: { fontSize: '11px', color: 'var(--fg-faint)' } }, foot) : null);
  }

  // Intensity heatmap: shade each cell by log value within its status column.
  // Min 10% opacity for very small (>0) values so they stay readable but quiet.
  function heatCell(v, max, col) {
    const on = v > 0;
    const inten = on ? Math.log(v + 1) / Math.log(max + 1) : 0;
    const op = Math.max(10, Math.round(8 + inten * 30));
    return h('td', { class: 'num' },
      h('span', {
        style: {
          display: 'inline-block', minWidth: '58px', padding: '6px 9px', borderRadius: '7px',
          fontFamily: 'var(--mono)', fontWeight: '700',
          background: on ? `color-mix(in srgb, ${col} ${op}%, transparent)` : 'transparent',
          color: on ? `color-mix(in srgb, ${col} 60%, white)` : 'var(--fg-faint)'
        }
      }, SW.fmt(v)));
  }

  function render(rootEl, d) {
    const k = d.kpis;
    // top-right status = real SLA / critical posture from the KPI aggregates
    const caseStatus = k.slaBreached > 0 ? { tone: 'red', label: SW.fmt(k.slaBreached) + ' SLA Breached' }
      : k.criticalOpen > 0 ? { tone: 'orange', label: SW.fmt(k.criticalOpen) + ' Critical Open' }
        : { tone: 'green', label: 'On Track' };
    const root = shell({ title: 'Cases / Response Command', sub: 'Triage & SLA Posture', account: d.account, status: caseStatus });
    const main = root._main;
    main.style.gridTemplateRows = 'auto 1fr';

    /* KPI row */
    const kpis = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '16px' } },
      kpi('Critical Open', k.criticalOpen, 'c-red', 'priority severe'),
      kpi('High Open', k.highOpen, 'c-orange', 'awaiting action'),
      kpi('SLA Breached', k.slaBreached, 'c-red', 'past deadline'),
      kpi('Near SLA Breach', k.nearSla, 'c-yellow', 'executive attention'),
      kpi('New · Last 24h', k.new24h, 'c-blue', 'inbound'),
      kpi('Closed · Last 24h', k.closed24h, 'c-green', 'resolved'));

    /* lower */
    const lower = h('div', { style: { display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '18px', minHeight: '0' } });

    // Future-proof: render ALL cases the endpoint returns (no cap); rank by position so it
    // works whether or not the payload includes a rank field. Density adapts to fit up to ~15 rows.
    const caseRows = d.cases.map((c) => h('tr', null,
      h('td', { class: 'mono', style: { color: 'var(--blue)' } }, '#' + c.id),
      h('td', null, badge('L' + c.level + ' · ' + TIER[c.level].name, TIER[c.level].c)),
      h('td', { class: 'strong', style: { maxWidth: '440px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, c.title),
      h('td', { class: 'muted' }, c.account),
      h('td', null, badge(c.priority, prioCls(c.priority))),
      h('td', null, slaBadge(c.sla)),
    ));
    const caseDensity = d.cases.length > 12 ? 'compact' : d.cases.length > 10 ? '' : 'roomy';
    const casesCard = card({ title: 'Action-Required Cases', sub: 'Severe backlog', meta: 'Top ' + d.cases.length, accent: 'red', bodyClass: 'nopad', class: '' },
      h('div', { style: { padding: '2px 8px' } },
        h('table', { class: 'sw-table ' + caseDensity },
          h('thead', null, h('tr', null, h('th', null, 'Case'), h('th', null, 'Threat'), h('th', null, 'Title'), h('th', null, 'Account'), h('th', null, 'Priority'), h('th', null, 'Status / SLA'))),
          h('tbody', null, ...caseRows))));

    const STAT = [['new', 'var(--blue)'], ['answered', 'var(--orange)'], ['suspended', 'var(--violet)'], ['closed', 'var(--green)']];
    const maxByStat = {};
    STAT.forEach(([key]) => { maxByStat[key] = Math.max(1, ...d.queues.map(q => q[key])); });
    const qRows = d.queues.map(q => h('tr', null,
      h('td', { class: 'strong', style: { maxWidth: '230px' } }, q.name),
      ...STAT.map(([key, col]) => heatCell(q[key], maxByStat[key], col))));
    const heatCard = card({ title: 'Queue Heatmap', sub: 'Cases by queue & status', accent: 'violet', bodyClass: 'nopad' },
      h('div', { style: { padding: '2px 8px' } },
        h('table', { class: 'sw-table' },
          h('thead', null, h('tr', null, h('th', null, 'Queue'),
            h('th', { class: 'num' }, 'New'), h('th', { class: 'num' }, 'Answered'), h('th', { class: 'num' }, 'Suspended'), h('th', { class: 'num' }, 'Closed'))),
          h('tbody', null, ...qRows))));

    // Response Summary scorecard (gallery-cases-summary option 1: neutral numbers, colour only in a dot)
    const netBacklog = k.new24h - k.closed24h;
    const closurePct = k.new24h ? (k.closed24h / k.new24h * 100) : 0;
    const activeWorkload = d.queues.reduce((s, q) => s + q.new + q.answered + q.suspended, 0);
    const resolvedTotal = d.queues.reduce((s, q) => s + q.closed, 0);
    const summaryCards = [
      ['Net Backlog · 24h', (netBacklog >= 0 ? '+' : '−') + SW.fmt(Math.abs(netBacklog)), '#ef4444', 'inbound − resolved'],
      ['Closure Rate', closurePct.toFixed(1) + '%', '#22c55e', SW.fmt(k.closed24h) + ' of ' + SW.fmt(k.new24h)],
      ['Active Workload', SW.fmt(activeWorkload), '#f59e0b', 'in progress'],
      ['SLA Breached', SW.fmt(k.slaBreached), '#ef4444', 'past deadline'],
      ['Near Breach', SW.fmt(k.nearSla), '#eab308', 'exec attention'],
      ['Resolved · total', SW.fmt(resolvedTotal), '#3b82f6', 'all-time closed'],
    ];
    const summaryBody = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(3, 1fr)', gap: '14px', height: '100%' } });
    summaryBody.innerHTML = summaryCards.map(([l, v, c, s]) =>
      `<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:11px;padding:15px 17px;display:flex;flex-direction:column;justify-content:center;gap:7px;min-height:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--fg-subtle);">${l}</div>
          <span style="width:7px;height:7px;border-radius:50%;flex:0 0 auto;background:${c};"></span>
        </div>
        <div style="font-family:Inter;font-weight:700;font-size:30px;line-height:1;font-variant-numeric:tabular-nums;color:var(--fg);">${v}</div>
        <div style="font-size:10.5px;color:var(--fg-faint);">${s}</div>
      </div>`).join('');
    const slaCard = card({ title: 'Response Summary', sub: 'Operational scorecard', class: 'grow', bodyClass: 'pad' }, summaryBody);

    const rightCol = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } }, heatCard, slaCard);
    lower.appendChild(casesCard); lower.appendChild(rightCol);
    main.appendChild(kpis); main.appendChild(lower);
    rootEl.appendChild(root);
  }
  // Loading skeleton (Class A — normally instant from window.initialData; this is for the
  // all-walls-loading view / refresh fallback). KPI row, then cases table + heatmap/summary.
  const skel = {
    topbar: { title: 'Cases / Response Command', sub: 'Triage & SLA Posture', status: { loading: true } },
    rows: 'auto 1fr',
    cells: [
      { raw: 'kpiRow', n: 6 },
      { grid: '1.55fr 1fr', cards: [
        { title: 'Action-Required Cases', sub: 'Severe backlog', meta: true, accent: 'red', archetype: 'table', rows: 10, tcols: 6, bodyClass: 'nopad' },
        { stack: [
          { title: 'Queue Heatmap', sub: 'Cases by queue & status', accent: 'violet', archetype: 'table', rows: 5, tcols: 5, bodyClass: 'nopad' },
          { title: 'Response Summary', sub: 'Operational scorecard', archetype: 'summary6', bodyClass: 'pad', grow: true },
        ] },
      ] },
    ],
  };
  /* ---- live adapter: get-incidents-remediation-cases / window.initialData -> d -----
     casesStatistics values are STRINGS; queue_<id>_<state> keys join to queues[{id,name}].
     SLA state per case derives from the real elapsed / executiveAction booleans
     (elapsed -> breach, executiveAction -> near, else on-track). Aggregate
     elapsedCaseCount / executiveActionCaseCount drive the SLA KPI tiles. */
  const PRIO = PRIORITY;   // canonical backend priority_id -> label (one place: SW.PRIORITY)
  const num = v => { const n = +v; return isFinite(n) ? n : 0; };
  function scopeFromPage(s) {
    try { const sel = s.doc && s.doc.querySelector('select'); const o = sel && sel.selectedOptions && sel.selectedOptions[0]; const t = o && o.textContent.trim(); if (t) return t; } catch (e) {}
    return null;
  }
  function adapt(s) {
    const raw = s.latest('get-incidents-remediation-cases') || s.initialData;
    if (!raw || !raw.casesStatistics) return s.prev || null;
    const st = raw.casesStatistics;
    const kpis = {
      criticalOpen: num(st.critical_open), highOpen: num(st.high_open),
      slaBreached: num(raw.elapsedCaseCount), nearSla: num(raw.executiveActionCaseCount),
      new24h: num(st.new_last_24h), closed24h: num(st.closed_last_24h)
    };
    const cases = (raw.cases || []).map((c, i) => ({
      rank: i + 1, level: c.threat_level, id: c.id, title: c.name,
      priority: PRIO[c.priority] || ('P' + c.priority), account: c.organization_data,
      sla: c.elapsed ? 'breach' : (c.executiveAction ? 'near' : 'ok')
    }));
    const queues = (raw.queues || []).map(q => ({
      name: q.name,
      new: num(st['queue_' + q.id + '_new']), answered: num(st['queue_' + q.id + '_answered']),
      suspended: num(st['queue_' + q.id + '_suspended']), closed: num(st['queue_' + q.id + '_closed'])
    }));
    const account = scopeFromPage(s) || (s.prev && s.prev.account) || 'All Accounts';
    return { account, kpis, cases, queues };
  }

  (window.SW_WALLS = window.SW_WALLS || []).push({
    slug: '04-cases-response', match: /^\/goc-wall\//, cls: 'A',
    endpoints: ['get-incidents-remediation-cases'], adapt, render, skel
  });
})();


/* ===== walls/05-map.js                                                 ===== */

/* Wall 05 — GLESEC Threat Intelligence Activity (rebuilt world map + attack arcs) */
(function () {
  const { h, svg, card, badge, shell, sevColor, sevClass } = window.SW;
  const MW = 1000, MH = 500;
  // NO hardcoded geography. Every source AND destination point comes from the wall's own
  // get-monitor-wall-map-data response (real per-IP geolocation: start_lat/lon -> end_lat/lon),
  // exactly like the original page feeds its Leaflet migrationLayer. We only PROJECT those
  // real lat/lon onto the dot-grid (equirectangular), so the points land where the original's do.
  // Colours come from the canonical severity palette (SW.sevColor) — NOT the backend's per-row
  // color field — so the map matches every other wall (low=yellow, med=orange, high=red, crit=pink).
  const ll = (lon, lat) => [(lon + 180) / 360 * MW, (90 - lat) / 180 * MH];
  const fin = n => { const v = +n; return isFinite(v) ? v : null; };

  function worldMap(d) {
    const W = window.SW_WORLD || { dots: [], GW: 1, GH: 1 };
    const g = svg('svg', { viewBox: `0 0 ${MW} ${MH}`, width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid slice', style: 'display:block;' });
    const defs = svg('defs'); defs.innerHTML = `
      <radialGradient id="oceang" cx="50%" cy="42%" r="78%">
        <stop offset="0%" stop-color="#16161a"/><stop offset="60%" stop-color="#101013"/><stop offset="100%" stop-color="#0a0a0c"/>
      </radialGradient>
      <radialGradient id="hubg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>`;
    g.appendChild(defs);
    g.appendChild(svg('rect', { x: 0, y: 0, width: MW, height: MH, fill: 'url(#oceang)' }));

    // graticule
    const grat = svg('g', { stroke: 'rgba(255,255,255,0.045)', 'stroke-width': 1 });
    for (let lon = -150; lon <= 150; lon += 30) { const [x] = ll(lon, 0); grat.appendChild(svg('line', { x1: x, y1: 0, x2: x, y2: MH })); }
    for (let lat = -60; lat <= 60; lat += 30) { const [, y] = ll(0, lat); grat.appendChild(svg('line', { x1: 0, y1: y, x2: MW, y2: y })); }
    g.appendChild(grat);

    // land dots
    const land = svg('g', { fill: 'rgba(255,255,255,0.17)' });
    const sx = MW / (W.GW - 1), sy = MH / (W.GH - 1);
    for (const [gx, gy] of W.dots) {
      if (gy === 0) continue; // drop the full top grid row (reads as a dotted border at the map's top edge)
      land.appendChild(svg('circle', { cx: (gx * sx).toFixed(1), cy: (gy * sy).toFixed(1), r: 1.5 }));
    }
    g.appendChild(land);

    const arcs = svg('g');
    const hubs = {};      // distinct destination POPs, keyed by rounded real coords: "lat,lon" -> {x,y}
    // cap travelling particles (SMIL animateMotion is the costly part) — spread evenly across events
    const dotStride = Math.max(1, Math.ceil(d.feed.length / 56));
    // NOTE perf: arcs are STATIC route-lines (painted once). Motion is carried only by the capped
    // particle set below. No per-arc filters. This keeps ~200 arcs cheap.
    d.feed.forEach((f, i) => {
      const sLat = fin(f.sLat), sLon = fin(f.sLon), eLat = fin(f.eLat), eLon = fin(f.eLon);
      if (sLat == null || sLon == null || eLat == null || eLon == null) return;   // need real geo
      const [x1, y1] = ll(sLon, sLat);   // REAL source point (no marker — just where the arc starts)
      const [x2, y2] = ll(eLon, eLat);   // REAL destination point
      const col = sevColor(f.severity);   // canonical severity colour
      // gentle bow so overlapping src->dst pairs separate a little (purely cosmetic, not positional)
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1; const len = Math.hypot(dx, dy) || 1;
      const lift = Math.min(150, len * 0.32);
      const cx = mx + (-dy / len) * lift, cy = my + (dx / len) * lift - 18;
      const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      arcs.appendChild(svg('path', { d: path, fill: 'none', stroke: col, 'stroke-width': f.severity === 'critical' ? 2 : 1.4, 'stroke-linecap': 'round', opacity: 0.32, 'stroke-dasharray': '5 9' }));
      // travelling particle — capped subset; mini dot, same hue as its arc but brighter
      if (f.animate !== false && i % dotStride === 0) {
        const dur = (2.6 + (i % 5) * 0.5 + ((i * 37) % 13) / 13 * 1.4).toFixed(1);
        const dot = svg('circle', { r: f.severity === 'critical' ? 2.2 : 1.8, fill: `color-mix(in srgb, ${col} 65%, white)` });
        dot.appendChild(svg('animateMotion', { dur: dur + 's', repeatCount: 'indefinite', path, rotate: 'auto' }));
        arcs.appendChild(dot);
      }
      // register the destination POP — key by PROJECTED pixel (rounded) so points that land on
      // the same spot draw a single marker (no doubled-up intensity from overlapping bursts)
      const hk = Math.round(x2 / 2) * 2 + ',' + Math.round(y2 / 2) * 2;
      if (!hubs[hk]) hubs[hk] = { x: x2, y: y2 };
    });
    g.appendChild(arcs);
    // destination POP markers only (cyan burst + blip + core) — no labels, no source markers
    Object.keys(hubs).forEach(hk => {
      const H = hubs[hk];
      // 50% dimmer + 50% smaller ping radius + 50% smaller dot than before
      g.appendChild(svg('circle', { cx: H.x, cy: H.y, r: 12, fill: 'url(#hubg)', opacity: 0.3 }));
      g.appendChild(svg('circle', { cx: H.x, cy: H.y, r: 7.5, fill: 'none', stroke: '#22d3ee', 'stroke-width': 1.2, opacity: 0.25, style: 'transform-box:fill-box;transform-origin:center;animation:blip 2.8s ease-out infinite;' }));
      g.appendChild(svg('circle', { cx: H.x, cy: H.y, r: 2.25, fill: '#22d3ee', opacity: 0.6, style: 'filter:drop-shadow(0 0 5px #22d3ee);' }));
    });
    return g;
  }

  const counterEb = (t) => h('div', { style: { fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-subtle)' } }, t);
  const counterMetric = (v, col, name, key) => h('div', null,
    h('div', { 'data-ctr': key, style: { fontFamily: 'var(--mono)', fontSize: '24px', fontWeight: '800', color: `color-mix(in srgb, ${col} 84%, white)`, lineHeight: '1' } }, SW.fmt(v)),
    h('div', { style: { fontSize: '9.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: `color-mix(in srgb, ${col} 60%, white)`, marginTop: '4px' } }, name));
  function counterTile(label, c, prefix) {
    return h('div', { style: { flex: '1', padding: '0 18px' } },
      counterEb(label),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '11px' } },
        counterMetric(c.critical, '#dc2626', 'Critical', prefix + '-critical'),  // tailwind red-600
        counterMetric(c.high, '#ea580c', 'High', prefix + '-high')));            // tailwind orange-600
  }
  const counterDivider = () => h('div', { style: { width: '1px', alignSelf: 'stretch', flex: '0 0 auto', margin: '2px 0', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.14) 18%, rgba(255,255,255,0.14) 82%, transparent)' } });

  function render(rootEl, d) {
    const root = shell({ title: 'Threat Intelligence Activity', sub: 'Global Attack Surface', account: d.account, status: { ok: d.status === 'OPERATIONAL', label: d.status } });
    const main = root._main;
    main.style.gridTemplateColumns = '1.62fr 1fr';
    main.style.gridTemplateRows = '1fr';

    /* LEFT: counters + map */
    const counters = card({ title: 'Attack Counters', sub: 'Critical & High · 1h / 24h / 7d', accent: 'red', bodyClass: 'nopad' },
      h('div', { class: 'flex', style: { alignItems: 'stretch', padding: '14px 10px 16px' } },
        counterTile('Last 1h', d.counters['1h'], '1h'),
        counterDivider(),
        counterTile('Last 24h', d.counters['24h'], '24h'),
        counterDivider(),
        counterTile('Last 7d', d.counters['7d'], '7d')));
    // Legend lists the severities actually present, coloured by the canonical palette (sevColor),
    // so it always matches the arcs and the rest of the walls.
    const SEV_RANK = { blocked: 0, critical: 1, high: 2, medium: 3, informational: 4, low: 5 };
    const rank = s => (SEV_RANK[s] === undefined ? 9 : SEV_RANK[s]);
    const sevsSeen = {};
    (d.feed || []).forEach(f => {
      const sev = String(f.severity || '').split(',')[0].trim().toLowerCase();
      if (sev) sevsSeen[sev] = true;
    });
    let legendItems = Object.keys(sevsSeen).sort((a, b) => rank(a) - rank(b)).map(sev => [sev, sevColor(sev)]);
    if (!legendItems.length) legendItems = [['high', sevColor('high')], ['informational', sevColor('info')], ['low', sevColor('low')]];
    const legend = h('div', {
      style: {
        position: 'absolute', left: '16px', bottom: '14px', display: 'flex', gap: '16px',
        padding: '9px 14px', borderRadius: '10px', background: 'rgba(8,10,14,0.72)',
        border: '1px solid var(--border)', backdropFilter: 'blur(4px)'
      }
    }, ...legendItems.map(([l, c]) =>
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', color: 'var(--fg-muted)', textTransform: 'capitalize', letterSpacing: '0.04em' } },
        h('span', { style: { width: '9px', height: '9px', borderRadius: '50%', background: c, boxShadow: '0 0 8px ' + c } }), l)));
    const hubTag = h('div', {
      style: {
        position: 'absolute', right: '16px', bottom: '14px', display: 'flex', alignItems: 'center', gap: '8px',
        padding: '9px 14px', borderRadius: '10px', background: 'rgba(8,10,14,0.72)',
        border: '1px solid var(--border)', fontSize: '11.5px', color: 'var(--fg-muted)', letterSpacing: '0.04em'
      }
    }, h('span', { style: { width: '9px', height: '9px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' } }),
      'Defended · ' + ([...new Set((d.feed || []).map(f => f.client).filter(Boolean))].slice(0, 3).join(' · ') || 'assets'));
    const mapSvgEl = worldMap(d);   // display-only — zoom/pan removed (it was unused on the wall)
    const mapCard = card({ title: 'Live Attack Map', sub: 'Inbound · MSS-DDOS', accent: 'cyan', meta: 'realtime', bodyClass: 'nopad', class: 'grow' },
      h('div', { style: { position: 'relative', height: '100%', minHeight: '0' } }, mapSvgEl, legend, hubTag));
    const left = h('div', { class: 'flex col gap-m', style: { minHeight: '0' } }, counters, mapCard);

    /* RIGHT: live feed */
    // severity badge colour from the canonical palette (same as the arcs/legend/other walls)
    const sevBadge = f => {
      const label = String(f.severity || '').split(',')[0].trim();
      return h('span', { class: 'sw-badge', style: '--c:' + sevColor(label) + ';' }, h('span', { class: 'dot' }), label);
    };
    const mkRow = f => h('tr', null,
      h('td', { class: 'strong' }, f.client),
      h('td', null, h('span', { class: 'mono', style: { fontSize: '12px', color: 'var(--fg-muted)' } }, f.srcIp),
        h('div', { class: 'sw-subtle', style: { fontSize: '11px', textTransform: 'capitalize' } }, f.country)),
      h('td', { class: 'mono muted', style: { fontSize: '12px' } }, f.dst),
      h('td', null, sevBadge(f)));
    const feedBody = h('tbody', null, ...d.feed.map(mkRow));
    const feedScroll = h('div', { style: { padding: '0 8px', height: '100%', overflow: 'hidden' } },
      h('table', { class: 'sw-table sw-feed-table' },
        h('thead', null, h('tr', null, h('th', null, 'Client'), h('th', null, 'Source'), h('th', null, 'Target'), h('th', null, 'Severity'))),
        feedBody));
    // auto-scroll marquee. We do NOT scroll the container (programmatic scrollTop makes the sticky
    // header re-resolve its position every frame -> visible header jitter). Instead the HEADER stays
    // fixed and only the tbody is translated up via a GPU transform; rows pass up behind the opaque
    // header. Seamless loop at one-set height. Stops when this render is replaced.
    requestAnimationFrame(function setup() {
      if (!feedScroll.isConnected) { requestAnimationFrame(setup); return; }
      const singleH = feedBody.scrollHeight;
      const thead = feedScroll.querySelector('thead');
      const headH = thead ? thead.offsetHeight : 0;
      if (singleH <= feedScroll.clientHeight - headH - 4) return;   // fits — no scroll needed
      d.feed.forEach(f => feedBody.appendChild(mkRow(f)));          // second identical set for the loop
      feedBody.style.willChange = 'transform';
      const speed = 0.7; // px/frame (~42px/s)
      let pos = 0;
      (function tick() {
        if (!feedScroll.isConnected) return;
        pos += speed;
        if (pos >= singleH) pos -= singleH;
        feedBody.style.transform = 'translateY(' + (-pos).toFixed(2) + 'px)';
        requestAnimationFrame(tick);
      })();
    });
    const feedCard = card({ title: 'Live Attack Feed', sub: 'Source → Destination', accent: 'red', meta: d.feed.length + ' events', bodyClass: 'nopad', class: 'grow' }, feedScroll);

    main.appendChild(left); main.appendChild(feedCard);
    rootEl.appendChild(root);
  }
  // Loading skeleton — left = counters + map panel (graticule), right = live feed table.
  // Class B wall: paints empty then hydrates over a per-client map-data fan-out.
  const skel = {
    topbar: { title: 'Threat Intelligence Activity', sub: 'Global Attack Surface', status: { loading: true } },
    columns: '1.62fr 1fr', rows: '1fr',
    cells: [
      { stack: [
        { title: 'Attack Counters', sub: 'Critical & High · 1h / 24h / 7d', accent: 'red', archetype: 'counters3', bodyClass: 'nopad' },
        { title: 'Live Attack Map', sub: 'Inbound · MSS-DDOS', accent: 'cyan', meta: true, archetype: 'map', bodyClass: 'nopad', grow: true },
      ] },
      { title: 'Live Attack Feed', sub: 'Source → Destination', accent: 'red', meta: true, archetype: 'table', rows: 12, tcols: 4, bodyClass: 'nopad', grow: true },
    ],
  };
  /* ---- live adapter: scrape the wall's OWN rendered DOM ----------------------------
     The map/feed XHR (get-monitor-wall-map-data) is per-client and was never captured with
     a populated body; the 3 counter widgets (696/697/698 = 1h/24h/7d) are indistinguishable
     by response (all labelled ["Critical","High"] — the widget_id is only in the POST body).
     So, exactly as this wall's data was originally derived, we read the page's finished DOM
     (which the overlay model keeps intact): counters from .widget-box-data, feed from the
     live .content_scroll table. XHR responses just trigger a re-scrape via boot's scheduler. */
  function txt(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function numC(el) { if (!el) return 0; const n = +String(el.textContent || '').replace(/[^0-9.]/g, ''); return isFinite(n) ? n : 0; }
  function counterFrom(doc, id) {
    const el = doc.getElementById(id), box = el && el.closest && el.closest('.widget-box-data');
    if (!box) return { critical: 0, high: 0 };
    return { critical: numC(box.querySelector('.splunk-message-container.Critical')), high: numC(box.querySelector('.splunk-message-container.High')) };
  }
  function adapt(s) {
    const doc = s.doc;
    const counters = { '1h': counterFrom(doc, 'element696'), '24h': counterFrom(doc, 'element697'), '7d': counterFrom(doc, 'element698') };

    // PRIMARY — geocoded events straight from the wall's own get-monitor-wall-map-data response
    // (real per-IP start_lat/lon -> end_lat/lon + colour/severity), the SAME rows the original
    // page feeds to its Leaflet migrationLayer. One response per account; keep the latest per
    // account (a later null response clears a client whose attacks aged out).
    const responses = (s.all && s.all('get-monitor-wall-map-data')) || [];
    const byClient = {};
    responses.forEach(j => { if (j && j.client) byClient[j.client] = j; });
    let feed = [];
    Object.keys(byClient).forEach(name => {
      const j = byClient[name], L = j.data_labels;
      if (!Array.isArray(j.data) || !L) return;
      const idx = n => L.findIndex(x => String(x).toLowerCase() === n);
      const I = { sl: idx('start_lat'), so: idx('start_lon'), el: idx('end_lat'), eo: idx('end_lon'), src: idx('src'), dst: idx('dest'), sc: idx('src_country'), dc: idx('dest_country'), sev: idx('severity'), col: idx('color'), vec: idx('source_index'), an: idx('animate') };
      j.data.forEach(v => {
        const sLat = +v[I.sl], sLon = +v[I.so], eLat = +v[I.el], eLon = +v[I.eo];
        if (![sLat, sLon, eLat, eLon].every(isFinite) || !v[I.src] || !v[I.dst]) return;
        feed.push({
          client: j.client, vector: I.vec !== -1 ? (v[I.vec] || '') : '', srcIp: v[I.src], dst: v[I.dst],
          country: String((I.sc !== -1 && v[I.sc]) || '').toLowerCase(), destCountry: I.dc !== -1 ? (v[I.dc] || '') : '',
          severity: String((I.sev !== -1 && v[I.sev]) || '').toLowerCase(), color: I.col !== -1 ? (v[I.col] || null) : null,
          sLat: sLat, sLon: sLon, eLat: eLat, eLon: eLon, animate: I.an === -1 ? true : String(v[I.an]) !== 'false'
        });
      });
    });

    // FALLBACK — before the XHR is seen, scrape the page's own feed list (country names only, no
    // coords; such rows won't draw arcs but counters/feed still render until the XHR arrives).
    if (!feed.length) {
      const cells = [].slice.call(doc.querySelectorAll('.content_scroll ul li'));
      for (let i = 0; i + 6 < cells.length; i += 7) {
        const client = txt(cells[i]);
        if (!client && !txt(cells[i + 2])) continue;
        feed.push({ client: client, vector: txt(cells[i + 1]), srcIp: txt(cells[i + 2]), country: txt(cells[i + 3]).toLowerCase(), dst: txt(cells[i + 4]), severity: txt(cells[i + 5]).toLowerCase(), action: txt(cells[i + 6]) });
      }
    }

    const totalCount = counters['1h'].critical + counters['1h'].high + counters['24h'].critical + counters['24h'].high + counters['7d'].critical + counters['7d'].high;
    if (!feed.length && totalCount === 0) return s.prev || null;   // page hasn't hydrated yet

    const bad = doc.getElementById('status-bad');
    const badVisible = bad && bad.style.display !== 'none';
    const status = badVisible ? 'DEGRADED' : 'OPERATIONAL';

    const sel = doc.getElementById('account_id');
    const account = (sel && sel.selectedOptions && sel.selectedOptions[0] && sel.selectedOptions[0].textContent.trim()) || (s.prev && s.prev.account) || 'All Accounts';

    return { account: account, status: status, counters: counters, feed: feed.slice(0, 200) };
  }

  // change-detection: boot re-renders on every poll (every 5-10s), which rebuilds the SVG and
  // restarts all arc animations -> visible jitter. We gate a full re-render on the FEED set only
  // (account + status + the rows that drive the arcs), NOT the counters. So when only counter
  // numbers tick, boot keeps the live map node (animations keep running) and calls refresh() to
  // update the counters in place. The map is rebuilt only when rows actually change.
  function signature(d) {
    if (!d) return null;
    const f = (d.feed || []).map(r => r.srcIp + '|' + r.country + '|' + r.severity + '|' + r.dst + '|' + r.client).sort().join(';');
    return (d.account || '') + '#' + (d.status || '') + '#' + f;
  }
  function refresh(node, d) {
    if (!node || !d) return;
    const set = (k, v) => { const el = node.querySelector('[data-ctr="' + k + '"]'); if (el) el.textContent = SW.fmt(v); };
    ['1h', '24h', '7d'].forEach(p => { const c = (d.counters && d.counters[p]) || {}; set(p + '-critical', c.critical || 0); set(p + '-high', c.high || 0); });
  }

  (window.SW_WALLS = window.SW_WALLS || []).push({
    slug: '05-map-threat-activity', match: /^\/map-wall\//, cls: 'B',
    endpoints: ['get-monitor-wall-map-data', 'get-widget-data-wall'], adapt, render, skel, signature, refresh
  });
})();


/* ===== walls/06-prtg.js                                                ===== */

/* Wall 06 — Monitoring Wall MSS-CSM (PRTG) — rebuilt gauges + ping chart */
(function () {
  const { h, svg, card, badge, gauge, shell, sevClass } = window.SW;
  const slaBadge = s => /out/i.test(s) ? badge('Out of SLA', 'is-breach') : badge('In SLA', 'is-ok');
  const statusBadge = s => /open/i.test(s) ? badge(s, 'is-open') : /answer/i.test(s) ? badge(s, 'is-warn') : badge(s, '');

  // thin ring + big number inside, no glow (gallery-prtg-gauges option 2)
  function ringSvg(value, max, color, displayText, size, sw) {
    const R0 = (size - sw) / 2 - 1, cx = size / 2, CIRC = 2 * Math.PI * R0, f = Math.max(0, Math.min(1, value / max));
    const el = h('div', { style: { flex: '0 0 auto', width: size + 'px', height: size + 'px' } });
    el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${cx}" cy="${cx}" r="${R0}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="${sw}"/><circle cx="${cx}" cy="${cx}" r="${R0}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${(f * CIRC).toFixed(1)} ${CIRC}" transform="rotate(-90 ${cx} ${cx})"/><text x="${cx}" y="${(cx + size * 0.095).toFixed(1)}" text-anchor="middle" font-family="Inter" font-size="${(size * 0.28).toFixed(0)}" font-weight="800" fill="#fafafa">${displayText}</text></svg>`;
    return el;
  }
  function gaugeCard(label, value, max, color, unit, display) {
    return h('div', { class: 'sw-card', style: { flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '14px 18px' } },
      ringSvg(value, max, color, display != null ? display : value, 92, 6),
      h('div', null,
        h('div', { class: 'sw-kpi__label' }, label),
        h('div', { style: { fontSize: '15px', color: 'var(--fg-subtle)', marginTop: '6px' } }, unit)));
  }

  function lineChart(p) {
    const W = 960, H = 210, padL = 8, padR = 8, padT = 14, padB = 8;
    const n = p.avg.length; const all = p.max.concat(p.min);
    const lo = 0, hi = Math.max(...p.max) * 1.1;
    const xs = i => padL + i * (W - padL - padR) / (n - 1);
    const ys = v => H - padB - (v - lo) / (hi - lo) * (H - padT - padB);
    const path = arr => arr.map((v, i) => (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(v).toFixed(1)).join(' ');
    const g = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: '100%', preserveAspectRatio: 'none' });
    [0.25, 0.5, 0.75].forEach(f => g.appendChild(svg('line', { x1: 0, y1: H * f, x2: W, y2: H * f, stroke: 'rgba(255,255,255,0.05)', 'stroke-width': 1 })));
    // dotted min/max bounds, no band fill (gallery-prtg-ping option 3)
    g.appendChild(svg('path', { d: path(p.max), fill: 'none', stroke: 'rgba(244,63,94,0.55)', 'stroke-width': 1.3, 'stroke-dasharray': '2 3' }));
    g.appendChild(svg('path', { d: path(p.min), fill: 'none', stroke: 'rgba(132,204,22,0.5)', 'stroke-width': 1.3, 'stroke-dasharray': '2 3' }));
    g.appendChild(svg('path', { d: path(p.avg), fill: 'none', stroke: '#22d3ee', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', style: 'filter:drop-shadow(0 0 6px rgba(34,211,238,0.5));' }));
    return g;
  }

  // status dot + name + status text + % (gallery-prtg-availability option 2)
  function availBar(c) {
    const col = c.available >= 99 ? 'var(--green)' : c.available >= 85 ? 'var(--yellow)' : 'var(--red)';
    const status = c.down > 0 ? c.down.toFixed(1) + '% down' : c.degraded > 0 ? c.degraded.toFixed(1) + '% degraded' : 'fully operational';
    return h('tr', null,
      h('td', { class: 'strong' },
        h('span', { class: 'flex', style: { alignItems: 'center', gap: '9px' } },
          h('span', { style: { width: '9px', height: '9px', borderRadius: '50%', flex: '0 0 auto', background: col } }),
          c.client)),
      h('td', { class: 'muted', style: { fontSize: '12px' } }, status),
      h('td', { class: 'num', style: { color: `color-mix(in srgb, ${col} 62%, white)` } }, c.available.toFixed(1) + '%'));
  }

  function render(rootEl, d) {
    const g = d.gauges;
    const root = shell({ title: 'MSS-CSM Service Health · PRTG', sub: 'Continuous Service Monitoring', account: d.account, status: { ok: g.down === 0, label: g.down > 0 ? g.down + ' Services Down' : 'All Operational' } });
    const main = root._main;
    main.style.gridTemplateRows = 'auto 1fr 1.12fr';

    /* gauges */
    const avail = g.available, total = g.total;
    const gauges = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' } },
      gaugeCard('Total Monitored', total, total, 'var(--blue)', 'Web services', total),
      gaugeCard('Available Now', avail, total, 'var(--green)', Math.round(avail / total * 100) + '% of fleet', avail),
      gaugeCard('Down', g.down, total, 'var(--red)', 'Out of service', g.down),
      gaugeCard('Warning', g.warning, total, 'var(--yellow)', 'Degraded sensors', g.warning));

    /* row 2: critical down + degradation */
    const cdRows = d.criticalDown.map((r, i) => h('tr', null,
      h('td', { class: 'sw-rank' }, i + 1),
      h('td', null, badge(r.priority, sevClass(r.priority))),
      h('td', null, h('div', { class: 'strong' }, r.client), h('div', { class: 'sw-subtle', style: { fontSize: '12px' } }, r.site)),
      h('td', { class: 'muted', style: { maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, r.sensor),
      h('td', { class: 'num', style: { color: 'var(--red)', whiteSpace: 'nowrap' } }, r.downtime),
      h('td', null, slaBadge(r.sla)),
      h('td', { class: 'mono', style: { color: 'var(--blue)' } }, '#' + r.case),
      h('td', null, statusBadge(r.status))));
    const cdCard = card({ title: 'Critical Services Down', sub: 'Active outages', accent: 'red', meta: d.criticalDown.length + ' down', bodyClass: 'nopad' },
      h('div', { style: { padding: '2px 8px' } }, h('table', { class: 'sw-table' },
        h('thead', null, h('tr', null, h('th', null, '#'), h('th', null, 'Priority'), h('th', null, 'Client / Site'), h('th', null, 'Sensor / Message'), h('th', { class: 'num' }, 'Downtime'), h('th', null, 'SLA'), h('th', null, 'Case'), h('th', null, 'Status'))),
        h('tbody', null, ...cdRows))));

    const degRows = d.degradation.map((r, i) => h('tr', null,
      h('td', { class: 'sw-rank' }, i + 1),
      h('td', null, badge(r.priority, sevClass(r.priority))),
      h('td', { class: 'strong' }, r.client),
      h('td', { class: 'muted', style: { maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, r.sensor),
      h('td', null, badge('Warning', 'is-warn')),
      h('td', { class: 'mono', style: { color: 'var(--blue)' } }, '#' + r.case)));
    const degCard = card({ title: 'Service Degradation & Warnings', sub: 'Sensor warnings', accent: 'yellow', bodyClass: 'nopad' },
      h('div', { style: { padding: '2px 8px' } }, h('table', { class: 'sw-table' },
        h('thead', null, h('tr', null, h('th', null, '#'), h('th', null, 'Pri'), h('th', null, 'Client'), h('th', null, 'Sensor'), h('th', null, 'Issue'), h('th', null, 'Case'))),
        h('tbody', null, ...degRows))));

    const row2 = h('div', { style: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '18px', minHeight: '0' } }, cdCard, degCard);

    /* row 3: infra + by-client + ping */
    const inf = d.infra;
    // when Normal, keep it neutral/gray so it doesn't pull attention
    const infNormal = /normal/i.test(inf.status);
    const infCol = infNormal ? 'var(--fg-subtle)' : 'var(--green)';
    const infraCard = card({ title: 'Infrastructure & Certificates', accent: infNormal ? undefined : 'green' },
      h('div', { class: 'flex col center', style: { height: '100%', gap: '12px', justifyContent: 'center' } },
        h('div', { style: { fontSize: '34px', lineHeight: '1', color: infCol } }, '✓'),
        h('div', { class: 'sw-subtle', style: { fontSize: '13px', textAlign: 'center', maxWidth: '220px' } }, inf.message)));

    const byCard = card({ title: 'Availability by Client', accent: 'cyan', bodyClass: 'nopad' },
      h('div', { style: { padding: '2px 8px' } }, h('table', { class: 'sw-table' },
        h('thead', null, h('tr', null, h('th', null, 'Client'), h('th', null, 'Status'), h('th', { class: 'num' }, '%'))),
        h('tbody', null, ...d.byClient.map(availBar)))));

    const pingCard = card({ title: 'Ping Response Time', sub: 'ms · last hours', accent: 'cyan', bodyClass: 'pad' },
      h('div', { class: 'flex col', style: { height: '100%', gap: '8px' } },
        h('div', { class: 'flex gap-m', style: { fontSize: '12px' } },
          h('span', { style: { color: 'var(--cyan)' } }, '● Avg'),
          h('span', { style: { color: 'rgba(244,63,94,0.7)' } }, '— Max'),
          h('span', { style: { color: 'rgba(132,204,22,0.7)' } }, '— Min')),
        h('div', { style: { flex: '1', minHeight: '0' } }, lineChart(d.ping))));

    const row3 = h('div', { style: { display: 'grid', gridTemplateColumns: '0.8fr 1.1fr 1.6fr', gap: '18px', minHeight: '0' } }, infraCard, byCard, pingCard);

    main.appendChild(gauges); main.appendChild(row2); main.appendChild(row3);
    rootEl.appendChild(root);
  }
  // Loading skeleton — mirrors the 3-row layout (gauge strip / two tables / infra·client·ping).
  // Class B wall: PRTG hard-reloads every 120s, so this shows briefly on every reload.
  const skel = {
    topbar: { title: 'MSS-CSM Service Health · PRTG', sub: 'Continuous Service Monitoring', status: { loading: true } },
    rows: 'auto 1fr 1.12fr',
    cells: [
      { raw: 'gaugeStrip', n: 4 },
      { grid: '1.5fr 1fr', cards: [
        { title: 'Critical Services Down', sub: 'Active outages', accent: 'red', meta: true, archetype: 'table', rows: 5, tcols: 8, bodyClass: 'nopad' },
        { title: 'Service Degradation & Warnings', sub: 'Sensor warnings', accent: 'yellow', archetype: 'table', rows: 5, tcols: 6, bodyClass: 'nopad' },
      ] },
      { grid: '0.8fr 1.1fr 1.6fr', cards: [
        { title: 'Infrastructure & Certificates', archetype: 'check' },
        { title: 'Availability by Client', accent: 'cyan', archetype: 'table', rows: 6, tcols: 3, bodyClass: 'nopad' },
        { title: 'Ping Response Time', sub: 'ms · last hours', accent: 'cyan', archetype: 'chart', bodyClass: 'pad' },
      ] },
    ],
  };
  /* ---- live adapter: gauges + Splunk tables are SERVER-RENDERED into the DOM; ping is XHR --
     The four gauges (#element689/693/691/692 .gauge-value) and the four Splunk result-tables
     (#element694 critical-down, #element695 degradation, #element686 infra, #element688 by-client)
     are baked into the page HTML, so we scrape the live DOM (kept intact by the overlay model).
     The ping series comes from the widget-687 get-widget-data-wall response ([time,avg,min,max,span]).
     The wall hard-reloads every 120s — each reload re-runs us at document-start (its refresh). */
  function txt(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function gnum(v) { const n = +String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''); return isFinite(n) ? n : 0; }
  function gaugeVal(doc, id) { const el = doc.getElementById(id); const v = el && el.querySelector('.gauge-value'); return v ? gnum(v.textContent) : 0; }
  function clip(str, n) { str = str || ''; return str.length > n ? str.slice(0, n - 1) + '…' : str; }
  function scrapeTable(doc, id) {
    const root = doc.getElementById(id); if (!root) return [];
    const table = root.querySelector('table'); if (!table) return [];
    const cols = [].slice.call(table.querySelectorAll('thead th')).map(th => th.getAttribute('data-sort-key') || txt(th));
    const out = [];
    [].slice.call(table.querySelectorAll('tbody tr')).forEach(tr => {
      const tds = [].slice.call(tr.children); const o = {};
      tds.forEach((td, i) => { const k = cols[i]; if (k) { const t = txt(td); o[k] = (t === 'null') ? '' : t; } });
      if (Object.keys(o).length) out.push(o);
    });
    return out;
  }
  function adapt(s) {
    const doc = s.doc;
    const gauges = { total: gaugeVal(doc, 'element689'), available: gaugeVal(doc, 'element693'), down: gaugeVal(doc, 'element691'), warning: gaugeVal(doc, 'element692') };

    const criticalDown = scrapeTable(doc, 'element694').slice(0, 12).map(r => {
      let sen = r['Sensor'] || ''; const msg = r['Message'] || '', site = r['Site_Name'] || '';
      if (!sen || /^https?:\/\//.test(sen) || sen === site) sen = msg;
      else if (msg && msg !== sen) sen = sen + ' — ' + msg;
      return { priority: r['Priority'] || '', client: r['cust_name'] || '', site: site, sensor: clip(sen, 120), downtime: r['Down_Since'] || '', sla: r['SLA'] || '', case: r['Case #'] || '', status: r['Case Status'] || '' };
    });

    const degradation = scrapeTable(doc, 'element695').slice(0, 12).map(r => ({
      priority: r['Priority'] || '', client: r['cust_name'] || '', site: r['Site_Name'] || '', sensor: r['Sensor'] || '',
      issue: r['Issue'] || 'Sensor Warning', sla: r['SLA'] || '', case: r['Case #'] || '', status: r['Case Status'] || ''
    }));

    const infraRows = scrapeTable(doc, 'element686');
    let infra;
    if (!infraRows.length) infra = { status: 'Normal', message: 'No active alerts — all systems operating normally' };
    else { const r0 = infraRows[0]; const sev = (r0['Severity'] || '').replace(/[^\x20-\x7E]/g, '').trim(); infra = { status: sev || 'Normal', message: [r0['Site_Name'], r0['Issue']].filter(Boolean).join(' — ') || 'All systems operating normally' }; }

    const byClient = scrapeTable(doc, 'element688').map(r => ({ client: r['Client'] || '', available: gnum(r['Available']), degraded: gnum(r['Degraded']), down: gnum(r['Down']) }));

    // ping: the widget-687 time series. Identify it by its _time/ping labels (NOT just by shape —
    // the 18/19-column table responses also come through get-widget-data-wall and would otherwise match).
    // Real labels: ["_time","Ping Time (ms)","Minimum (ms)","Maximum (ms)","_span"].
    const ping = { avg: [], min: [], max: [] };
    s.all('get-widget-data-wall').forEach(r => {
      if (!r || !Array.isArray(r.data) || !r.data.length || !Array.isArray(r.data[0])) return;
      const labels = (r.data_labels || []).map(x => String(x).toLowerCase());
      // ping series only: the Splunk time field is exactly "_time" (NOT the degradation table's
      // "Response_Time" column) and/or a literal "ping" label.
      if (!labels.some(l => l === '_time' || l.indexOf('ping') !== -1 || l.indexOf('latency') !== -1)) return;
      let ai = labels.findIndex(l => /ping|avg/.test(l)), ni = labels.findIndex(l => /min/.test(l)), xi = labels.findIndex(l => /max/.test(l));
      if (ai < 0) ai = 1; if (ni < 0) ni = 2; if (xi < 0) xi = 3;
      ping.avg = r.data.map(row => gnum(row[ai])); ping.min = r.data.map(row => gnum(row[ni])); ping.max = r.data.map(row => gnum(row[xi]));
    });

    if (!gauges.total && !criticalDown.length && !byClient.length) return s.prev || null;  // not hydrated yet
    const sel = doc.querySelector('select');
    const account = (sel && sel.selectedOptions && sel.selectedOptions[0] && sel.selectedOptions[0].textContent.trim()) || (s.prev && s.prev.account) || 'All Accounts';
    return { account, gauges, criticalDown, degradation, infra, byClient, ping };
  }

  (window.SW_WALLS = window.SW_WALLS || []).push({
    slug: '06-mss-csm-prtg', match: /^\/mss-csm-prtg\//, cls: 'B',
    endpoints: ['get-widget-data-wall'], adapt, render, skel
  });
})();


/* ===== boot.js                                                         ===== */

/* ============================================================================
   SKYWATCH redesign — generic userscript runtime (wall-agnostic).
   Bundled LAST by build-userscript.js, after common.js + skeleton.js + walls/*.js.

   Responsibilities (all of which are identical across the 6 walls):
     1. DISPATCH   — pick the SW_WALLS entry whose `match` fits location.pathname.
     2. OBSERVE    — at document-start, tee the PAGE's own XHR/fetch responses for
                     the wall's endpoints. We never fetch/auth/fan-out ourselves; we
                     let the page do it (it owns the _token, account list, polling)
                     and just watch the bodies fly by.
     3. RENDER     — build `d` via wall.adapt(sources) and paint wall.render().
                     Class A (initialData present): render immediately, no skeleton.
                     Class B (XHR fan-out): show wall.skel, accumulate, render when ready.
     4. REFRESH    — the page polls on its own timer; each teed response re-renders in
                     place. Keep last-good + "stale since HH:MM" if a cycle yields nothing.
                     A MutationObserver pins our root as <body>'s sole child so the page's
                     own re-render/poll can never blank a SOC wall.

   Runs in PAGE context (@grant none) so wrapping window.XMLHttpRequest/fetch catches
   the page's requests and window.initialData is directly readable.
   ============================================================================ */
(function () {
  if (window.top !== window.self) return;              // top frame only
  if (window.__SW_BOOTED__) return;                    // idempotent per document
  window.__SW_BOOTED__ = true;

  var SW = window.SW;
  var walls = window.SW_WALLS || [];
  var wall = null;
  for (var i = 0; i < walls.length; i++) {
    if (walls[i].match && walls[i].match.test(location.pathname)) { wall = walls[i]; break; }
  }
  if (!wall) return;                                   // not a wall we own — leave page untouched
  if (typeof wall.adapt !== 'function') {              // registered but not yet wired for live data
    console.warn('[SW] wall ' + wall.slug + ' has no adapt() yet — leaving original page.');
    return;
  }
  if (!SW || !SW.mountSkeleton) { console.warn('[SW] common/skeleton not loaded'); return; }

  var STALE_AFTER = 180000;   // ms with no good render before we flag "stale"
  var log = function () { try { console.log.apply(console, ['[SW ' + wall.slug + ']'].concat([].slice.call(arguments))); } catch (e) {} };

  // Page <head> title: the original walls carry weird/generic titles (and wall ids). Set a clean,
  // index-free per-wall title (reuse the wall's own top-bar title) and re-assert it on a timer so
  // the page's load/poll/reload can't clobber it.
  var PAGE_TITLE = (wall.skel && wall.skel.topbar && wall.skel.topbar.title) || 'GLESEC SOC';
  function setTitle() { try { if (document.title !== PAGE_TITLE) document.title = PAGE_TITLE; } catch (e) {} }
  setTitle();   // best-effort at document-start; re-asserted in boot() + the 1s tick

  // Inject (and keep pinned) the design system + the boot-only refresh-pulse keyframe.
  // A document-start <style> on documentElement is dropped by some walls during load, so we
  // re-assert at DOMContentLoaded (head stable) and whenever it goes missing.
  function ensureStyles() {
    try {
      var head = document.head || document.documentElement;
      if (window.SW_THEME_CSS && !document.getElementById('sw-theme')) {
        var t = document.createElement('style');
        t.id = 'sw-theme'; t.textContent = window.SW_THEME_CSS;
        head.appendChild(t);
      }
      if (!document.getElementById('sw-anim')) {
        var a = document.createElement('style');
        a.id = 'sw-anim'; a.textContent = '@keyframes sw-pulse{0%,100%{opacity:1}50%{opacity:.25}}' +
          '.sw-eye{width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-sizing:border-box;' +
          'border-radius:10px;background:rgba(16,16,20,0.72);border:1px solid rgba(255,255,255,0.14);color:#a1a1aa;' +
          '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .15s,color .15s,border-color .15s}' +
          '.sw-eye:hover{color:#fafafa;background:rgba(28,28,34,0.92);border-color:rgba(255,255,255,0.30)}';
        head.appendChild(a);
      }
    } catch (e) {}
  }
  ensureStyles();   // best-effort early paint (may be discarded — re-asserted in boot())

  /* ---- 1. intercept buffer ------------------------------------------------- */
  var buf = [];                                        // { url, json, t }
  function record(url, text) {
    if (!text || typeof text !== 'string') return;
    if (wall.endpoints && wall.endpoints.length &&
        !wall.endpoints.some(function (p) { return url.indexOf(p) !== -1; })) return;
    var json; try { json = JSON.parse(text); } catch (e) { return; }
    if (json == null) return;
    buf.push({ url: url, json: json, t: Date.now() });
    if (buf.length > 400) buf.splice(0, buf.length - 400);   // cap memory on long-lived walls
    scheduleRender('xhr');
  }

  /* ---- 2. tee XHR + fetch (page context) ----------------------------------- */
  (function installXHR() {
    var XHR = window.XMLHttpRequest;
    if (!XHR || XHR.__sw) return;
    var open = XHR.prototype.open, send = XHR.prototype.send;
    XHR.prototype.open = function (m, u) { try { this.__swUrl = u; } catch (e) {} return open.apply(this, arguments); };
    XHR.prototype.send = function () {
      var self = this;
      this.addEventListener('load', function () {
        try {
          var rt = self.responseType, txt = '';
          if (rt === '' || rt === 'text') txt = self.responseText;
          else if (rt === 'json') { try { txt = JSON.stringify(self.response); } catch (e) {} }
          if (txt) record(String(self.__swUrl || self.responseURL || ''), txt);
        } catch (e) {}
      });
      return send.apply(this, arguments);
    };
    XHR.__sw = true;
  })();
  (function installFetch() {
    if (!window.fetch || window.fetch.__sw) return;
    var orig = window.fetch;
    var wrapped = function (input, init) {
      // native fetch must be invoked with this===window (our bundle is 'use strict', so a bare
      // fetch() call would pass this===undefined -> "Illegal invocation" and break the page).
      var p = orig.apply(window, arguments);
      try {
        var url = (typeof input === 'string') ? input : (input && input.url) || '';
        if (p && typeof p.then === 'function') p.then(function (resp) {
          try { resp.clone().text().then(function (t) { try { record(url, t); } catch (e) {} }, function () {}); } catch (e) {}
          return resp;
        }, function () {});
      } catch (e) {}
      return p;
    };
    wrapped.__sw = true;
    try { window.fetch = wrapped; } catch (e) {}
  })();

  /* ---- 3. lifecycle state -------------------------------------------------- */
  var state = { node: null, host: null, showEye: null, eyeHidden: false, prev: null, account: null, rendered: false, lastGoodAt: 0, suppress: false, sig: null };
  // per-tab eye toggle (sessionStorage is genuinely per-tab AND survives reload incl. PRTG's 120s
  // location.reload — and needs no GM grant, which @grant none wouldn't have anyway).
  try { state.eyeHidden = sessionStorage.getItem('sw-eye-' + wall.slug) === '1'; } catch (e) {}

  function buildSources() {
    return {
      initialData: window.initialData || null,
      responses: buf.slice(),
      latest: function (pat) { for (var k = buf.length - 1; k >= 0; k--) if (buf[k].url.indexOf(pat) !== -1) return buf[k].json; return null; },
      all: function (pat) { var out = []; for (var k = 0; k < buf.length; k++) if (buf[k].url.indexOf(pat) !== -1) out.push(buf[k].json); return out; },
      doc: document,
      prev: state.prev,
      account: state.account
    };
  }

  // Mount as a full-viewport opaque OVERLAY above the original page — we never destroy the page's
  // DOM, because Class B walls' own fan-out/poll (which we OBSERVE) depends on it (the _token, the
  // widget/account registry, the placement targets). A fixed full-viewport HOST (opaque theme bg)
  // covers the live page at ANY screen size / zoom; the 1920x1080 design is centered inside it and
  // SCALED to fit (contain), so nothing leaks past the edges on wider-than-1920 / zoomed-out views.
  function ensureHost() {
    if (state.host && state.host.parentNode) return state.host;
    var h = document.createElement('div');
    h.id = 'sw-overlay-host';
    h.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483646;margin:0;padding:0;' +
      'background:#08080a;overflow:hidden;align-items:center;justify-content:center;display:' + (state.eyeHidden ? 'none' : 'flex') + ';';
    (document.body || document.documentElement).appendChild(h);
    state.host = h;
    return h;
  }

  /* ---- eye toggle: hide the WHOLE overlay -> show the original wall (per-tab, persisted) ----
     One eye sits in the overlay's top bar (the wall's top-right); one restore eye is fixed on the
     real page, shown only while hidden. display:none on the host fully removes our layer, so the
     original wall is visible AND interactive underneath; the restore eye floats above it. */
  var EYE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  function makeEye(id, title) { var b = document.createElement('div'); b.id = id; b.className = 'sw-eye'; b.title = title; b.setAttribute('role', 'button'); b.innerHTML = EYE_SVG; return b; }
  function addHideEye(root) {
    if (!root || root.querySelector('#sw-eye-hide')) return;
    var b = makeEye('sw-eye-hide', 'Hide redesign — show original wall');
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setEye(true); });
    var bar = root.querySelector('.sw-topbar');
    if (bar) { b.style.position = 'relative'; b.style.flex = '0 0 auto'; bar.appendChild(b); }   // topbar's 18px flex gap handles spacing
    else { b.style.position = 'absolute'; b.style.top = '10px'; b.style.right = '10px'; b.style.zIndex = '60'; root.appendChild(b); }
  }
  // Place the restore eye at the EXACT on-screen spot/size of the top-bar hide eye (accounting for the
  // contain-scale), so toggling never makes it jump. Derived from the theme: the wall is 1920x1080
  // scaled by `s` and centered; topbar height 64, padding-right 30, eye 38 -> the hide eye's box
  // inside the wall is left=1852, top=13, size=38. At fullscreen (s=1) this is exact.
  function positionRestoreEye() {
    var b = state.showEye; if (!b) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080); if (!(s > 0)) s = 1;
    var wallLeft = (window.innerWidth - 1920 * s) / 2, wallTop = (window.innerHeight - 1080 * s) / 2;
    b.style.right = 'auto';
    b.style.left = (wallLeft + 1852 * s) + 'px';
    b.style.top = (wallTop + 13 * s) + 'px';
    b.style.width = (38 * s) + 'px';
    b.style.height = (38 * s) + 'px';
    b.style.borderRadius = (10 * s) + 'px';
    var svg = b.querySelector('svg'); if (svg) { svg.setAttribute('width', 20 * s); svg.setAttribute('height', 20 * s); }
  }
  function ensureShowEye() {
    if (state.showEye && state.showEye.parentNode) { positionRestoreEye(); state.showEye.style.display = state.eyeHidden ? 'flex' : 'none'; return; }
    var b = state.showEye || makeEye('sw-eye-show', 'Show redesigned wall');
    b.style.position = 'fixed'; b.style.zIndex = '2147483647';
    if (!b.__wired) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setEye(false); }); b.__wired = true; }
    (document.body || document.documentElement).appendChild(b);
    state.showEye = b;
    positionRestoreEye();
    b.style.display = state.eyeHidden ? 'flex' : 'none';
  }
  function applyEyeState() {
    if (state.host) state.host.style.display = state.eyeHidden ? 'none' : 'flex';
    ensureShowEye();
  }
  function setEye(hidden) {
    state.eyeHidden = hidden;
    try { sessionStorage.setItem('sw-eye-' + wall.slug, hidden ? '1' : '0'); } catch (e) {}
    applyEyeState();
  }
  function scaleToFit() {
    if (!state.node) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    if (!(s > 0)) s = 1;
    state.node.style.transformOrigin = 'center center';
    state.node.style.transform = 'scale(' + s + ')';
  }
  function place(node) {
    ensureStyles();                                     // re-assert theme in case the page dropped it
    var host = ensureHost();
    state.suppress = true;
    try { document.documentElement.style.overflow = 'hidden'; if (document.body) document.body.style.overflow = 'hidden'; } catch (e) {}
    // the 1920x1080 root is a plain flex child of the host; the host does the centering + opaque fill
    node.style.position = 'relative';
    node.style.top = ''; node.style.left = ''; node.style.zIndex = '';
    node.style.flex = '0 0 auto';
    if (state.node && state.node !== node && state.node.parentNode) state.node.parentNode.removeChild(state.node);
    if (host.firstElementChild && host.firstElementChild !== node) host.innerHTML = '';
    host.appendChild(node);
    state.node = node;
    scaleToFit();                                       // contain-scale to the current viewport
    addHideEye(node);                                   // eye control in the wall's top bar
    applyEyeState();                                    // respect a persisted "hidden" choice
    state.suppress = false;
  }

  var skeletonShown = false;
  function showSkeleton() {
    if (wall.cls !== 'B' || skeletonShown || !document.body) return;
    try {
      var spec = wall.skel || {};
      // scope label must be REAL, never invented: try to read it off the page before we wipe it
      if (spec.topbar) {
        var sc = readScope();
        if (sc) spec.topbar.account = sc;
      }
      var holder = document.createElement('div');
      SW.mountSkeleton(holder, spec);
      place(holder.firstChild);
      skeletonShown = true;
      log('skeleton mounted');
    } catch (e) { console.warn('[SW] skeleton failed', e); }
  }

  function readScope() {
    try {
      var sel = document.querySelector('select');
      var opt = sel && sel.selectedOptions && sel.selectedOptions[0];
      var t = opt && opt.textContent.trim();
      return t || null;
    } catch (e) { return null; }
  }

  var pending = false;
  function scheduleRender(why) {
    if (state.rendered) setIndicator('refreshing');    // subtle pulse while a poll re-renders
    if (pending) return;
    pending = true;
    // microtask-ish debounce: collapse a burst of fan-out responses into one render
    setTimeout(function () { pending = false; tryRender(why); }, 60);
  }

  function tryRender(why) {
    var d;
    try { d = wall.adapt(buildSources()); }
    catch (e) { console.warn('[SW] adapt threw', e); d = null; }

    if (!d) {
      if (!state.rendered) showSkeleton();             // Class B: keep waiting on the fan-out
      else markStaleMaybe();                            // refresh produced nothing usable -> keep last good
      return;
    }

    // change-detection (opt-in): if the wall exposes signature() and it matches the last render,
    // DON'T tear down + rebuild the DOM (that restarts all CSS/SMIL animations -> visible jitter).
    // Keep the live node, optionally do a light in-place refresh() of volatile bits (counters/clock).
    var sig = null;
    if (typeof wall.signature === 'function') { try { sig = wall.signature(d); } catch (e) { sig = null; } }
    if (state.rendered && sig != null && sig === state.sig) {
      state.prev = d;
      if (d.account) state.account = d.account;
      state.lastGoodAt = Date.now();
      if (typeof wall.refresh === 'function' && state.node) { try { wall.refresh(state.node, d); } catch (e) {} }
      try { window.__SW_LAST_D = d; } catch (e) {}
      setIndicator('idle');
      return;
    }

    state.prev = d;
    if (d.account) state.account = d.account;

    var holder = document.createElement('div');
    try { wall.render(holder, d); }
    catch (e) { console.warn('[SW] render threw', e); if (!state.rendered) showSkeleton(); return; }
    var root = holder.firstChild;
    if (!root) return;

    place(root);
    state.rendered = true;
    state.sig = sig;                                    // remember what we just painted (change-detection)
    state.lastGoodAt = Date.now();
    try { window.__SW_LAST_D = d; } catch (e) {}        // debug hook (harness introspection)
    setIndicator('idle');
    log('rendered (' + (why || 'init') + ')');
  }

  /* ---- 4. refresh affordances: subtle pulse + stale marker + live clock ----- */
  function indEl() {
    if (!state.node) return null;
    var el = state.node.querySelector('#sw-ind');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sw-ind';
      el.style.cssText = 'position:fixed;bottom:12px;right:16px;z-index:99999;display:flex;align-items:center;gap:7px;' +
        'font:600 11px Inter,ui-sans-serif,sans-serif;letter-spacing:.04em;pointer-events:none;';
      state.node.appendChild(el);
    }
    return el;
  }
  function setIndicator(mode, since) {
    var el = indEl(); if (!el) return;
    if (mode === 'refreshing') el.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#22d3ee;box-shadow:0 0 8px #22d3ee;animation:sw-pulse 1.1s ease-in-out infinite"></span>';
    else if (mode === 'stale') el.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#eab308;box-shadow:0 0 7px #eab308"></span><span style="color:#a1a1aa">stale since ' + since + '</span>';
    else el.innerHTML = '';
  }
  function hhmm(ts) { try { var d = new Date(ts); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); } catch (e) { return '—'; } }
  function markStaleMaybe() {
    if (state.rendered && state.lastGoodAt && Date.now() - state.lastGoodAt > STALE_AFTER) setIndicator('stale', hhmm(state.lastGoodAt));
  }

  // keep the GOC clock ticking + run the stale watchdog
  setInterval(function () {
    try {
      if (state.node) { var c = state.node.querySelector('#sw-clock'); if (c && SW.nowStr) c.textContent = SW.nowStr(); }
    } catch (e) {}
    setTitle();            // keep the <head> title pinned
    markStaleMaybe();
  }, 1000);

  /* ---- 5. keep our overlay attached + on top ------------------------------- */
  function startObserver() {
    if (!document.body || !window.MutationObserver) return;
    var obs = new MutationObserver(function () {
      if (state.suppress || !state.node) return;
      // re-assert only if the page's own re-render detached our overlay host (z-index keeps us on
      // top, so DOM order doesn't matter — avoids thrashing when the page appends its own nodes)
      if (!state.host || !state.host.parentNode || (document.body && !document.body.contains(state.host)) || state.node.parentNode !== state.host) {
        place(state.node);
      }
      if (state.showEye && !state.showEye.parentNode) ensureShowEye();   // re-add restore eye if the page wiped body
    });
    obs.observe(document.body, { childList: true });
  }

  /* ---- 6. go ---------------------------------------------------------------- */
  function boot() {
    ensureStyles();                                     // head is stable now — this injection persists
    setTitle();                                         // clean <head> title (head exists now)
    window.addEventListener('resize', function () { scaleToFit(); positionRestoreEye(); });   // keep design + restore-eye aligned
    startObserver();
    applyEyeState();                                     // restore the per-tab eye choice (show original if hidden)
    if (wall.cls === 'B') showSkeleton();               // paint shaped skeleton up front
    tryRender('init');                                  // Class A renders now from initialData
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

})();