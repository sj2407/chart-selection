## Part 4 — Distribution

### 4.1 Histogram
- **Use when:** shape of one distribution — skew, modality, outliers. Bin width is analysis, not cosmetics: try several.
- **Styling:** no gaps between bars; count axis starts at zero.

### 4.2 Frequency polygon
- **Use when:** histogram outline as a line — lets 2–3 distributions overlay where solid bars would occlude.

### 4.3 Density (KDE)
- **Use when:** 2–4 smooth overlaid distributions.
- **Avoid when:** small n (smoothing invents shape); counts needed.

### 4.4 Box plot
- **Use when:** distribution summaries across many groups (5–30): median, IQR, whiskers, outliers.
- **Avoid when:** possible multimodality — a box hides two humps completely; lay audiences.

### 4.5 Violin
- **Use when:** box use-case + shape matters (bimodality visible).
- **Avoid when:** small n; unfamiliar audiences.

### 4.6 Raincloud
- **Use when:** the honest maximum: half-violin (shape) + box (summary) + jittered points (data), one chart. Best default for scientific group comparison.

### 4.7 Strip / jitter
- **Use when:** small n per group — show the actual observations.

### 4.8 Beeswarm
- **Use when:** strip plot with collision-avoided dodging — up to a few hundred points per group, every observation visible and unoccluded.

### 4.9 Sina plot
- **Use when:** beeswarm whose jitter width follows the density envelope — violin + points hybrid, larger n than beeswarm.

### 4.10 Ridgeline (joyplot)
- **Use when:** one distribution across many *ordered* groups (by month, by week) — reads as terrain.
- **Avoid when:** unordered groups; precise cross-ridge comparison.

### 4.11 ECDF
- **Use when:** "what fraction is below X?" — latency percentiles, SLAs; comparing many distributions with zero smoothing choices. Technical audiences.

### 4.12 Dot histogram (Wilkinson)
- **Use when:** small-n histogram where each dot = one observation — countable, honest, great for teaching and small samples.

### 4.13 Population pyramid
- **Use when:** a distribution split by a binary group, mirrored (age × sex; tenure × segment). Two back-to-back histograms.

### 4.14 Q–Q plot
- **Use when:** comparing a sample against a theoretical distribution (or two samples): points on the diagonal = same distribution. The normality check.

### 4.15 Pareto chart
- **Use when:** "which few causes drive most of the effect": sorted bars + cumulative % line, with the 80% line marked. Defects, complaints, revenue by SKU.

### 4.16 Lorenz curve
- **Use when:** concentration/inequality: cumulative share of population vs. cumulative share of value; distance from the diagonal = Gini. Wallet-share, wealth, portfolio concentration.
