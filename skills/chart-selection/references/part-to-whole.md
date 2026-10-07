## Part 6 — Part-to-Whole & Hierarchy

### 6.1 Pie / 6.2 Donut
- **Use when:** 2–5 slices, one moment, rough shares (25/50/75% read well). One pie only, never a series.
- **Styling:** largest slice from 12 o'clock, clockwise descending; direct labels; donut hole hosts the total.

### 6.3 Semi-circle donut
- **Use when:** parliament-style seat splits; single share vs. threshold (majority line at center-top).

### 6.4 Nested donut (multi-ring)
- **Use when:** two-level composition compactly. Fragile beyond two rings — sunburst or treemap instead.

### 6.5 Waffle chart
- **Use when:** one or two shares for general audiences — 10×10 grid, "37 of 100 squares." More accurately read than a pie.

### 6.6 Pictogram grid
- **Use when:** waffle with icons — "1 in 5 people" storytelling.

### 6.7 Stacked bar / 6.8 100% stacked bar
- **Use when:** composition **across groups** — the correct answer whenever multiple pies tempt you. Absolute when totals matter; 100% when only shares do.
- **Styling:** ≤ 4–5 segments; key segment on the baseline; consistent order/colors.

### 6.9 Diverging stacked bar (Likert)
- **Use when:** survey scales — center the neutral category on zero; agreement grows right, disagreement left.

### 6.10 Marimekko / mosaic
- **Use when:** two-dimensional part-to-whole: column width = segment size, height = share within. Expert audiences; ≤ ~6×6.

### 6.11 Treemap
- **Use when:** many components (20–200) and/or hierarchy; instant "what dominates."
- **Styling:** color as second variable (size = weight, color = return); squarified; label only legible cells.

### 6.12 Sunburst
- **Use when:** radial hierarchy ≤ 3 levels where ring-level shares matter; otherwise treemap.

### 6.13 Icicle
- **Use when:** rectangular hierarchy read top-down or left-right; better than sunburst for deep trees and for labeling. (The flame graph — §10 adjacent — is an icicle of stack traces.)

### 6.14 Circle packing
- **Use when:** hierarchy as nested circles — beautiful gestalt, poor area accuracy (packing wastes space). Editorial.

### 6.15 Dendrogram
- **Use when:** hierarchical *structure* itself (clustering results, taxonomies) — heights encode merge distance.

### 6.16 Venn / Euler (≤3 sets)
- **Use when:** membership overlap among 2–3 sets, schematic or area-proportional.
- **Avoid when:** ≥4 sets — geometrically impossible to read. Use UpSet.

### 6.17 UpSet plot
- **Use when:** set intersections beyond Venn's limit: a matrix of dots marks each intersection, bars encode its size. The modern standard for 4+ sets.

### 6.18 Waterfall
- **Use when:** bridging start → end through sequential signed contributions: P&L walk, budget variance, period-over-period attribution. "We started at A, these factors added/subtracted, we ended at B."
- **Avoid when:** non-additive factors; no meaningful sequence; >10 steps (bucket into "other").
- **Styling:** dark neutral anchors (start/end/subtotals) planted on the axis; one hue up, another down; connector lines between steps; label every delta; subtotals re-anchor the eye.

### 6.19 Pyramid chart
- **Use when:** honestly, almost never analytically — schematic strata (org levels, Maslow). Use labeled bars when values matter.
