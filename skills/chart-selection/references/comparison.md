## Part 2 — Comparison, Ranking & Magnitude

### 2.1 Vertical bar (column)
- **Use when:** magnitudes across ≤ ~12 categories; natural order exists (months) or sort by value.
- **Avoid when:** long labels (go horizontal); >15 categories (dot plot/table); near-identical values (dot plot with honest non-zero axis, or show deviations).
- **Styling:** zero baseline, always. One color; accent only the story bar. Direct-label values when ≤10 bars and drop gridlines.

### 2.2 Horizontal bar
- **Use when:** long labels; rankings (top-N); many categories (vertical scroll is natural).
- **Avoid when:** x is time — time flows left→right.

### 2.3 Grouped bar
- **Use when:** 2–4 sub-categories within each category (this year vs. last).
- **Avoid when:** >4 per group; the total is the story (stack instead); trend across many periods (lines).

### 2.4 Lollipop
- **Use when:** bar use-case with 10–30 categories — thin stem + dot lowers ink so more rows stay readable.
- **Avoid when:** few categories (plain bars read faster).

### 2.5 Dot plot (Cleveland)
- **Use when:** 15–40 categories; values that shouldn't start at zero (position, not length, so a truncated axis is honest here — the key advantage over bars).
- **Variations:** multi-dot per row (2–3 series compared per category).

### 2.6 Dumbbell (connected dot)
- **Use when:** the *change* between exactly two states per category — before/after, cohort A vs. B.
- **Avoid when:** >2 states (line or slope) or levels matter more than gaps.

### 2.7 Range plot
- **Use when:** min–max or p10–p90 interval per category (salary bands, temperature ranges) — the interval is the message.

### 2.8 Bar-in-bar
- **Use when:** actual vs. target per category, compactly (thin dark bar inside wide light bar). Cousin of the bullet chart.

### 2.9 Slope chart
- **Use when:** two time points; who rose, fell, crossed. Best "before/after across entities" chart.
- **Avoid when:** >15 entities or >3 time points.
- **Styling:** direct labels both ends; gray crowd + accent story.

### 2.10 Bump chart
- **Use when:** rank order over time (league tables, market-share position).
- **Avoid when:** magnitudes matter — ranks hide how close #1 and #2 are.

### 2.11 Area bump (ranked stream)
- **Use when:** bump chart + magnitude: ribbons ordered by rank whose thickness encodes value. Editorial; needs interactivity beyond ~6 series.

### 2.12 Radial bar
- **Use when:** aesthetic/editorial contexts, cyclical categories arranged on a circle.
- **Avoid when:** honest comparison matters — outer bars get more pixels per unit; a straight bar is always more accurate. Treat as decoration-with-cost.

### 2.13 Polar area / rose (Nightingale, coxcomb)
- **Use when:** cyclical data (wind rose by compass direction, seasonal counts) where the cycle is the point.
- **Avoid when:** non-cyclical categories — area distortion without the circular payoff.

### 2.14 Radar / spider
- **Use when:** 1–3 entities across 5–8 dimensions where shape gestalt is the message (skill fingerprints).
- **Avoid when:** >3 entities; mixed units; any precision. Grouped bars or parallel coordinates usually win.

### 2.15 Parallel coordinates
- **Use when:** multivariate profiles, 4–10 dimensions, cluster signatures — best interactive (brushing).
- **Avoid when:** static with many rows (hairball). Axis order changes the story: order deliberately.

### 2.16 Pictogram / ISOTYPE
- **Use when:** counts of people/things for general audiences ("1 icon = 10 patients") — memorable, humanizing.
- **Avoid when:** fractional icons imply false precision; large numbers.

### 2.17 Graphical table
- **Use when:** exact lookup + many measures per entity: numbers + embedded bars + sparklines. The densest honest dashboard element.
- **Styling:** right-align numbers, uniform decimals; row whitespace over grid lines.

### 2.18 Heat-mapped table
- **Use when:** a table whose cells need at-a-glance magnitude scanning (conditional background color).
