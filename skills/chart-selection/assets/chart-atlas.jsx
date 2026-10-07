import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
  ScatterChart, Scatter, PieChart, Pie, Cell, Treemap, Sankey,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, LabelList,
} from "recharts";

/* ============ design tokens ============ */
const T = {
  paper: "#F7F6F1",
  card: "#FFFFFF",
  ink: "#16181D",
  inkSoft: "#5A5E68",
  hairline: "#E5E3DB",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
};
const FAM = {
  comparison: { label: "Comparison", hue: "#2563EB" },
  time: { label: "Change over time", hue: "#0D9488" },
  distribution: { label: "Distribution", hue: "#7C3AED" },
  relationship: { label: "Relationship", hue: "#DB2777" },
  parttowhole: { label: "Part-to-whole", hue: "#EA580C" },
  flow: { label: "Flow", hue: "#0891B2" },
  deviation: { label: "Deviation", hue: "#B91C1C" },
  spatial: { label: "Spatial", hue: "#4D7C0F" },
  uncertainty: { label: "Uncertainty", hue: "#57534E" },
  stats: { label: "Stats & ML", hue: "#4338CA" },
  finance: { label: "Finance & quant", hue: "#B45309" },
  progress: { label: "Progress & KPI", hue: "#15803D" },
};
const GRAY = "#C9C7BF";
const POS = "#0F766E", NEG = "#B91C1C";

/* ============ deterministic synthetic data ============ */
const makeRng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const quantile = (arr, q) => {
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * q, base = Math.floor(pos), rest = pos - base;
  return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
};
const kde = (samples, grid, bw) =>
  grid.map((x) => ({
    x,
    d: samples.reduce((a, s) => a + Math.exp(-0.5 * ((x - s) / bw) ** 2), 0) / (samples.length * bw * 2.5066),
  }));
const normal = (rng) => {
  const u = Math.max(rng(), 1e-9), v = Math.max(rng(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/* ============ shared UI ============ */
const num = (v) => (typeof v === "number" ? (Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10) : v);
const Tip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: T.ink, color: "#fff", padding: "6px 9px", borderRadius: 6, fontFamily: T.mono, fontSize: 11, lineHeight: 1.5 }}>
      {label !== undefined && <div style={{ opacity: 0.65 }}>{label}</div>}
      {payload.slice(0, 4).map((p, i) => (
        <div key={i}>
          <span style={{ color: p.color || p.fill, marginRight: 6 }}>●</span>
          {p.name}: {Array.isArray(p.value) ? p.value.map(num).join("–") : num(p.value)}
        </div>
      ))}
    </div>
  );
};
const axisStyle = { fontFamily: T.mono, fontSize: 10, fill: T.inkSoft };

function Card({ id, family, title, useWhen, avoidWhen, children, flashId, tall }) {
  const hue = FAM[family].hue;
  const flashing = flashId === id;
  return (
    <div
      id={id}
      style={{
        background: T.card,
        border: `1px solid ${flashing ? hue : T.hairline}`,
        boxShadow: flashing ? `0 0 0 3px ${hue}33` : "0 1px 2px rgba(20,20,20,0.04)",
        borderRadius: 10,
        padding: "16px 16px 12px",
        transition: "box-shadow 0.6s, border-color 0.6s",
        breakInside: "avoid",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: hue, flexShrink: 0, transform: "translateY(-1px)" }} />
        <h3 style={{ fontFamily: T.serif, fontSize: 21, fontWeight: 400, color: T.ink, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ height: tall ? 260 : 190, margin: "8px -6px 6px" }}>{children}</div>
      <p style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink, margin: "0 0 4px", lineHeight: 1.45 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: hue, letterSpacing: "0.06em" }}>USE WHEN </span>
        {useWhen}
      </p>
      <p style={{ fontFamily: T.sans, fontSize: 12.5, color: T.inkSoft, margin: 0, lineHeight: 1.45 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em" }}>AVOID WHEN </span>
        {avoidWhen}
      </p>
    </div>
  );
}

function SpecCard({ family, title, useWhen, avoidWhen }) {
  const hue = FAM[family].hue;
  return (
    <div style={{
      background: T.paper, border: `1px dashed ${T.hairline}`, borderRadius: 10,
      padding: "14px 16px", breakInside: "avoid",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, border: `1.6px solid ${hue}`, flexShrink: 0, transform: "translateY(-1px)" }} />
        <h3 style={{ fontFamily: T.serif, fontSize: 19, fontWeight: 400, color: T.ink, margin: 0 }}>{title}</h3>
        <span style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: "0.08em", color: T.inkSoft, border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "2px 5px", marginLeft: "auto" }}>COMPACT ENTRY</span>
      </div>
      <p style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink, margin: "0 0 4px", lineHeight: 1.45 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: hue, letterSpacing: "0.06em" }}>USE WHEN </span>
        {useWhen}
      </p>
      {avoidWhen && (
        <p style={{ fontFamily: T.sans, fontSize: 12.5, color: T.inkSoft, margin: 0, lineHeight: 1.45 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em" }}>AVOID WHEN </span>
          {avoidWhen}
        </p>
      )}
    </div>
  );
}

/* ============ custom SVG charts ============ */
function SlopeChart() {
  const rows = [
    { name: "Alpha", a: 62, b: 81, hi: true }, { name: "Beta", a: 74, b: 69 },
    { name: "Gamma", a: 55, b: 58 }, { name: "Delta", a: 48, b: 30, hi: true },
    { name: "Epsilon", a: 40, b: 44 }, { name: "Zeta", a: 33, b: 36 },
  ];
  const W = 320, H = 180, x0 = 92, x1 = W - 92, y = (v) => 160 - ((v - 20) / 70) * 140;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {[x0, x1].map((x, i) => <line key={i} x1={x} x2={x} y1={12} y2={166} stroke={T.hairline} />)}
      <text x={x0} y={178} textAnchor="middle" style={{ ...axisStyle }}>2024</text>
      <text x={x1} y={178} textAnchor="middle" style={{ ...axisStyle }}>2025</text>
      {rows.map((r, i) => {
        const c = r.hi ? (r.b > r.a ? POS : NEG) : GRAY;
        return (
          <g key={i}>
            <line x1={x0} y1={y(r.a)} x2={x1} y2={y(r.b)} stroke={c} strokeWidth={r.hi ? 2.2 : 1.4} />
            <circle cx={x0} cy={y(r.a)} r={3} fill={c} /><circle cx={x1} cy={y(r.b)} r={3} fill={c} />
            <text x={x0 - 8} y={y(r.a) + 3.5} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: r.hi ? T.ink : T.inkSoft }}>{r.name} {r.a}</text>
            <text x={x1 + 8} y={y(r.b) + 3.5} style={{ fontFamily: T.mono, fontSize: 10, fill: r.hi ? T.ink : T.inkSoft }}>{r.b}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DumbbellChart() {
  const rows = [
    { name: "Search", a: 34, b: 61 }, { name: "Paid social", a: 41, b: 52 },
    { name: "Email", a: 28, b: 44 }, { name: "Referral", a: 30, b: 33 },
    { name: "Direct", a: 25, b: 22 },
  ];
  const W = 330, H = 180, xL = 92, xR = W - 16, sx = (v) => xL + ((v - 15) / 55) * (xR - xL);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {rows.map((r, i) => {
        const y = 24 + i * 30, up = r.b >= r.a;
        return (
          <g key={i}>
            <text x={xL - 8} y={y + 3.5} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: T.inkSoft }}>{r.name}</text>
            <line x1={sx(r.a)} y1={y} x2={sx(r.b)} y2={y} stroke={up ? POS : NEG} strokeWidth={2} opacity={0.45} />
            <circle cx={sx(r.a)} cy={y} r={4.5} fill={GRAY} />
            <circle cx={sx(r.b)} cy={y} r={4.5} fill={up ? POS : NEG} />
            <text x={sx(r.b) + (up ? 9 : -9)} y={y + 3.5} textAnchor={up ? "start" : "end"} style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }}>{r.b}%</text>
          </g>
        );
      })}
      <text x={xL} y={H - 4} style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>● 2024   <tspan fill={POS}>●</tspan> 2025 — conversion rate</text>
    </svg>
  );
}

function BulletChart() {
  const rows = [
    { name: "Revenue", val: 82, target: 90, bands: [60, 80, 110] },
    { name: "NPS", val: 96, target: 75, bands: [50, 75, 110] },
    { name: "Churn (inv)", val: 55, target: 85, bands: [60, 85, 110] },
  ];
  const W = 330, xL = 92, xR = W - 14, sx = (v) => xL + (v / 110) * (xR - xL);
  const bandCols = ["#E6E4DC", "#EFEDE6", "#F7F6F1"];
  return (
    <svg viewBox={`0 0 ${W} 180`} width="100%" height="100%">
      {rows.map((r, i) => {
        const y = 26 + i * 50;
        return (
          <g key={i}>
            <text x={xL - 8} y={y + 12} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: T.inkSoft }}>{r.name}</text>
            {r.bands.map((b, j) => (
              <rect key={j} x={j === 0 ? xL : sx(r.bands[j - 1])} y={y} width={sx(b) - (j === 0 ? xL : sx(r.bands[j - 1]))} height={18} fill={bandCols[j]} />
            ))}
            <rect x={xL} y={y + 5.5} width={sx(r.val) - xL} height={7} fill={r.val >= r.target ? T.ink : NEG} rx={1} />
            <line x1={sx(r.target)} x2={sx(r.target)} y1={y - 3} y2={y + 21} stroke={T.ink} strokeWidth={2.4} />
            <text x={sx(r.val) + 5} y={y + 13} style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }}>{r.val}</text>
          </g>
        );
      })}
      <text x={xL} y={172} style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>bar = actual · tick = target · bands = poor / ok / good</text>
    </svg>
  );
}

