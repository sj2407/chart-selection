## Part 3 — Change Over Time

### 3.1 Line chart
- **Use when:** continuous/regular series; trend, seasonality, turning points; ≤ ~5 series.
- **Styling:** y-axis need not start at zero (position encoding) but never truncate for drama; direct-label at right end; bank slopes near 45°; annotate events with reference lines.

### 3.2 Step line
- **Use when:** values that change discretely and hold (interest rates, price tiers, inventory) — interpolation would lie.

### 3.3 Index line (=100)
- **Use when:** comparing growth of series with very different levels (stock A at $12 vs. B at $900) — rebase all to 100 at t₀. The honest replacement for dual axes.

### 3.4 Area chart
- **Use when:** single series where cumulative volume is the message.
- **Avoid when:** multiple overlapping series; non-zero baseline (area implies quantity from zero).

### 3.5 Stacked area
- **Use when:** total + 3–5 components evolving together; most stable series at the bottom.
- **Avoid when:** middle layers need precise reading (both edges wiggle).

### 3.6 Streamgraph
- **Use when:** many series, long periods, editorial gestalt ("themes rising and fading"). Analytical precision: none.

### 3.7 Small multiples (facets)
- **Use when:** >5 series — the cure for spaghetti. Identical scales, non-negotiable; gray-crowd + focal-line per panel.

### 3.8 Sparkline
- **Use when:** trend-at-a-glance inside tables/KPI tiles; no axes, dot on latest value; consistent window across a view.

### 3.9 Candlestick / 3.10 OHLC
- **Use when:** price series with intra-period range + open/close direction. Candlestick for pattern reading; OHLC bars when body-fill would clutter. Volume bars beneath, shared time axis.

### 3.11 Calendar heatmap
- **Use when:** daily data over months/years; weekday/weekend rhythm, streaks, regime shifts.
- **Avoid when:** exact values matter.

### 3.12 Barcode / stripes
- **Use when:** very long series compressed to one strip of colored bars per period (warming stripes) — a deviation series at maximum compression.

### 3.13 Horizon chart
- **Use when:** *dozens* of time series in minimal vertical space: each series folded into colored bands (darker = larger magnitude, hue = sign). The professional answer to "300 sensors on one screen."
- **Avoid when:** audience is unfamiliar — it needs a 20-second explanation, then it's the densest honest form there is.

### 3.14 Cycle plot
- **Use when:** separating seasonality from trend: one panel per season (all Januaries together, each with its own mini-trend). Answers "is December growing faster than March?" — which a line chart hides.

### 3.15 Seasonal subseries / seasonal overlay
- **Use when:** overlaying each year as its own line over a Jan–Dec x-axis — "is this year abnormal for this point in the season?" (epidemic curves, retail).

### 3.16 Spiral plot
- **Use when:** long periodic series where cycle-on-cycle comparison matters, wound on a spiral (one loop = one period). Editorial; calendar heatmap or cycle plot are the sober alternatives.

### 3.17 Connected scatter
- **Use when:** the joint path of two variables over time (inflation vs. unemployment). Label years along the path, arrow the direction — it needs hand-holding.

### 3.18 Gantt chart
- **Use when:** scheduled activities with start/end/duration and dependencies — projects, machine utilization, on-call rotations.

### 3.19 Priestley timeline
- **Use when:** lifespans/durations of many entities as horizontal bars on a shared time axis (product lifetimes, tenures, dynasties). Gantt without dependencies.

### 3.20 Fan chart
- **Use when:** forecasts: central path + nested quantile bands (50/80/95%), widening with horizon; history visually separated.

### 3.21 Ribbon chart
- **Use when:** stacked bars over time whose segments re-sort by rank each period, with connecting ribbons — composition + rank change together (Power BI idiom). Busy; use when rank swaps *are* the story.
