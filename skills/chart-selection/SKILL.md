---
name: chart-selection
description: Select the right chart type for any data visualization, dashboard, or report by starting from the communicative intent ("what am I trying to convey?") rather than defaulting to familiar chart types. Use this skill whenever the user wants to visualize data, build or review a dashboard, chart metrics, pick between chart types, style a chart, or asks "how should I show X" — even if they never say the word "chart." Also use it when building any artifact that contains charts (React/Recharts, D3, Plotly, matplotlib, Excel), when reviewing an existing visualization for problems, and for specialist domains — statistical/ML diagnostics (ROC, calibration, SHAP, survival), finance/quant (drawdowns, spreads, term structure), uncertainty communication, and KPI/progress displays.
---

# Chart Selection

A census of ~135 chart types across 12 families, organized by **communicative intent**. The core discipline: never start from the data or from a default chart — start from the message, then let the message pick the form.

## Workflow

1. **Identify the primary message.** What should the reader take away in three seconds? Phrase it as a sentence ("EU drove the Q3 recovery," "we went from A to B through these factors").
2. **Map the message to a family** using the intent table below.
3. **Read that family's reference file** (`references/<family>.md`) for the specific chart, its use-when/avoid-when boundaries, variations, and styling rules. Read more than one file if the message spans families.
4. **Apply the cross-cutting rules** in `references/styling.md` and check the result against `references/anti-patterns.md` before finalizing. These two files apply to every chart, every time.
5. For dashboards with multiple charts, repeat per chart, then enforce consistency: same entity = same color everywhere, consistent time windows and scales across sibling charts, KPI tiles first, aggregated → detailed reading order.

## The intent table (message → family → file)

| The question being answered | Family | Reference file |
|---|---|---|
| Which is bigger? In what order? | Comparison, ranking & magnitude | `references/comparison.md` |
| How has this evolved over time? | Change over time | `references/change-over-time.md` |
| How are values spread? Outliers? Shape? | Distribution | `references/distribution.md` |
| Do X and Y move together? Clusters? | Relationship | `references/relationship.md` |
| What composes the total? Hierarchy? | Part-to-whole & hierarchy | `references/part-to-whole.md` |
| How do quantities move between states? | Flow & networks | `references/flow-networks.md` |
| How far from a reference/target/zero? | Deviation | `references/deviation.md` |
| Where, geographically? | Spatial | `references/spatial.md` |
| How sure are we? | Uncertainty | `references/uncertainty.md` |
| Is the model/effect/process sound? | Statistical & ML diagnostics | `references/stats-ml.md` |
| Price, risk, performance? | Finance & quant | `references/finance-quant.md` |
| Are we on track vs. a goal? | Progress & KPI | `references/progress-kpi.md` |

Always also read: `references/styling.md` (color, axes, labels, data-ink) and `references/anti-patterns.md` (22 named failure modes and their fixes).

## Master census (what lives in each file)

- **comparison.md (18):** vertical bar · horizontal bar · grouped bar · lollipop · dot plot · dumbbell · range plot · bar-in-bar · slope · bump · area bump · radial bar · polar rose · radar · parallel coordinates · pictogram · graphical table · heat-mapped table
- **change-over-time.md (21):** line · step line · index line (=100) · area · stacked area · streamgraph · small multiples · sparkline · candlestick · OHLC · calendar heatmap · barcode stripes · horizon chart · cycle plot · seasonal subseries · spiral · connected scatter · Gantt · Priestley timeline · fan chart · ribbon chart
- **distribution.md (16):** histogram · frequency polygon · density · box · violin · raincloud · strip/jitter · beeswarm · sina · ridgeline · ECDF · dot histogram · population pyramid · Q–Q · Pareto · Lorenz
- **relationship.md (12):** scatter · scatter+fit · hexbin · 2D density · bubble · SPLOM · correlation heatmap · matrix heatmap · ternary · embedding scatter · slopegraph-as-relationship · clustermap
- **part-to-whole.md (19):** pie · donut · semi-circle donut · nested donut · waffle · pictogram grid · stacked bar · 100% stacked · diverging stacked (Likert) · marimekko · treemap · sunburst · icicle · circle packing · dendrogram · Venn (≤3) · UpSet · waterfall · pyramid
- **flow-networks.md (10):** sankey · alluvial · parallel sets · chord · arc diagram · node-link network · adjacency matrix · funnel · state/journey · flow map
- **deviation.md (6):** diverging bar · diverging lollipop · surplus/deficit fill · anomaly bars · warming stripes · line vs. reference band
- **spatial.md (11):** choropleth · bivariate choropleth · proportional symbol · dot density · tile grid · hex tile · contiguous cartogram · Dorling cartogram · isarithmic surface · flow map · small-multiple maps
- **uncertainty.md (7):** error bars · confidence band · fan chart · gradient/fade · quantile dot plot · HOPs · eye plot
- **stats-ml.md (17):** forest plot · funnel plot · Kaplan–Meier · Bland–Altman · ROC · precision–recall · calibration · lift/gains · confusion matrix · residual plot · scree · biplot · SHAP beeswarm · partial dependence/ICE · control chart (SPC) · CUSUM · elbow
- **finance-quant.md (12):** candlestick · equity curve · drawdown/underwater · monthly return heatmap · rolling correlation/beta · efficient frontier · yield curve · depth chart · volume profile · Renko/Kagi/P&F · spread chart · risk-contribution treemap
- **progress-kpi.md (6):** bullet · KPI tile + sparkline · progress donut · waffle progress · thermometer · gauge (anti-pattern)