function BoxPlotChart() {
  const rng = makeRng(7);
  const groups = ["A", "B", "C", "D", "E"].map((g, i) => {
    const mu = 40 + i * 8 + (i === 3 ? -14 : 0), sd = 6 + i * 1.5;
    const vals = Array.from({ length: 80 }, () => mu + sd * normal(rng));
    return { g, q1: quantile(vals, 0.25), med: quantile(vals, 0.5), q3: quantile(vals, 0.75), lo: quantile(vals, 0.05), hi: quantile(vals, 0.95), out: vals.filter(v => v > quantile(vals, 0.97) + 4) };
  });
  const W = 330, H = 185, y = (v) => 165 - ((v - 10) / 90) * 150;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {[20, 50, 80].map((v) => (
        <g key={v}><line x1={34} x2={W - 8} y1={y(v)} y2={y(v)} stroke={T.hairline} /><text x={28} y={y(v) + 3} textAnchor="end" style={{ ...axisStyle }}>{v}</text></g>
      ))}
      {groups.map((d, i) => {
        const cx = 62 + i * 56, w = 26, hue = FAM.distribution.hue;
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(d.lo)} y2={y(d.hi)} stroke={T.inkSoft} />
            <rect x={cx - w / 2} y={y(d.q3)} width={w} height={y(d.q1) - y(d.q3)} fill={`${hue}22`} stroke={hue} />
            <line x1={cx - w / 2} x2={cx + w / 2} y1={y(d.med)} y2={y(d.med)} stroke={hue} strokeWidth={2.4} />
            {d.out.map((o, j) => <circle key={j} cx={cx} cy={y(o)} r={2} fill="none" stroke={T.inkSoft} />)}
            <text x={cx} y={180} textAnchor="middle" style={{ ...axisStyle }}>{d.g}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ViolinPlot() {
  const rng = makeRng(11);
  const grid = Array.from({ length: 44 }, (_, i) => 8 + i * 2);
  const mk = (mus, n) => {
    const s = [];
    for (let i = 0; i < n; i++) s.push(mus[i % mus.length] + 7 * normal(rng));
    return s;
  };
  const groups = [
    { g: "Unimodal", s: mk([50], 120) },
    { g: "Bimodal", s: mk([32, 68], 120) },
    { g: "Skewed", s: mk([38], 120).map(v => 30 + Math.abs(v - 30) * 0.9) },
  ];
  const W = 330, H = 185, y = (v) => 165 - ((v - 5) / 95) * 150;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {groups.map((d, i) => {
        const dens = kde(d.s, grid, 5), maxD = Math.max(...dens.map(p => p.d));
        const cx = 66 + i * 100, hw = 34, hue = FAM.distribution.hue;
        const right = dens.map(p => `${cx + (p.d / maxD) * hw},${y(p.x)}`);
        const left = [...dens].reverse().map(p => `${cx - (p.d / maxD) * hw},${y(p.x)}`);
        const med = quantile(d.s, 0.5);
        return (
          <g key={i}>
            <polygon points={[...right, ...left].join(" ")} fill={`${hue}26`} stroke={hue} strokeWidth={1.2} />
            <line x1={cx - 7} x2={cx + 7} y1={y(med)} y2={y(med)} stroke={hue} strokeWidth={2.4} />
            <text x={cx} y={180} textAnchor="middle" style={{ ...axisStyle }}>{d.g}</text>
          </g>
        );
      })}
    </svg>
  );
}

function BeeswarmChart() {
  const rng = makeRng(23);
  const W = 330, H = 185, y = (v) => 162 - ((v - 0) / 100) * 145;
  const groups = ["Control", "Variant A", "Variant B"].map((g, gi) => {
    const mu = [46, 55, 63][gi];
    return { g, pts: Array.from({ length: 46 }, () => ({ v: Math.min(98, Math.max(4, mu + 13 * normal(rng))), j: (rng() - 0.5) * 46 })) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {[0, 50, 100].map(v => (
        <g key={v}><line x1={34} x2={W - 8} y1={y(v)} y2={y(v)} stroke={T.hairline} /><text x={28} y={y(v) + 3} textAnchor="end" style={{ ...axisStyle }}>{v}</text></g>
      ))}
      {groups.map((d, i) => {
        const cx = 78 + i * 96;
        return (
          <g key={i}>
            {d.pts.map((p, j) => <circle key={j} cx={cx + p.j} cy={y(p.v)} r={2.6} fill={FAM.distribution.hue} opacity={0.55} />)}
            <text x={cx} y={180} textAnchor="middle" style={{ ...axisStyle }}>{d.g}</text>
          </g>
        );
      })}
    </svg>
  );
}

function RidgelineChart() {
  const rng = makeRng(31);
  const months = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];
  const grid = Array.from({ length: 60 }, (_, i) => i);
  const W = 330, H = 195;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {months.map((m, i) => {
        const mu = 14 + 22 * Math.sin((i / 6) * Math.PI) + rng() * 4;
        const s = Array.from({ length: 90 }, () => mu + 6 * normal(rng));
        const dens = kde(s, grid, 3.4), maxD = Math.max(...dens.map(p => p.d));
        const base = 34 + i * 27, amp = 34;
        const pts = dens.map(p => `${48 + (p.x / 60) * (W - 66)},${base - (p.d / maxD) * amp}`);
        return (
          <g key={i}>
            <polygon points={`48,${base} ${pts.join(" ")} ${W - 18},${base}`} fill={`${FAM.distribution.hue}30`} stroke={FAM.distribution.hue} strokeWidth={1.1} />
            <text x={42} y={base} textAnchor="end" style={{ ...axisStyle }}>{m}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 2} textAnchor="middle" style={{ ...axisStyle }}>daily temperature °C</text>
    </svg>
  );
}

function CorrHeatmap() {
  const vars = ["ret", "vol", "mom", "size", "val", "qual", "beta"];
  const rng = makeRng(41);
  const M = vars.map((_, i) => vars.map((_, j) => (i === j ? 1 : Math.round((rng() * 1.7 - 0.85) * 100) / 100)));
  for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) M[j][i] = M[i][j];
  const col = (v) => (v > 0 ? `rgba(30,90,190,${Math.abs(v)})` : `rgba(190,45,45,${Math.abs(v)})`);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `36px repeat(7, 1fr)`, gap: 2, height: "100%", alignContent: "center", padding: "0 6px" }}>
      <div />
      {vars.map(v => <div key={v} style={{ fontFamily: T.mono, fontSize: 9, color: T.inkSoft, textAlign: "center" }}>{v}</div>)}
      {vars.map((rv, i) => (
        <React.Fragment key={rv}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.inkSoft, alignSelf: "center" }}>{rv}</div>
          {vars.map((cv, j) => (
            <div key={cv} title={`${rv}×${cv}: ${M[i][j]}`} style={{
              aspectRatio: "1.6", borderRadius: 2,
              background: j > i ? "transparent" : col(M[i][j]),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.mono, fontSize: 8.5, color: Math.abs(M[i][j]) > 0.55 ? "#fff" : T.ink,
            }}>
              {j <= i && Math.abs(M[i][j]) >= 0.4 ? M[i][j].toFixed(1) : ""}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

function MatrixHeatmap() {
  const rng = makeRng(53);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 12 }, (_, i) => i * 2);
  const val = (d, h) => {
    const work = d < 5 ? 1 : 0.35;
    const peak = Math.exp(-0.5 * ((h - 14) / 4.2) ** 2) + 0.5 * Math.exp(-0.5 * ((h - 9) / 2.2) ** 2) * work;
    return Math.min(1, work * peak + rng() * 0.12);
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `34px repeat(12, 1fr)`, gap: 2, height: "100%", alignContent: "center", padding: "0 6px" }}>
      <div />
      {hours.map(h => <div key={h} style={{ fontFamily: T.mono, fontSize: 8.5, color: T.inkSoft, textAlign: "center" }}>{h}</div>)}
      {days.map((d, di) => (
        <React.Fragment key={d}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.inkSoft, alignSelf: "center" }}>{d}</div>
          {hours.map((h) => {
            const v = val(di, h);
            return <div key={h} title={`${d} ${h}:00 — ${(v * 100).toFixed(0)}`} style={{ aspectRatio: "1.35", borderRadius: 2, background: `rgba(219,39,119,${0.06 + v * 0.9})` }} />;
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function CalendarHeatmap() {
  const rng = makeRng(61);
  const weeks = 20;
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 8px" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3 }}>
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} style={{ display: "grid", gap: 3 }}>
            {Array.from({ length: 7 }).map((_, d) => {
              const base = d >= 5 ? 0.12 : 0.35 + 0.5 * rng();
              const v = Math.min(1, base + (w > 13 && d < 5 ? 0.3 : 0));
              return <div key={d} title={`wk${w + 1} d${d + 1}`} style={{ aspectRatio: "1", borderRadius: 2, background: `rgba(13,148,136,${0.07 + v * 0.85})` }} />;
            })}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkSoft, marginTop: 8 }}>20 weeks × Mon–Sun · weekday rhythm + a regime shift in week 14</div>
    </div>
  );
}

function TileMap() {
  const rng = makeRng(71);
  const tiles = [
    [null, "NO", "SE", "FI", null], ["IE", "UK", "DK", "PL", "LT"],
    ["PT", "FR", "DE", "CZ", "RO"], ["ES", "IT", "AT", "HU", "GR"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 24px" }}>
      {tiles.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 4 }}>
          {row.map((c, j) => {
            if (!c) return <div key={j} />;
            const v = rng();
            return (
              <div key={j} title={`${c}: ${(v * 12).toFixed(1)}%`} style={{
                aspectRatio: "1.5", borderRadius: 4, background: `rgba(77,124,15,${0.1 + v * 0.85})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: 10.5, color: v > 0.55 ? "#fff" : T.ink,
              }}>{c}</div>
            );
          })}
        </div>
      ))}
      <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkSoft, marginTop: 6 }}>growth rate by market — equal tile = equal visual weight</div>
    </div>
  );
}

function SymbolMap() {
  const rng = makeRng(83);
  const cities = Array.from({ length: 14 }, () => ({
    x: 30 + rng() * 270, y2: 24 + rng() * 130, v: 8 + rng() * 60,
  }));
  return (
    <svg viewBox="0 0 330 185" width="100%" height="100%">
      <rect x={14} y={12} width={302} height={152} rx={10} fill="#EFEEE7" />
      {cities.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y2} r={Math.sqrt(c.v) * 1.9} fill={`${FAM.spatial.hue}55`} stroke={FAM.spatial.hue} />
      ))}
      <text x={22} y={178} style={{ ...axisStyle }}>circle area ∝ count — the honest map for raw magnitudes</text>
    </svg>
  );
}

function FunnelBars() {
  const stages = [
    { s: "Visited", v: 12400 }, { s: "Signed up", v: 3100 },
    { s: "Activated", v: 1750 }, { s: "Paid", v: 640 },
  ];
  const W = 330, xL = 86, xR = W - 60;
  return (
    <svg viewBox={`0 0 ${W} 185`} width="100%" height="100%">
      {stages.map((d, i) => {
        const y = 18 + i * 42, w = (d.v / stages[0].v) * (xR - xL);
        const conv = i > 0 ? Math.round((d.v / stages[i - 1].v) * 100) : null;
        return (
          <g key={i}>
            <text x={xL - 8} y={y + 14} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: T.inkSoft }}>{d.s}</text>
            <rect x={xL} y={y} width={Math.max(w, 3)} height={21} rx={2} fill={FAM.flow.hue} opacity={0.9 - i * 0.14} />
            <text x={xL + Math.max(w, 3) + 7} y={y + 14.5} style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }}>{d.v.toLocaleString()}</text>
            {conv !== null && (
              <text x={xL + 2} y={y - 5} style={{ fontFamily: T.mono, fontSize: 9.5, fill: NEG }}>↓ {conv}% of previous</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function SparklineTiles() {
  const rng = makeRng(97);
  const mk = (start, drift) => {
    let v = start; return Array.from({ length: 24 }, () => (v = v * (1 + drift + (rng() - 0.5) * 0.06)));
  };
  const tiles = [
    { name: "MRR", series: mk(100, 0.012), fmt: (v) => `$${(v * 812).toFixed(0)}k` },
    { name: "Active users", series: mk(100, 0.006), fmt: (v) => `${(v * 231).toFixed(0)}` },
    { name: "Churn", series: mk(100, -0.008), fmt: (v) => `${(v * 0.031).toFixed(2)}%`, invert: true },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, height: "100%", alignContent: "center", padding: "0 4px" }}>
      {tiles.map((t, i) => {
        const last = t.series[t.series.length - 1], prev = t.series[0];
        const up = last >= prev, good = t.invert ? !up : up;
        const min = Math.min(...t.series), max = Math.max(...t.series);
        const pts = t.series.map((v, j) => `${(j / 23) * 88},${30 - ((v - min) / (max - min)) * 26}`).join(" ");
        return (
          <div key={i} style={{ border: `1px solid ${T.hairline}`, borderRadius: 8, padding: "10px 10px 8px", background: T.paper }}>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkSoft, letterSpacing: "0.05em" }}>{t.name.toUpperCase()}</div>
            <div style={{ fontFamily: T.serif, fontSize: 22, color: T.ink, margin: "2px 0" }}>{t.fmt(last / 100)}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: good ? POS : NEG }}>{up ? "▲" : "▼"} {Math.abs(((last - prev) / prev) * 100).toFixed(1)}%</div>
            <svg viewBox="0 0 88 34" width="100%" height="30" style={{ marginTop: 4 }}>
              <polyline points={pts} fill="none" stroke={good ? POS : NEG} strokeWidth={1.6} />
              <circle cx={88} cy={30 - ((last - min) / (max - min)) * 26} r={2.4} fill={good ? POS : NEG} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

function SmallMultiples() {
  const rng = makeRng(103);
  const regions = ["EU", "US", "APAC", "LATAM", "MEA", "UK"];
  const series = regions.map((r, i) => {
    let v = 40 + i * 6;
    return { r, data: Array.from({ length: 16 }, (_, t) => ({ t, v: (v = v + (rng() - 0.44) * 7 + (r === "EU" ? 1.6 : 0)) })) };
  });
  const all = series.flatMap(s => s.data.map(d => d.v));
  const lo = Math.min(...all), hi = Math.max(...all);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, height: "100%", alignContent: "center", padding: "0 2px" }}>
      {series.map((s, i) => (
        <div key={i} style={{ border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "6px 6px 2px" }}>
          <div style={{ fontFamily: T.mono, fontSize: 9.5, color: s.r === "EU" ? FAM.time.hue : T.inkSoft }}>{s.r}</div>
          <svg viewBox="0 0 90 40" width="100%" height="42">
            {series.map((o, j) => (
              <polyline key={j} fill="none"
                stroke={o.r === s.r ? (s.r === "EU" ? FAM.time.hue : T.ink) : "#E2E0D8"}
                strokeWidth={o.r === s.r ? 1.8 : 1}
                points={o.data.map(d => `${(d.t / 15) * 90},${38 - ((d.v - lo) / (hi - lo)) * 34}`).join(" ")} />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ============ PASS 1: uncertainty / stats / finance / progress ============ */

function ErrorBarsSVG() {
  const rows = [
    { g: "A", m: 62, ci: 7 }, { g: "B", m: 55, ci: 12 }, { g: "C", m: 48, ci: 5 },
    { g: "D", m: 44, ci: 10 }, { g: "E", m: 39, ci: 6 },
  ];
  const W = 330, H = 185, y = (v) => 160 - ((v - 20) / 60) * 140;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {[30, 50, 70].map(v => (
        <g key={v}><line x1={34} x2={W - 10} y1={y(v)} y2={y(v)} stroke={T.hairline} /><text x={28} y={y(v) + 3} textAnchor="end" style={{ ...axisStyle }}>{v}</text></g>
      ))}
      {rows.map((r, i) => {
        const cx = 68 + i * 54;
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(r.m - r.ci)} y2={y(r.m + r.ci)} stroke={FAM.uncertainty.hue} strokeWidth={1.6} />
            <line x1={cx - 6} x2={cx + 6} y1={y(r.m + r.ci)} y2={y(r.m + r.ci)} stroke={FAM.uncertainty.hue} strokeWidth={1.6} />
            <line x1={cx - 6} x2={cx + 6} y1={y(r.m - r.ci)} y2={y(r.m - r.ci)} stroke={FAM.uncertainty.hue} strokeWidth={1.6} />
            <circle cx={cx} cy={y(r.m)} r={4.4} fill={FAM.uncertainty.hue} />
            <text x={cx} y={176} textAnchor="middle" style={{ ...axisStyle }}>{r.g}</text>
          </g>
        );
      })}
      <text x={34} y={14} style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>whiskers = 95% CI — always say what the bar is</text>
    </svg>
  );
}

function QuantileDotPlotSVG() {
  const rng = makeRng(211);
  const draws = Array.from({ length: 20 }, () => 7 + 9 * normal(rng)).sort((a, b) => a - b);
  const W = 330, H = 185, x = (v) => 30 + ((v + 20) / 55) * (W - 50);
  const binW = 5.2, stacks = {};
  const pts = draws.map((v) => {
    const b = Math.round(v / binW) * binW;
    stacks[b] = (stacks[b] || 0) + 1;
    return { v: b, lvl: stacks[b] };
  });
  const nPos = draws.filter(v => v > 0).length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <line x1={x(0)} x2={x(0)} y1={26} y2={158} stroke={T.ink} strokeWidth={1.6} />
      <text x={x(0)} y={170} textAnchor="middle" style={{ ...axisStyle }}>0</text>
      {pts.map((p, i) => (
        <circle key={i} cx={x(p.v)} cy={152 - (p.lvl - 1) * 15} r={6.4}
          fill={p.v > 0 ? POS : NEG} opacity={0.85} stroke={T.paper} strokeWidth={1.4} />
      ))}
      <text x={30} y={16} style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }}>{nPos} of 20 equally likely outcomes are positive</text>
    </svg>
  );
}

function GradientBandSVG() {
  const rng = makeRng(223);
  const n = 25;
  const mid = Array.from({ length: n }, (_, i) => 44 + i * 1.1 + Math.sin(i / 3.4) * 5 + (rng() - 0.5) * 2);
  const W = 330, H = 185, x = (i) => 16 + (i / (n - 1)) * (W - 30), y = (v) => 168 - ((v - 20) / 70) * 150;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {[8, 7, 6, 5, 4, 3, 2, 1].map((k) => {
        const hw = k * 2.4;
        const top = mid.map((v, i) => `${x(i)},${y(v + hw)}`);
        const bot = [...mid].reverse().map((v, i) => `${x(n - 1 - i)},${y(v - hw)}`);
        return <polygon key={k} points={[...top, ...bot].join(" ")} fill={FAM.uncertainty.hue} opacity={0.16 * (1 - k / 10)} />;
      })}
      <polyline points={mid.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke={T.ink} strokeWidth={2} />
      <text x={16} y={H - 2} style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>opacity fades with probability — no false cliff at "95%"</text>
    </svg>
  );
}

function ForestPlotSVG() {
  const rows = [
    { name: "Study A", est: 0.42, lo: 0.18, hi: 0.66, w: 4 },
    { name: "Study B", est: 0.31, lo: -0.05, hi: 0.67, w: 2.6 },
    { name: "Study C", est: 0.55, lo: 0.34, hi: 0.76, w: 4.6 },
    { name: "Study D", est: -0.08, lo: -0.44, hi: 0.28, w: 2.4 },
    { name: "Study E", est: 0.38, lo: 0.2, hi: 0.56, w: 5 },
    { name: "Study F", est: 0.22, lo: -0.1, hi: 0.54, w: 2.8 },
  ];
  const pooled = { est: 0.34, lo: 0.22, hi: 0.46 };
  const W = 330, xL = 78, xR = W - 16, sx = (v) => xL + ((v + 0.6) / 1.5) * (xR - xL);
  return (
    <svg viewBox={`0 0 ${W} 195`} width="100%" height="100%">
      <line x1={sx(0)} x2={sx(0)} y1={10} y2={165} stroke={T.inkSoft} strokeDasharray="3 3" />
      {rows.map((r, i) => {
        const y = 20 + i * 22;
        return (
          <g key={i}>
            <text x={xL - 8} y={y + 3.5} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: T.inkSoft }}>{r.name}</text>
            <line x1={sx(r.lo)} x2={sx(r.hi)} y1={y} y2={y} stroke={FAM.stats.hue} strokeWidth={1.6} />
            <rect x={sx(r.est) - r.w / 2 - 1.5} y={y - r.w / 2 - 1.5} width={r.w + 3} height={r.w + 3} fill={FAM.stats.hue} />
          </g>
        );
      })}
      <polygon points={`${sx(pooled.lo)},${158} ${sx(pooled.est)},${151} ${sx(pooled.hi)},${158} ${sx(pooled.est)},${165}`} fill={T.ink} />
      <text x={xL - 8} y={161} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }}>Pooled</text>
      <text x={sx(0)} y={180} textAnchor="middle" style={{ ...axisStyle }}>0 (no effect)</text>
      <text x={xR} y={180} textAnchor="end" style={{ ...axisStyle }}>effect →</text>
    </svg>
  );
}

function KMSurvivalSVG() {
  const A = [[0, 1], [3, 0.96], [6, 0.9], [9, 0.83], [12, 0.75], [15, 0.69], [18, 0.61], [21, 0.53], [24, 0.46]];
  const B = [[0, 1], [4, 0.97], [8, 0.93], [12, 0.87], [16, 0.82], [20, 0.77], [24, 0.72]];
  const W = 330, H = 190, x = (t) => 40 + (t / 24) * (W - 58), y = (s) => 150 - (s - 0.3) / 0.7 * 132;
  const stepPath = (pts) => pts.map(([t, s], i) => (i === 0 ? `M${x(t)},${y(s)}` : `H${x(t)}V${y(s)}`)).join(" ") + `H${x(24)}`;
  const censors = { A: [[7.5, 0.9], [16.5, 0.69]], B: [[10, 0.93], [22, 0.77]] };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {[0.4, 0.6, 0.8, 1].map(s => (
        <g key={s}><line x1={40} x2={W - 18} y1={y(s)} y2={y(s)} stroke={T.hairline} /><text x={34} y={y(s) + 3} textAnchor="end" style={{ ...axisStyle }}>{s}</text></g>
      ))}
      <path d={stepPath(A)} fill="none" stroke={FAM.stats.hue} strokeWidth={2.2} />
      <path d={stepPath(B)} fill="none" stroke={GRAY} strokeWidth={2} />
      {censors.A.map(([t, s], i) => <line key={i} x1={x(t)} x2={x(t)} y1={y(s) - 4} y2={y(s) + 4} stroke={FAM.stats.hue} strokeWidth={1.6} />)}
      {censors.B.map(([t, s], i) => <line key={`b${i}`} x1={x(t)} x2={x(t)} y1={y(s) - 4} y2={y(s) + 4} stroke={T.inkSoft} strokeWidth={1.6} />)}
      <text x={x(24)} y={y(0.46) - 6} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: FAM.stats.hue }}>Treatment 46%</text>
      <text x={x(24)} y={y(0.72) - 6} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: T.inkSoft }}>Control 72%</text>
      <text x={40} y={168} style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>ticks = censored · months 0–24 · retention curves are KM in disguise</text>
    </svg>
  );
}

function SHAPBeeswarmSVG() {
  const rng = makeRng(307);
  const feats = [
    { name: "momentum", spread: 0.9, dir: 1 }, { name: "volatility", spread: 0.7, dir: -1 },
    { name: "size", spread: 0.5, dir: -0.4 }, { name: "value", spread: 0.45, dir: 0.6 },
    { name: "quality", spread: 0.3, dir: 0.5 }, { name: "liquidity", spread: 0.2, dir: 0.2 },
  ];
  const W = 330, xL = 78, xR = W - 14, sx = (v) => xL + ((v + 1) / 2) * (xR - xL);
  const lerp = (v) => {
    const t = Math.max(0, Math.min(1, v));
    const c1 = [37, 99, 235], c2 = [220, 38, 38];
    return `rgb(${c1.map((c, i) => Math.round(c + (c2[i] - c) * t)).join(",")})`;
  };
  return (
    <svg viewBox={`0 0 ${W} 195`} width="100%" height="100%">
      <line x1={sx(0)} x2={sx(0)} y1={8} y2={168} stroke={T.inkSoft} strokeDasharray="3 3" />
      {feats.map((f, i) => {
        const y = 22 + i * 25;
        return (
          <g key={i}>
            <text x={xL - 8} y={y + 3.5} textAnchor="end" style={{ fontFamily: T.mono, fontSize: 10, fill: T.inkSoft }}>{f.name}</text>
            {Array.from({ length: 36 }).map((_, j) => {
              const fv = rng();
              const shap = f.dir * (fv - 0.5) * 2 * f.spread + (rng() - 0.5) * 0.22;
              return <circle key={j} cx={sx(Math.max(-1, Math.min(1, shap)))} cy={y + (rng() - 0.5) * 13} r={2.5} fill={lerp(fv)} opacity={0.75} />;
            })}
          </g>
        );
      })}
      <text x={xL} y={186} style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>x = SHAP value · <tspan fill="#2563EB">blue</tspan>=low, <tspan fill="#DC2626">red</tspan>=high feature value</text>
    </svg>
  );
}

function ConfusionMatrixGrid() {
  const classes = ["Class A", "Class B", "Class C"];
  const M = [[86, 9, 5], [12, 74, 14], [4, 11, 85]];
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "64px repeat(3, 1fr)", gap: 3 }}>
        <div />
        {classes.map(c => <div key={c} style={{ fontFamily: T.mono, fontSize: 9, color: T.inkSoft, textAlign: "center" }}>pred {c.slice(-1)}</div>)}
        {M.map((row, i) => (
          <React.Fragment key={i}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.inkSoft, alignSelf: "center" }}>true {classes[i].slice(-1)}</div>
            {row.map((v, j) => (
              <div key={j} style={{
                aspectRatio: "1.9", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
                background: i === j ? `rgba(67,56,202,${0.15 + v / 130})` : `rgba(185,28,28,${0.05 + v / 90})`,
                fontFamily: T.mono, fontSize: 12, color: v > 55 ? "#fff" : T.ink,
              }}>{v}%</div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkSoft, marginTop: 8 }}>row-normalized (recall view) — always say which normalization</div>
    </div>
  );
}

function CandlestickSVG() {
  const rng = makeRng(401);
  let c = 100;
  const candles = Array.from({ length: 22 }, () => {
    const o = c;
    c = o * (1 + (rng() - 0.47) * 0.045);
    const h = Math.max(o, c) * (1 + rng() * 0.013), l = Math.min(o, c) * (1 - rng() * 0.013);
    return { o, c, h, l };
  });
  const all = candles.flatMap(k => [k.h, k.l]);
  const lo = Math.min(...all), hi = Math.max(...all);
  const W = 330, y = (v) => 160 - ((v - lo) / (hi - lo)) * 145;
  return (
    <svg viewBox={`0 0 ${W} 185`} width="100%" height="100%">
      {candles.map((k, i) => {
        const x = 22 + i * 14, up = k.c >= k.o, col = up ? POS : NEG;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(k.h)} y2={y(k.l)} stroke={col} strokeWidth={1.2} />
            <rect x={x - 4} y={y(Math.max(k.o, k.c))} width={8} height={Math.max(1.5, Math.abs(y(k.o) - y(k.c)))} fill={up ? col : col} opacity={up ? 0.55 : 1} stroke={col} />
          </g>
        );
      })}
      <text x={22} y={178} style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>body = open→close · wick = high/low · hollow = up session</text>
    </svg>
  );
}

function MonthlyReturnHeat() {
  const rng = makeRng(419);
  const years = [2022, 2023, 2024, 2025];
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const data = years.map(() => months.map(() => (rng() - 0.44) * 7));
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "0 10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "44px repeat(12, 1fr) 46px", gap: 2.5 }}>
        <div />
        {months.map((m, i) => <div key={i} style={{ fontFamily: T.mono, fontSize: 8.5, color: T.inkSoft, textAlign: "center" }}>{m}</div>)}
        <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.inkSoft, textAlign: "center" }}>YR</div>
        {data.map((row, i) => {
          const yr = row.reduce((a, b) => a + b, 0);
          return (
            <React.Fragment key={i}>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkSoft, alignSelf: "center" }}>{years[i]}</div>
              {row.map((v, j) => (
                <div key={j} title={`${v.toFixed(1)}%`} style={{
                  aspectRatio: "1.25", borderRadius: 2,
                  background: v >= 0 ? `rgba(15,118,110,${0.1 + Math.min(0.85, Math.abs(v) / 5)})` : `rgba(185,28,28,${0.1 + Math.min(0.85, Math.abs(v) / 5)})`,
                }} />
              ))}
              <div style={{ fontFamily: T.mono, fontSize: 9, alignSelf: "center", textAlign: "right", color: yr >= 0 ? POS : NEG }}>{yr > 0 ? "+" : ""}{yr.toFixed(0)}%</div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkSoft, marginTop: 8 }}>monthly returns — seasonality and bad regimes at a glance</div>
    </div>
  );
}

function ProgressForms() {
  const pct = 68;
  const r = 46, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: "100%", padding: "0 8px" }}>
      <svg viewBox="0 0 120 120" width="42%">
        <circle cx={60} cy={60} r={r} fill="none" stroke={T.hairline} strokeWidth={11} />
        <circle cx={60} cy={60} r={r} fill="none" stroke={FAM.progress.hue} strokeWidth={11}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
        <text x={60} y={62} textAnchor="middle" style={{ fontFamily: T.serif, fontSize: 26, fill: T.ink }}>{pct}%</text>
        <text x={60} y={78} textAnchor="middle" style={{ fontFamily: T.mono, fontSize: 8, fill: T.inkSoft }}>OF GOAL</text>
      </svg>
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 11px)", gap: 2.5 }}>
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: i < pct ? FAM.progress.hue : "#E8E6DE" }} />
          ))}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.inkSoft, marginTop: 6 }}>waffle: countable squares</div>
      </div>
    </div>
  );
}

/* ---- module-level deterministic datasets for pass-1 recharts cards ---- */
const R2 = makeRng(999);
const D2 = (() => {
  const rocData = Array.from({ length: 21 }, (_, i) => {
    const f = i / 20;
    return { f: Math.round(f * 100) / 100, tpr: Math.round(Math.pow(f, 0.34) * 100) / 100, diag: f };
  });
  const calib = Array.from({ length: 10 }, (_, i) => {
    const p = 0.05 + i * 0.1;
    return { p: Math.round(p * 100) / 100, obs: Math.round((0.5 + (p - 0.5) * 0.78 + (R2() - 0.5) * 0.05) * 100) / 100, diag: p };
  });
  const spc = Array.from({ length: 30 }, (_, i) => ({
    i: i + 1, v: 50 + 2 * normal(R2) + (i >= 21 && i <= 23 ? 7.5 : 0),
  }));
  let cp = 0, cn = 0;
  const cusum = spc.map((d) => {
    cp = Math.max(0, cp + d.v - 50 - 1);
    cn = Math.min(0, cn + d.v - 50 + 1);
    return { i: d.i, cp: Math.round(cp * 10) / 10, cn: Math.round(cn * 10) / 10 };
  });
  const resid = Array.from({ length: 80 }, () => {
    const f = 10 + R2() * 80;
    return { f, r: (0.2 + f / 55) * 5.5 * normal(R2) };
  });
  let eq = 100, peak = 100;
  const equity = Array.from({ length: 120 }, (_, i) => {
    eq = eq * (1 + 0.0018 + (R2() - 0.5) * 0.028);
    peak = Math.max(peak, eq);
    return { t: i, eq: Math.round(eq * 10) / 10, dd: Math.round((eq / peak - 1) * 1000) / 10 };
  });
  const rollcorr = Array.from({ length: 60 }, (_, i) => ({
    t: i, c: Math.max(-1, Math.min(1, 0.55 - 1.1 * Math.exp(-(((i - 32) / 7) ** 2)) + (R2() - 0.5) * 0.12)),
  }));
  const assets = Array.from({ length: 9 }, (_, i) => {
    const risk = 5 + i * 2 + R2() * 2;
    return { risk, ret: 1.2 + 2.3 * Math.sqrt(Math.max(0.5, risk - 3.5)) + (R2() - 0.5) * 2.4, name: `A${i + 1}` };
  });
  const frontier = Array.from({ length: 26 }, (_, i) => {
    const risk = 4 + i * 0.75;
    return { risk, fret: 1.5 + 2.62 * Math.sqrt(risk - 3.5) };
  });
  const maturities = ["3M", "6M", "1Y", "2Y", "5Y", "10Y", "30Y"];
  const yields = maturities.map((m, i) => ({
    m, today: [5.3, 5.2, 4.9, 4.4, 4.1, 4.2, 4.4][i], yearAgo: [1.0, 1.3, 1.8, 2.4, 3.0, 3.4, 3.7][i],
  }));
  let s = 0;
  const spread = Array.from({ length: 70 }, (_, i) => ({ t: i, s: Math.round((s = 0.86 * s + (R2() - 0.5) * 1.5) * 100) / 100 }));
  const depth = [];
  for (let p = 90; p <= 110; p += 0.5) {
    depth.push({
      p,
      bid: p < 100 ? Math.round((100 - p) * 42 * (1 + R2() * 0.25)) : null,
      ask: p > 100 ? Math.round((p - 100) * 38 * (1 + R2() * 0.25)) : null,
    });
  }
  return { rocData, calib, spc, cusum, resid, equity, rollcorr, assets, frontier, yields, spread, depth };
})();

const SPCDot = (props) => {
  const { cx, cy, payload } = props;
  const out = payload.v > 56 || payload.v < 44;
  return out ? <circle cx={cx} cy={cy} r={4.5} fill={NEG} stroke="#fff" strokeWidth={1.4} /> : <circle cx={cx} cy={cy} r={1.8} fill={FAM.stats.hue} />;
};

/* ---- compact census entries (rendered as SpecCards) ---- */
const SPECS = {
  uncertainty: [
    { title: "Confidence band", useWhen: "an interval around a fitted line or series — see 'Line vs. reference band' in Deviation for the rendered form.", avoidWhen: "the band's definition can't be stated." },
    { title: "Fan chart", useWhen: "forecast uncertainty over horizon — rendered in Change over time.", avoidWhen: "" },
    { title: "Hypothetical outcome plots (HOPs)", useWhen: "interactive contexts: animated draws from the distribution — people internalize variability from frames better than from bands.", avoidWhen: "static media; motion-sensitive audiences." },
    { title: "Eye / half-eye plot", useWhen: "posterior distributions per parameter: density + interval + point in one glyph (Bayesian reporting).", avoidWhen: "audiences unfamiliar with distributions — use quantile dots." },
  ],
  stats: [
    { title: "Precision–recall curve", useWhen: "classifier evaluation under class imbalance — the honest curve when positives are rare.", avoidWhen: "balanced classes where ROC reads the same and is more familiar." },
    { title: "Lift / gains chart", useWhen: "business framing of model targeting value — 'top decile captures 45% of responders'.", avoidWhen: "technical audiences who want PR/ROC directly." },
    { title: "Funnel plot (meta-analysis)", useWhen: "publication-bias check: effect vs. precision; asymmetry = trouble.", avoidWhen: "fewer than ~10 studies — the shape is uninformative." },
    { title: "Bland–Altman", useWhen: "agreement between two measurement methods: difference vs. mean, bias line, limits of agreement.", avoidWhen: "you're tempted to answer this with a correlation — it will mislead." },
    { title: "Scree / elbow plot", useWhen: "choosing component or cluster count — mark the bend, it is the message.", avoidWhen: "the curve has no bend (report that honestly)." },
    { title: "PCA biplot", useWhen: "scores + loading vectors together: observations and the variables driving their spread.", avoidWhen: "many correlated loadings — arrows become a hairball." },
    { title: "Partial dependence / ICE", useWhen: "model response as one feature varies: average curve + per-observation strands to expose heterogeneity.", avoidWhen: "strongly correlated features — PD extrapolates into impossible regions." },
  ],
  finance: [
    { title: "OHLC bars", useWhen: "candlestick's information with less ink — tick-left open, tick-right close.", avoidWhen: "pattern-reading audiences who expect candles." },
    { title: "Volume profile", useWhen: "traded volume by price level (horizontal histogram beside price) — support/resistance by where volume lived.", avoidWhen: "illiquid series where the profile is noise." },
    { title: "Renko / Kagi / point-and-figure", useWhen: "price filtered of time — marks drawn only on threshold moves. Technical-analysis idioms.", avoidWhen: "any audience that doesn't already use them." },
    { title: "Risk-contribution treemap", useWhen: "portfolio decomposition: size = weight or risk contribution, color = return. See Treemap in Part-to-whole for the form.", avoidWhen: "precise attribution — use a waterfall or table." },
  ],
  progress: [
    { title: "Bullet chart", useWhen: "KPI vs. target vs. bands — rendered in Comparison. The honest gauge replacement.", avoidWhen: "" },
    { title: "KPI tile + sparkline", useWhen: "headline metrics: number, delta, trend — rendered in Change over time.", avoidWhen: "" },
    { title: "Thermometer", useWhen: "fundraising-style single-target progress; schematic by convention.", avoidWhen: "anything analytical." },
    { title: "Gauge / speedometer", useWhen: "listed for completeness only: huge pixels, one number, no context.", avoidWhen: "always — use a bullet chart. This is an anti-pattern with a fan club." },
  ],
};

/* ============ recharts data ============ */
function useData() {
  return useMemo(() => {
    const rng = makeRng(1);

    const sortedBar = [
      { name: "Enterprise", v: 118 }, { name: "Mid-market", v: 86 }, { name: "SMB", v: 64 },
      { name: "Startup", v: 41 }, { name: "Education", v: 27 }, { name: "Non-profit", v: 12 },
    ];
    const groupedBar = ["Q1", "Q2", "Q3", "Q4"].map((q, i) => ({
      q, "2024": 40 + i * 8 + rng() * 8, "2025": 52 + i * 11 + rng() * 8,
    }));
    const multiLine = Array.from({ length: 24 }, (_, i) => {
      const t = i;
      return {
        m: `M${i + 1}`,
        EU: 40 + t * 2.1 + Math.sin(t / 2.4) * 6 + rng() * 4,
        US: 55 + t * 1.2 + Math.sin(t / 3) * 4 + rng() * 4,
        APAC: 30 + t * 0.7 + rng() * 5,
      };
    });
    const stackedArea = Array.from({ length: 16 }, (_, i) => ({
      q: `Q${i + 1}`,
      Subscriptions: 30 + i * 3.4 + rng() * 3,
      Services: 22 + i * 0.8 + rng() * 3,
      Licenses: Math.max(4, 20 - i * 0.9 + rng() * 3),
    }));
    let lvl = 100;
    const fan = Array.from({ length: 30 }, (_, i) => {
      const hist = i < 18;
      lvl = lvl * (1 + 0.012 + (hist ? (rng() - 0.5) * 0.05 : 0));
      const k = hist ? 0 : (i - 17);
      return {
        t: i, actual: hist ? lvl : null, mid: hist ? null : lvl,
        b80: hist ? null : [lvl * (1 - 0.03 * Math.sqrt(k)), lvl * (1 + 0.03 * Math.sqrt(k))],
        b95: hist ? null : [lvl * (1 - 0.055 * Math.sqrt(k)), lvl * (1 + 0.055 * Math.sqrt(k))],
      };
    });
    const histSamples = Array.from({ length: 400 }, () => 52 + 13 * normal(rng)).concat(Array.from({ length: 60 }, () => 90 + 5 * normal(rng)));
    const bins = Array.from({ length: 22 }, (_, i) => ({ x: 10 + i * 5, n: 0 }));
    histSamples.forEach(v => { const b = Math.floor((v - 10) / 5); if (bins[b]) bins[b].n++; });

    const scatter = Array.from({ length: 90 }, () => {
      const x = 20 + rng() * 70;
      return { x, y: 12 + x * 0.72 + 11 * normal(rng) };
    });
    const xs = scatter.map(p => p.x), ys = scatter.map(p => p.y);
    const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
    const beta = scatter.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / scatter.reduce((a, p) => a + (p.x - mx) ** 2, 0);
    const fit = { x1: 20, y1: my + beta * (20 - mx), x2: 90, y2: my + beta * (90 - mx) };

    const bubble = Array.from({ length: 18 }, (_, i) => ({
      x: 15 + rng() * 75, y: 20 + rng() * 65, z: 20 + rng() * 340, name: `Co ${String.fromCharCode(65 + i)}`,
    }));

    const donut = [
      { name: "Product A", value: 44 }, { name: "Product B", value: 27 },
      { name: "Product C", value: 18 }, { name: "Other", value: 11 },
    ];
    const stacked100 = ["EU", "US", "APAC", "LATAM"].map((r) => {
      const a = 20 + rng() * 40, b = 15 + rng() * 30, c = 10 + rng() * 20, d = 8 + rng() * 12, s = a + b + c + d;
      return { r, Organic: (a / s) * 100, Paid: (b / s) * 100, Referral: (c / s) * 100, Direct: (d / s) * 100 };
    });
    const treemap = [
      { name: "Tech", size: 4200 }, { name: "Financials", size: 2600 }, { name: "Health", size: 2100 },
      { name: "Consumer", size: 1700 }, { name: "Industrials", size: 1300 }, { name: "Energy", size: 900 },
      { name: "Utilities", size: 500 }, { name: "Materials", size: 420 }, { name: "REITs", size: 380 },
    ];

    const wfSteps = [
      { name: "2024 EBITDA", delta: 120, type: "anchor" },
      { name: "Volume", delta: 34, type: "up" },
      { name: "Pricing", delta: 18, type: "up" },
      { name: "Input costs", delta: -26, type: "down" },
      { name: "FX", delta: -9, type: "down" },
      { name: "Opex", delta: -14, type: "down" },
      { name: "2025 EBITDA", delta: 123, type: "anchor" },
    ];
    let running = 0;
    const waterfall = wfSteps.map((s) => {
      if (s.type === "anchor") { running = s.delta; return { ...s, base: 0, v: s.delta }; }
      const base = s.delta >= 0 ? running : running + s.delta;
      running += s.delta;
      return { ...s, base, v: Math.abs(s.delta) };
    });

    const diverging = [
      { name: "Ops", v: 14 }, { name: "Sales", v: 9 }, { name: "Product", v: 4 },
      { name: "Support", v: -3 }, { name: "Marketing", v: -8 }, { name: "Logistics", v: -12 },
    ].sort((a, b) => b.v - a.v);

    const anomalies = Array.from({ length: 36 }, (_, i) => ({
      m: i, v: Math.sin(i / 4) * 1.1 + (i > 26 ? 1.3 : 0) + (rng() - 0.5) * 1.4,
    }));

    const bandLine = Array.from({ length: 24 }, (_, i) => {
      const target = 60 + i * 0.8;
      return { m: `M${i + 1}`, band: [target - 8, target + 8], actual: target + Math.sin(i / 3) * 6 + (rng() - 0.5) * 8 + (i > 17 ? 8 : 0) };
    });

    const bump = Array.from({ length: 8 }, (_, t) => {
      const ranks = { t: `Q${t + 1}` };
      const order = [
        ["Acme", "Birch", "Cinder", "Dune"],
        ["Acme", "Birch", "Cinder", "Dune"],
        ["Birch", "Acme", "Cinder", "Dune"],
        ["Birch", "Acme", "Dune", "Cinder"],
        ["Birch", "Dune", "Acme", "Cinder"],
        ["Dune", "Birch", "Acme", "Cinder"],
        ["Dune", "Birch", "Cinder", "Acme"],
        ["Dune", "Cinder", "Birch", "Acme"],
      ][t];
      order.forEach((name, i) => (ranks[name] = i + 1));
      return ranks;
    });

    const sankey = {
      nodes: [
        { name: "Organic" }, { name: "Paid" }, { name: "Referral" },
        { name: "Landing" }, { name: "Pricing" },
        { name: "Converted" }, { name: "Dropped" },
      ],
      links: [
        { source: 0, target: 3, value: 60 }, { source: 1, target: 3, value: 35 },
        { source: 2, target: 4, value: 20 }, { source: 0, target: 4, value: 15 },
        { source: 3, target: 5, value: 38 }, { source: 3, target: 6, value: 57 },
        { source: 4, target: 5, value: 16 }, { source: 4, target: 6, value: 19 },
      ],
    };

    return { sortedBar, groupedBar, multiLine, stackedArea, fan, bins, scatter, fit, bubble, donut, stacked100, treemap, waterfall, diverging, anomalies, bandLine, bump, sankey };
  }, []);
}

/* ============ intent selector ============ */
const INTENTS = [
  { label: "…which category is biggest", id: "sorted-bar" },
  { label: "…a KPI vs. its target", id: "bullet" },
  { label: "…before vs. after, many entities", id: "slope" },
  { label: "…change between two states per category", id: "dumbbell" },
  { label: "…a trend (few series)", id: "line" },
  { label: "…many trends at once", id: "small-multiples" },
  { label: "…how composition shifted over time", id: "stacked-area" },
  { label: "…how we got from A to B through factors", id: "waterfall" },
  { label: "…whether X and Y are related", id: "scatter" },
  { label: "…X vs Y plus a third magnitude", id: "bubble" },
  { label: "…the shape of a distribution", id: "histogram" },
  { label: "…distributions across groups", id: "box" },
  { label: "…hidden multimodality", id: "violin" },
  { label: "…the actual observations (small n)", id: "beeswarm" },
  { label: "…shares of a whole, ≤5 parts", id: "donut" },
  { label: "…many parts / a hierarchy", id: "treemap" },
  { label: "…flows between states", id: "sankey" },
  { label: "…sequential drop-off", id: "funnel" },
  { label: "…rank changes over time", id: "bump" },
  { label: "…deviation from a baseline", id: "diverging" },
  { label: "…a forecast with uncertainty", id: "fan" },
  { label: "…a rate by region", id: "tilemap" },
  { label: "…a rhythm across hours × days", id: "matrix-heat" },
  { label: "…pairwise correlations, many variables", id: "corr" },
  { label: "…KPI tiles for a dashboard", id: "sparklines" },
  { label: "…an estimate with its uncertainty", id: "errorbars" },
  { label: "…probability, for a lay audience", id: "qdot" },
  { label: "…effects with CIs across studies/segments", id: "forest" },
  { label: "…retention / time-to-event", id: "km" },
  { label: "…classifier quality", id: "roc" },
  { label: "…whether the model's probabilities are honest", id: "calib" },
  { label: "…what drives the model", id: "shap" },
  { label: "…is this metric abnormal?", id: "spc" },
  { label: "…a small persistent drift", id: "cusum" },
  { label: "…strategy performance and pain", id: "equity" },
  { label: "…seasonality of returns", id: "retheat" },
  { label: "…a pairs trade", id: "spreadchart" },
  { label: "…progress toward a goal", id: "progressforms" },
];

/* ============ main ============ */
export default function ChartAtlas() {
  const D = useData();
  const [tab, setTab] = useState("comparison");
  const [flashId, setFlashId] = useState(null);

  const CH = {
    comparison: "#2563EB", time: "#0D9488", distribution: "#7C3AED", relationship: "#DB2777",
    parttowhole: "#EA580C", flow: "#0891B2", deviation: "#B91C1C", spatial: "#4D7C0F",
  };
  const PALETTE = ["#2563EB", "#0D9488", "#EA580C", "#7C3AED", "#DB2777"];

  const cardFamily = {
    "sorted-bar": "comparison", "grouped-bar": "comparison", slope: "comparison", dumbbell: "comparison", bullet: "comparison", bump: "comparison",
    line: "time", "stacked-area": "time", "small-multiples": "time", fan: "time", sparklines: "time", calendar: "time",
    histogram: "distribution", box: "distribution", violin: "distribution", beeswarm: "distribution", ridgeline: "distribution",
    scatter: "relationship", bubble: "relationship", corr: "relationship", "matrix-heat": "relationship",
    donut: "parttowhole", "stacked-100": "parttowhole", treemap: "parttowhole", waterfall: "parttowhole",
    sankey: "flow", funnel: "flow",
    diverging: "deviation", anomaly: "deviation", band: "deviation",
    tilemap: "spatial", symbolmap: "spatial",
    errorbars: "uncertainty", qdot: "uncertainty", gradient: "uncertainty",
    forest: "stats", km: "stats", roc: "stats", calib: "stats", confusion: "stats", shap: "stats", spc: "stats", cusum: "stats", resid: "stats",
    candle: "finance", equity: "finance", retheat: "finance", rollcorr: "finance", frontier: "finance", yield: "finance", spreadchart: "finance", depth: "finance",
    progressforms: "progress",
  };

  const jump = (id) => {
    if (!id) return;
    setTab(cardFamily[id]);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(id);
      setTimeout(() => setFlashId(null), 2200);
    }, 60);
  };

  const C = (p) => <Card {...p} flashId={flashId} />;

  return (
    <div style={{ background: T.paper, minHeight: "100vh", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        select:focus, button:focus-visible { outline: 2px solid ${T.ink}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; scroll-behavior: auto !important; } }
      `}</style>

      {/* header */}
      <header style={{ padding: "26px 18px 6px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.14em", color: T.inkSoft }}>A FIELD GUIDE, IN LIVE SPECIMENS</div>
        <h1 style={{ fontFamily: T.serif, fontWeight: 400, fontSize: 40, margin: "4px 0 6px", lineHeight: 1.05 }}>
          The Chart Atlas
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: 13.5, color: T.inkSoft, maxWidth: 620, lineHeight: 1.55, margin: 0 }}>
          Every chart answers one kind of question. Start from the message, not the data — pick an intent below, or browse by family. All data is synthetic.
        </p>

        {/* intent selector — the signature */}
        <div style={{ margin: "16px 0 4px", padding: 14, background: T.card, border: `1px solid ${T.hairline}`, borderRadius: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.serif, fontSize: 20, fontStyle: "italic" }}>I want to show</span>
          <select
            aria-label="Pick what you want to show"
            defaultValue=""
            onChange={(e) => { jump(e.target.value); e.target.value = ""; }}
            style={{ flex: "1 1 240px", fontFamily: T.mono, fontSize: 12.5, padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${T.ink}`, background: T.paper, color: T.ink }}
          >
            <option value="" disabled>…choose the message</option>
            {INTENTS.map((it) => <option key={it.id} value={it.id}>{it.label}</option>)}
          </select>
        </div>
      </header>

      {/* family nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 10, background: `${T.paper}F2`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${T.hairline}`, padding: "10px 12px", overflowX: "auto", whiteSpace: "nowrap" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 8 }}>
          {Object.entries(FAM).map(([k, f]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{
                fontFamily: T.mono, fontSize: 11.5, padding: "7px 12px", borderRadius: 999, cursor: "pointer",
                border: `1.5px solid ${tab === k ? f.hue : T.hairline}`,
                background: tab === k ? f.hue : T.card, color: tab === k ? "#fff" : T.inkSoft,
                flexShrink: 0,
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 14px 60px", display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))" }}>

        {/* ============ COMPARISON ============ */}
        {tab === "comparison" && (<>
          <C id="sorted-bar" family="comparison" title="Sorted bar"
            useWhen="comparing magnitudes across ≤ ~12 categories. Sort by value unless order is meaningful."
            avoidWhen="values are all close, or the axis can't start at zero — switch to a dot plot.">
            <ResponsiveContainer>
              <BarChart data={D.sortedBar} layout="vertical" margin={{ left: 8, right: 40, top: 4 }}>
                <XAxis type="number" hide domain={[0, 130]} />
                <YAxis type="category" dataKey="name" width={82} tickLine={false} axisLine={false} tick={axisStyle} />
                <Tooltip content={<Tip />} cursor={{ fill: "#00000008" }} />
                <Bar dataKey="v" name="ARR ($k)" radius={[0, 3, 3, 0]}>
                  {D.sortedBar.map((d, i) => <Cell key={i} fill={i === 0 ? CH.comparison : GRAY} />)}
                  <LabelList dataKey="v" position="right" style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </C>

          <C id="grouped-bar" family="comparison" title="Grouped bar"
            useWhen="comparing 2–4 sub-categories within each category — e.g. this year vs. last."
            avoidWhen="more than 4 per group, or the story is the total — stack instead.">
            <ResponsiveContainer>
              <BarChart data={D.groupedBar} margin={{ top: 8, right: 8 }}>
                <CartesianGrid vertical={false} stroke={T.hairline} />
                <XAxis dataKey="q" tickLine={false} axisLine={false} tick={axisStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisStyle} width={30} />
                <Tooltip content={<Tip />} cursor={{ fill: "#00000008" }} />
                <Bar dataKey="2024" fill={GRAY} radius={[3, 3, 0, 0]} />
                <Bar dataKey="2025" fill={CH.comparison} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </C>

          <C id="slope" family="comparison" title="Slope chart"
            useWhen="exactly two time points and the story is who rose, who fell, who crossed whom."
            avoidWhen="more than ~15 entities or more than 2–3 time points — becomes spaghetti.">
            <SlopeChart />
          </C>

          <C id="dumbbell" family="comparison" title="Dumbbell (connected dot)"
            useWhen="the change between two states per category — before/after, segment A vs B."
            avoidWhen="more than two states per category, or the levels matter more than the gap.">
            <DumbbellChart />
          </C>

          <C id="bullet" family="comparison" title="Bullet chart"
            useWhen="a single KPI vs. target vs. qualitative bands. The honest replacement for gauges."
            avoidWhen="no meaningful target or bands exist — a plain labeled number is enough.">
            <BulletChart />
          </C>

          <C id="bump" family="comparison" title="Bump chart"
            useWhen="tracking rank position over time — league tables, market-share order."
            avoidWhen="magnitudes matter: ranks hide how close #1 and #2 really are.">
            <ResponsiveContainer>
              <LineChart data={D.bump} margin={{ top: 8, right: 52, left: -14 }}>
                <XAxis dataKey="t" tickLine={false} axisLine={false} tick={axisStyle} />
                <YAxis reversed domain={[0.6, 4.4]} ticks={[1, 2, 3, 4]} tickLine={false} axisLine={false} tick={axisStyle} />
                <Tooltip content={<Tip />} />
                {["Acme", "Birch", "Cinder", "Dune"].map((n, i) => (
                  <Line key={n} dataKey={n} stroke={n === "Dune" ? CH.comparison : GRAY} strokeWidth={n === "Dune" ? 2.4 : 1.6} dot={{ r: 2.6 }}
                    label={undefined} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </C>
        </>)}

        {/* ============ TIME ============ */}
        {tab === "time" && (<>
          <C id="line" family="time" title="Line chart"
            useWhen="continuous series; trend, seasonality, turning points. Up to ~5 series overlaid."
            avoidWhen="more than 5 series (small multiples) or discrete category snapshots (bar).">
            <ResponsiveContainer>
              <LineChart data={D.multiLine} margin={{ top: 8, right: 40 }}>
                <CartesianGrid vertical={false} stroke={T.hairline} />
                <XAxis dataKey="m" tick={axisStyle} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <Line dataKey="EU" stroke={CH.time} strokeWidth={2.4} dot={false} />
                <Line dataKey="US" stroke={GRAY} strokeWidth={1.6} dot={false} />
                <Line dataKey="APAC" stroke="#A8A69E" strokeWidth={1.6} dot={false} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </C>

          <C id="stacked-area" family="time" title="Stacked area"
            useWhen="a total and its 3–5 components evolving together. Most stable series at the bottom."
            avoidWhen="middle layers must be read precisely — both their edges wiggle.">
            <ResponsiveContainer>
              <AreaChart data={D.stackedArea} margin={{ top: 8, right: 8 }}>
                <XAxis dataKey="q" tick={axisStyle} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <Area dataKey="Subscriptions" stackId="1" stroke={CH.time} fill={`${CH.time}55`} />
                <Area dataKey="Services" stackId="1" stroke="#EA580C" fill="#EA580C44" />
                <Area dataKey="Licenses" stackId="1" stroke="#94928A" fill="#94928A44" />
              </AreaChart>
            </ResponsiveContainer>
          </C>

          <C id="small-multiples" family="time" title="Small multiples"
            useWhen="more than ~5 series. The cure for spaghetti: each panel focal, the rest in gray."
            avoidWhen="panels would need different scales — identical axes are the whole point.">
            <SmallMultiples />
          </C>

          <C id="fan" family="time" title="Fan chart (forecast bands)"
            useWhen="forecasts with uncertainty: central path + widening quantile bands, history clearly separated."
            avoidWhen="you'd show a single confident line for the future — that's a claim, not a forecast.">
            <ResponsiveContainer>
              <ComposedChart data={D.fan} margin={{ top: 8, right: 8 }}>
                <XAxis dataKey="t" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis domain={["auto", "auto"]} tick={axisStyle} tickLine={false} axisLine={false} width={34} />
                <Tooltip content={<Tip />} />
                <ReferenceLine x={17} stroke={T.inkSoft} strokeDasharray="3 3" />
                <Area dataKey="b95" name="95% band" stroke="none" fill={`${CH.time}22`} connectNulls={false} />
                <Area dataKey="b80" name="80% band" stroke="none" fill={`${CH.time}3D`} connectNulls={false} />
                <Line dataKey="actual" name="history" stroke={T.ink} strokeWidth={2} dot={false} />
                <Line dataKey="mid" name="forecast" stroke={CH.time} strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="sparklines" family="time" title="KPI tiles + sparklines"
            useWhen="dashboard headline metrics: number first, delta vs. reference, trend as context."
            avoidWhen="the trend itself is the story — give it a full line chart with axes.">
            <SparklineTiles />
          </C>

          <C id="calendar" family="time" title="Calendar heatmap"
            useWhen="daily data where weekday/weekend rhythm or regime shifts are the story."
            avoidWhen="exact values matter — color is the weakest encoding.">
            <CalendarHeatmap />
          </C>
        </>)}

        {/* ============ DISTRIBUTION ============ */}
        {tab === "distribution" && (<>
          <C id="histogram" family="distribution" title="Histogram"
            useWhen="the shape of one distribution: skew, modality, outliers. Try several bin widths."
            avoidWhen="comparing 3+ groups (box/ridgeline) or n < ~30 (show the points).">
            <ResponsiveContainer>
              <BarChart data={D.bins} barCategoryGap={0} margin={{ top: 8, right: 8 }}>
                <XAxis dataKey="x" tick={axisStyle} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={28} />
                <Tooltip content={<Tip />} cursor={{ fill: "#00000008" }} />
                <Bar dataKey="n" name="count" fill={`${CH.distribution}CC`} stroke={T.paper} strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </C>

          <C id="box" family="distribution" title="Box plot"
            useWhen="comparing distribution summaries across many groups: median, IQR, outliers."
            avoidWhen="distributions may be multimodal — a box hides two humps completely.">
            <BoxPlotChart />
          </C>

          <C id="violin" family="distribution" title="Violin plot"
            useWhen="box-plot use case plus shape matters — note the bimodal group a box would hide."
            avoidWhen="small n (smoothing invents shape) or a lay audience — use raincloud/beeswarm.">
            <ViolinPlot />
          </C>

          <C id="beeswarm" family="distribution" title="Jitter / beeswarm"
            useWhen="small-to-medium n — showing actual observations beats every summary."
            avoidWhen="thousands of points: overplotting. Return to summaries or density.">
            <BeeswarmChart />
          </C>

          <C id="ridgeline" family="distribution" title="Ridgeline"
            useWhen="one distribution across many ordered groups — the seasonal drift reads as terrain."
            avoidWhen="groups have no natural order, or non-adjacent ridges must be compared precisely.">
            <RidgelineChart />
          </C>
        </>)}

        {/* ============ RELATIONSHIP ============ */}
        {tab === "relationship" && (<>
          <C id="scatter" family="relationship" title="Scatter + fit"
            useWhen="relationship between two continuous variables: correlation, clusters, outliers."
            avoidWhen="massive overplotting — switch to hexbin or density contours.">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 8, right: 12, bottom: 4 }}>
                <CartesianGrid stroke={T.hairline} />
                <XAxis dataKey="x" type="number" name="ad spend" domain={[15, 95]} tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis dataKey="y" type="number" name="signups" tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3" }} />
                <ReferenceLine segment={[{ x: D.fit.x1, y: D.fit.y1 }, { x: D.fit.x2, y: D.fit.y2 }]} stroke={T.ink} strokeWidth={1.6} />
                <Scatter data={D.scatter} fill={`${CH.relationship}88`} />
              </ScatterChart>
            </ResponsiveContainer>
          </C>

          <C id="bubble" family="relationship" title="Bubble"
            useWhen="scatter + a third magnitude where approximate size suffices. Scale by area, never radius."
            avoidWhen="the third variable is the main story — promote it to an axis.">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 8, right: 12, bottom: 4 }}>
                <CartesianGrid stroke={T.hairline} />
                <XAxis dataKey="x" type="number" name="growth %" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis dataKey="y" type="number" name="margin %" tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <ZAxis dataKey="z" range={[50, 420]} name="revenue" />
                <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={D.bubble} fill={`${CH.relationship}66`} stroke={CH.relationship} />
              </ScatterChart>
            </ResponsiveContainer>
          </C>

          <C id="corr" family="relationship" title="Correlation heatmap"
            useWhen="pairwise correlation across many variables — the block gestalt is the point. Diverging scale centered on zero; lower triangle only."
            avoidWhen="only a handful of pairs matter — scatter the interesting ones instead.">
            <CorrHeatmap />
          </C>

          <C id="matrix-heat" family="relationship" title="Matrix heatmap"
            useWhen="a value across two categorical dimensions — hour × weekday, cohort retention."
            avoidWhen="precision is required, or you're tempted by a rainbow colormap.">
            <MatrixHeatmap />
          </C>
        </>)}

        {/* ============ PART-TO-WHOLE ============ */}
        {tab === "parttowhole" && (<>
          <C id="donut" family="parttowhole" title="Donut"
            useWhen="2–5 slices, one moment in time, rough shares. Largest slice at 12 o'clock; total in the hole."
            avoidWhen="more than 5 slices, similar-sized slices, or any comparison across groups.">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip content={<Tip />} />
                <Pie data={D.donut} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="82%" startAngle={90} endAngle={-270} paddingAngle={2}
                  label={({ name, value }) => `${name} ${value}%`} labelLine={false} style={{ fontFamily: T.mono, fontSize: 10 }}>
                  {D.donut.map((_, i) => <Cell key={i} fill={[CH.parttowhole, "#F59E0B", "#A8A29E", "#D6D3CC"][i]} />)}
                </Pie>
                <text x="50%" y="48%" textAnchor="middle" style={{ fontFamily: T.serif, fontSize: 24, fill: T.ink }}>$4.1M</text>
                <text x="50%" y="58%" textAnchor="middle" style={{ fontFamily: T.mono, fontSize: 9.5, fill: T.inkSoft }}>TOTAL REVENUE</text>
              </PieChart>
            </ResponsiveContainer>
          </C>

          <C id="stacked-100" family="parttowhole" title="100% stacked bar"
            useWhen="comparing composition across groups — the correct answer whenever you want multiple pies."
            avoidWhen="totals also matter (use absolute stacking) or >5 segments.">
            <ResponsiveContainer>
              <BarChart data={D.stacked100} layout="vertical" margin={{ left: 4, right: 12, top: 4 }}>
                <XAxis type="number" domain={[0, 100]} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="r" width={52} tick={axisStyle} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: "#00000008" }} />
                <Bar dataKey="Organic" stackId="a" fill={CH.parttowhole} />
                <Bar dataKey="Paid" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Referral" stackId="a" fill="#A8A29E" />
                <Bar dataKey="Direct" stackId="a" fill="#D6D3CC" />
              </BarChart>
            </ResponsiveContainer>
          </C>

          <C id="treemap" family="parttowhole" title="Treemap"
            useWhen="part-to-whole with many components or a hierarchy — instant 'what dominates' gestalt."
            avoidWhen="precise comparison is needed, or values change sign.">
            <ResponsiveContainer>
              <Treemap data={D.treemap} dataKey="size" stroke={T.paper}
                content={({ x, y, width, height, name, value }) => (
                  <g>
                    <rect x={x} y={y} width={width} height={height} fill={`rgba(234,88,12,${0.25 + Math.min(0.65, (value || 0) / 5000)})`} stroke={T.paper} strokeWidth={2} />
                    {width > 56 && height > 26 && (
                      <text x={x + 7} y={y + 17} style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }}>{name}</text>
                    )}
                  </g>
                )} />
            </ResponsiveContainer>
          </C>

          <C id="waterfall" family="parttowhole" title="Waterfall" tall
            useWhen="bridging a start value to an end value through sequential drivers — the P&L walk, variance attribution."
            avoidWhen="factors aren't additive or lack a meaningful sequence; >10 steps (group into 'other').">
            <ResponsiveContainer>
              <BarChart data={D.waterfall} margin={{ top: 20, right: 8 }}>
                <CartesianGrid vertical={false} stroke={T.hairline} />
                <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 8.5 }} tickLine={false} axisLine={false} interval={0} angle={-24} textAnchor="end" height={46} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
                <Bar dataKey="v" stackId="w" radius={[2, 2, 0, 0]}>
                  {D.waterfall.map((d, i) => (
                    <Cell key={i} fill={d.type === "anchor" ? T.ink : d.type === "up" ? POS : NEG} />
                  ))}
                  <LabelList content={({ x, y, width, index }) => {
                    const d = D.waterfall[index];
                    const lab = d.type === "anchor" ? d.delta : (d.delta > 0 ? `+${d.delta}` : d.delta);
                    return <text x={x + width / 2} y={y - 5} textAnchor="middle" style={{ fontFamily: T.mono, fontSize: 9.5, fill: d.type === "up" ? POS : d.type === "down" ? NEG : T.ink }}>{lab}</text>;
                  }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </C>
        </>)}

        {/* ============ FLOW ============ */}
        {tab === "flow" && (<>
          <C id="sankey" family="flow" title="Sankey" tall
            useWhen="quantities flowing between states — traffic → pages → outcome. Link width = volume."
            avoidWhen="dozens of nodes or looping flows — it becomes a hairball.">
            <ResponsiveContainer>
              <Sankey data={D.sankey} nodePadding={26} margin={{ top: 10, bottom: 10, left: 4, right: 4 }}
                node={{ fill: FAM.flow.hue, stroke: "none" }}
                link={{ stroke: `${FAM.flow.hue}55` }}>
                <Tooltip content={<Tip />} />
              </Sankey>
            </ResponsiveContainer>
          </C>

          <C id="funnel" family="flow" title="Funnel (as labeled bars)"
            useWhen="strictly sequential drop-off. Plain bars + between-stage % beat the trapezoid gimmick — the conversion rate is the insight, not the shape."
            avoidWhen="stages can be skipped or re-entered — that's a Sankey.">
            <FunnelBars />
          </C>
        </>)}

        {/* ============ DEVIATION ============ */}
        {tab === "deviation" && (<>
          <C id="diverging" family="deviation" title="Diverging bar"
            useWhen="values relative to a reference — variance vs. budget, net sentiment. Zero line is the most important line: solid and dark."
            avoidWhen="there's no meaningful baseline — then it's just a sorted bar.">
            <ResponsiveContainer>
              <BarChart data={D.diverging} layout="vertical" margin={{ left: 8, right: 30, top: 4 }}>
                <XAxis type="number" domain={[-16, 16]} tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={68} tick={axisStyle} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: "#00000008" }} />
                <ReferenceLine x={0} stroke={T.ink} strokeWidth={1.6} />
                <Bar dataKey="v" name="vs budget %" radius={2}>
                  {D.diverging.map((d, i) => <Cell key={i} fill={d.v >= 0 ? POS : NEG} />)}
                  <LabelList dataKey="v" position="right" formatter={(v) => (v > 0 ? `+${v}` : v)} style={{ fontFamily: T.mono, fontSize: 10, fill: T.ink }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </C>

          <C id="anomaly" family="deviation" title="Deviation-colored series"
            useWhen="a long series vs. a baseline — anomalies above/below zero in two hues (climate-stripes logic)."
            avoidWhen="the level, not the deviation, is the message — plain line.">
            <ResponsiveContainer>
              <BarChart data={D.anomalies} margin={{ top: 8, right: 8 }}>
                <XAxis dataKey="m" tick={axisStyle} tickLine={false} axisLine={false} interval={7} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} cursor={{ fill: "#00000008" }} />
                <ReferenceLine y={0} stroke={T.ink} />
                <Bar dataKey="v" name="anomaly σ">
                  {D.anomalies.map((d, i) => <Cell key={i} fill={d.v >= 0 ? `${NEG}CC` : "#2563EBCC"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </C>

          <C id="band" family="deviation" title="Line vs. reference band"
            useWhen="a series against a target or normal range — band in light gray, actual on top. Excursions become self-evident."
            avoidWhen="the band has no defensible definition — an arbitrary band implies false precision.">
            <ResponsiveContainer>
              <ComposedChart data={D.bandLine} margin={{ top: 8, right: 8 }}>
                <XAxis dataKey="m" tick={axisStyle} tickLine={false} axisLine={false} interval={5} />
                <YAxis domain={["auto", "auto"]} tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <Area dataKey="band" name="normal range" stroke="none" fill="#00000012" />
                <Line dataKey="actual" stroke={FAM.deviation.hue} strokeWidth={2.2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>
        </>)}

        {/* ============ SPATIAL ============ */}
        {tab === "spatial" && (<>
          <C id="tilemap" family="spatial" title="Tile grid map"
            useWhen="a rate by region where every unit deserves equal visual weight — geography as index, not shape."
            avoidWhen="actual adjacency/shape matters, or your audience won't recognize the codes.">
            <TileMap />
          </C>

          <C id="symbolmap" family="spatial" title="Proportional symbol map"
            useWhen="counts or magnitudes at locations. Raw counts belong on symbols, not choropleths — big regions would lie."
            avoidWhen="the metric is a rate or density — that's the choropleth's job.">
            <SymbolMap />
          </C>
        </>)}
        {/* ============ UNCERTAINTY ============ */}
        {tab === "uncertainty" && (<>
          <C id="errorbars" family="uncertainty" title="Error bars"
            useWhen="point estimates with intervals per category. Unlabeled error bars are noise — always say SE, SD, or CI."
            avoidWhen="the full distribution shape matters — show it (violin, quantile dots).">
            <ErrorBarsSVG />
          </C>

          <C id="qdot" family="uncertainty" title="Quantile dot plot"
            useWhen="communicating probability to lay audiences as countable, equally likely outcomes — the best-evidenced format for probabilistic decisions."
            avoidWhen="fine-grained distributional detail is needed — 20 dots quantize heavily.">
            <QuantileDotPlotSVG />
          </C>

          <C id="gradient" family="uncertainty" title="Gradient / fade plot"
            useWhen="uncertainty as fading opacity — no hard interval edge, so no false cliff at exactly '95%'."
            avoidWhen="the audience must read off a specific interval — give them labeled bands.">
            <GradientBandSVG />
          </C>
        </>)}

        {/* ============ STATS & ML ============ */}
        {tab === "stats" && (<>
          <C id="forest" family="stats" title="Forest plot"
            useWhen="effect sizes + CIs across studies, segments, or model coefficients, against a null line; square size = weight, diamond = pooled."
            avoidWhen="a single effect — that's just an error bar.">
            <ForestPlotSVG />
          </C>

          <C id="km" family="stats" title="Kaplan–Meier survival"
            useWhen="time-to-event by group: stepped survival probability with censor ticks. Retention and churn curves are KM in disguise."
            avoidWhen="events aren't time-anchored, or censoring is ignored (it biases everything).">
            <KMSurvivalSVG />
          </C>

          <C id="roc" family="stats" title="ROC curve"
            useWhen="classifier discrimination across thresholds vs. the chance diagonal; report AUC on the chart."
            avoidWhen="heavy class imbalance — the precision–recall curve is the honest one for rare positives.">
            <ResponsiveContainer>
              <ComposedChart data={D2.rocData} margin={{ top: 8, right: 12, bottom: 2 }}>
                <CartesianGrid stroke={T.hairline} />
                <XAxis dataKey="f" type="number" domain={[0, 1]} tick={axisStyle} tickLine={false} axisLine={false} label={{ value: "FPR", position: "insideBottomRight", style: axisStyle }} />
                <YAxis type="number" domain={[0, 1]} tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <Line dataKey="diag" name="chance" stroke={GRAY} strokeDasharray="4 3" dot={false} />
                <Line dataKey="tpr" name="TPR (AUC 0.87)" stroke={FAM.stats.hue} strokeWidth={2.4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="calib" family="stats" title="Calibration plot"
            useWhen="'when the model says 70%, does it happen 70% of the time?' — predicted vs. observed frequency against the diagonal."
            avoidWhen="tiny samples per bin — the observed frequencies are noise.">
            <ResponsiveContainer>
              <ComposedChart data={D2.calib} margin={{ top: 8, right: 12, bottom: 2 }}>
                <CartesianGrid stroke={T.hairline} />
                <XAxis dataKey="p" type="number" domain={[0, 1]} tick={axisStyle} tickLine={false} axisLine={false} label={{ value: "predicted", position: "insideBottomRight", style: axisStyle }} />
                <YAxis type="number" domain={[0, 1]} tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <Line dataKey="diag" name="perfect" stroke={GRAY} strokeDasharray="4 3" dot={false} />
                <Line dataKey="obs" name="observed" stroke={FAM.stats.hue} strokeWidth={2.2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="confusion" family="stats" title="Confusion matrix"
            useWhen="classification outcomes as a normalized grid — diagonal is health, off-diagonal cells name the specific confusions."
            avoidWhen="many classes with sparse errors — a sorted table of top confusions reads better.">
            <ConfusionMatrixGrid />
          </C>

          <C id="shap" family="stats" title="SHAP beeswarm"
            useWhen="global feature importance with direction: one row per feature, x = contribution, color = feature value. The current standard for 'what drives the model.'"
            avoidWhen="the audience needs one prediction explained — use a per-observation waterfall of SHAP values.">
            <SHAPBeeswarmSVG />
          </C>

          <C id="spc" family="stats" title="Control chart (SPC)"
            useWhen="'is this metric abnormal?' — series + center line + ±3σ control limits, violations flagged. The correct ops-dashboard alarm chart."
            avoidWhen="the process mean is drifting by design (growth metrics) — control limits assume stationarity.">
            <ResponsiveContainer>
              <ComposedChart data={D2.spc} margin={{ top: 8, right: 12 }}>
                <XAxis dataKey="i" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis domain={[40, 62]} tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={56} stroke={NEG} strokeDasharray="4 3" />
                <ReferenceLine y={50} stroke={T.inkSoft} />
                <ReferenceLine y={44} stroke={NEG} strokeDasharray="4 3" />
                <Line dataKey="v" name="metric" stroke={FAM.stats.hue} strokeWidth={1.6} dot={<SPCDot />} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="cusum" family="stats" title="CUSUM chart"
            useWhen="detecting small persistent shifts faster than ±3σ limits — cumulative deviation from target against decision bounds."
            avoidWhen="only large sudden breaks matter — the plain control chart is easier to explain.">
            <ResponsiveContainer>
              <ComposedChart data={D2.cusum} margin={{ top: 8, right: 12 }}>
                <XAxis dataKey="i" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={8} stroke={NEG} strokeDasharray="4 3" />
                <ReferenceLine y={-8} stroke={NEG} strokeDasharray="4 3" />
                <ReferenceLine y={0} stroke={T.inkSoft} />
                <Line dataKey="cp" name="CUSUM+" stroke={FAM.stats.hue} strokeWidth={2} dot={false} />
                <Line dataKey="cn" name="CUSUM−" stroke={GRAY} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="resid" family="stats" title="Residual plot"
            useWhen="residuals vs. fitted — the assumption check: fan shapes mean heteroscedasticity, curves mean missed nonlinearity."
            avoidWhen="you haven't fitted anything yet.">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 8, right: 12, bottom: 2 }}>
                <CartesianGrid stroke={T.hairline} />
                <XAxis dataKey="f" type="number" name="fitted" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis dataKey="r" type="number" name="residual" domain={[-16, 16]} tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3" }} />
                <ReferenceLine y={0} stroke={T.ink} />
                <Scatter data={D2.resid} fill={`${FAM.stats.hue}77`} />
              </ScatterChart>
            </ResponsiveContainer>
          </C>
        </>)}

        {/* ============ FINANCE & QUANT ============ */}
        {tab === "finance" && (<>
          <C id="candle" family="finance" title="Candlestick"
            useWhen="price series where intra-period range and open/close direction matter; volume bars beneath on a shared axis."
            avoidWhen="only the close matters — a line is calmer and honest.">
            <CandlestickSVG />
          </C>

          <C id="equity" family="finance" title="Equity curve + drawdown" tall
            useWhen="strategy performance and its pain, together: cumulative value on top, % below running peak underneath. Never show one without the other."
            avoidWhen="short windows where compounding hasn't differentiated anything.">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 3 }}>
                <ResponsiveContainer>
                  <LineChart data={D2.equity} margin={{ top: 6, right: 12 }} syncId="eq">
                    <XAxis dataKey="t" hide />
                    <YAxis domain={["auto", "auto"]} tick={axisStyle} tickLine={false} axisLine={false} width={34} />
                    <Tooltip content={<Tip />} />
                    <Line dataKey="eq" name="equity" stroke={FAM.finance.hue} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 2 }}>
                <ResponsiveContainer>
                  <AreaChart data={D2.equity} margin={{ top: 2, right: 12 }} syncId="eq">
                    <XAxis dataKey="t" tick={axisStyle} tickLine={false} axisLine={false} />
                    <YAxis domain={["auto", 0]} tick={axisStyle} tickLine={false} axisLine={false} width={34} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<Tip />} />
                    <Area dataKey="dd" name="drawdown %" stroke={NEG} fill={`${NEG}33`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </C>

          <C id="retheat" family="finance" title="Monthly return heatmap"
            useWhen="year × month grid on a diverging scale with annual totals — regimes and seasonality at a glance."
            avoidWhen="precise return lookup — pair it with a table.">
            <MonthlyReturnHeat />
          </C>

          <C id="rollcorr" family="finance" title="Rolling correlation"
            useWhen="relationship stability over time — a line of windowed estimates (state the window) instead of one misleading full-sample number."
            avoidWhen="the window is shorter than the phenomenon — you'll chart noise.">
            <ResponsiveContainer>
              <ComposedChart data={D2.rollcorr} margin={{ top: 8, right: 12 }}>
                <XAxis dataKey="t" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} tick={axisStyle} tickLine={false} axisLine={false} width={34} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={0} stroke={T.inkSoft} />
                <Line dataKey="c" name="60d corr" stroke={FAM.finance.hue} strokeWidth={2.2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="frontier" family="finance" title="Efficient frontier"
            useWhen="risk vs. return of assets/portfolios with the frontier curve; mark tangency and the current portfolio."
            avoidWhen="inputs are point estimates presented as certainty — the frontier is famously estimation-fragile; say so.">
            <ResponsiveContainer>
              <ComposedChart margin={{ top: 8, right: 12, bottom: 2 }}>
                <CartesianGrid stroke={T.hairline} />
                <XAxis dataKey="risk" type="number" name="risk σ%" domain={[3, 24]} tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis dataKey="ret" type="number" name="return %" domain={[0, 14]} tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3" }} />
                <Line data={D2.frontier} dataKey="fret" name="frontier" stroke={T.ink} strokeWidth={1.8} dot={false} />
                <Scatter data={D2.assets} fill={`${FAM.finance.hue}99`} stroke={FAM.finance.hue} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="yield" family="finance" title="Yield curve / term structure"
            useWhen="rate vs. maturity with reference dates overlaid — inversions and shifts are the story."
            avoidWhen="tracking one tenor through time — that's a plain line chart.">
            <ResponsiveContainer>
              <LineChart data={D2.yields} margin={{ top: 8, right: 14 }}>
                <CartesianGrid vertical={false} stroke={T.hairline} />
                <XAxis dataKey="m" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 6]} tick={axisStyle} tickLine={false} axisLine={false} width={28} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<Tip />} />
                <Line dataKey="yearAgo" name="1Y ago" stroke={GRAY} strokeWidth={1.8} dot={{ r: 2.4 }} />
                <Line dataKey="today" name="today (inverted front)" stroke={FAM.finance.hue} strokeWidth={2.4} dot={{ r: 2.6 }} />
              </LineChart>
            </ResponsiveContainer>
          </C>

          <C id="spreadchart" family="finance" title="Spread chart"
            useWhen="pairs / relative value: plot the difference or ratio directly, with entry/exit bands — never two lines on dual axes."
            avoidWhen="the legs aren't cointegrated — a mean-reversion frame on a drifting spread is a thesis, not a chart.">
            <ResponsiveContainer>
              <ComposedChart data={D2.spread} margin={{ top: 8, right: 12 }}>
                <XAxis dataKey="t" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis domain={[-4, 4]} tick={axisStyle} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={2} stroke={NEG} strokeDasharray="4 3" />
                <ReferenceLine y={0} stroke={T.inkSoft} />
                <ReferenceLine y={-2} stroke={POS} strokeDasharray="4 3" />
                <Line dataKey="s" name="spread z" stroke={FAM.finance.hue} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </C>

          <C id="depth" family="finance" title="Order-book depth"
            useWhen="cumulative bid/ask volume around mid-price — imbalance is visible as asymmetry between the two walls."
            avoidWhen="anything slower than market microstructure — depth is an instant, not a series.">
            <ResponsiveContainer>
              <AreaChart data={D2.depth} margin={{ top: 8, right: 12 }}>
                <XAxis dataKey="p" type="number" domain={[90, 110]} tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={34} />
                <Tooltip content={<Tip />} />
                <ReferenceLine x={100} stroke={T.inkSoft} strokeDasharray="3 3" />
                <Area dataKey="bid" name="bids" type="stepAfter" stroke={POS} fill={`${POS}33`} connectNulls={false} />
                <Area dataKey="ask" name="asks" type="stepAfter" stroke={NEG} fill={`${NEG}33`} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </C>
        </>)}

        {/* ============ PROGRESS & KPI ============ */}
        {tab === "progress" && (<>
          <C id="progressforms" family="progress" title="Progress ring & waffle"
            useWhen="a single completion % where the circular form is idiomatic (goals, storage) — or countable squares for honesty."
            avoidWhen="comparing progress across many items — sorted bars with target ticks (bullet logic) win.">
            <ProgressForms />
          </C>
        </>)}

        {/* compact census entries for the active family */}
        {(SPECS[tab] || []).map((s) => (
          <SpecCard key={s.title} family={tab} title={s.title} useWhen={s.useWhen} avoidWhen={s.avoidWhen} />
        ))}
      </main>

      <footer style={{ borderTop: `1px solid ${T.hairline}`, padding: "16px 18px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontFamily: T.mono, fontSize: 10.5, color: T.inkSoft, lineHeight: 1.7, margin: 0 }}>
          HOUSE RULES — bars start at zero, always · lines may truncate honestly · gray is the default, color is the story ·
          bubbles scale by area · no dual axes · no rainbows · no 3D · titles state the takeaway.
        </p>
      </footer>
    </div>
  );
}