## Tie-breakers within a family

- **How many categories?** ≤12 → bars; 15–40 → dot plot/lollipop; hundreds → treemap, table, or aggregation.
- **How many series?** ≤5 → overlay; more → small multiples; dozens → horizon chart.
- **How many points?** Hundreds → scatter with opacity; tens of thousands → hexbin/density.
- **Audience:** scanning a dashboard → gestalt forms, direct labels, KPI tiles; studying a report → denser forms (ECDF, SPLOM, horizon) are allowed.
- **Precision vs. gestalt:** exact lookup → table (possibly graphical); shape of the story → chart.
- **Two things tempting a dual axis?** Never dual axes: index both to 100, use small multiples, plot the spread/ratio directly, or use a connected scatter.

## The perceptual hierarchy (why the rules exist)

Decoding accuracy, best to worst: position on a common scale → position on non-aligned scales → length → angle/slope → area → volume → color. Consequences: bars beat pies; bubble size is a third-variable-only encoding scaled by **area, never radius**; color encodes category or ordered intensity, never precise quantity; the key variable always gets a positional axis.

## Quick selector

- Which is biggest → **sorted bar**; many categories → **lollipop/dot plot**
- KPI vs. target → **bullet**
- Before/after, many entities → **slope**; per-category gap → **dumbbell**
- A trend → **line**; many trends → **small multiples**; dozens → **horizon**
- Different-level series' growth → **index line (=100)**
- Seasonality vs. trend → **cycle plot**; this year vs. history → **seasonal overlay**
- Composition over time → **stacked area / 100% stacked bars**; membership shifts → **alluvial**
- A to B through factors → **waterfall**
- X–Y relation → **scatter (+fit)**; + magnitude → **bubble**; huge n → **hexbin**
- Three-part mix → **ternary**
- Distribution shape → **histogram**; across groups → **raincloud/box/violin**; ordered groups → **ridgeline**; tiny n → **beeswarm/dot histogram**
- Fraction below threshold → **ECDF**; vital few causes → **Pareto**; concentration → **Lorenz**
- Shares now, ≤5 parts → **donut/waffle**; many parts/hierarchy → **treemap/icicle**
- Set overlaps, 4+ sets → **UpSet**
- Flows between states → **sankey**; drop-off → **labeled funnel bars**; re-entrant transitions → **state diagram**
- Rank over time → **bump**
- Deviation from baseline → **diverging bar**; gap between two series → **surplus/deficit fill**
- Rate by region → **choropleth**; counts → **symbol map**; equal-weight regions → **tile map**
- Forecast → **fan chart**; probability for lay audiences → **quantile dot plot**
- Effects + CIs across groups → **forest plot**; time-to-event/retention → **Kaplan–Meier**
- Classifier quality → **ROC/PR + calibration**; model drivers → **SHAP beeswarm**
- "Is this metric abnormal?" → **control chart**; small persistent drift → **CUSUM**
- Strategy performance → **equity curve + drawdown beneath**; pairs trade → **spread chart with bands**

## Assets

- `assets/chart-atlas.jsx` — a self-contained React/Recharts interactive atlas rendering ~45 specimens with synthetic data, organized by the same 12 families, with an "I want to show…" intent selector. Use it as a visual companion, a styling reference implementation (paper/ink palette, gray-crowd + accent, direct labels, honest axes), or a starting template when building chart galleries. It is stack-agnostic in its guidance even though the renderer is Recharts.

## Non-negotiables (apply to every output)

Bars start at zero, always. Lines may truncate honestly, never for drama. Gray is the default; color is the story. Bubbles scale by area. No dual axes. No rainbow colormaps. No 3D. No gauges (use bullets). Titles state the takeaway, not the topic. Direct labels beat legends. If a chart's message can't be phrased as a sentence, the chart isn't ready.
