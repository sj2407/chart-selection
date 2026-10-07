## Part 14 — Cross-Cutting Styling Principles

### Color
- One job per palette: **categorical** (distinct hues, ≤5–7), **sequential** (one hue light→dark for ordered magnitude), **diverging** (two hues through neutral, only with a meaningful midpoint).
- Gray is the most important color: everything that isn't the story is gray; the story gets the accent.
- Same entity = same color everywhere in a dashboard.
- Colorblind-safe (never red–green as the only differentiator; Okabe–Ito, viridis-family are safe). Never rainbow for quantities.

### Axes & scales
- Bar-family: zero baseline, always. Line/scatter: honest range, zero optional.
- Log scales for multiplicative phenomena; real-value tick labels (1, 10, 100) and an explicit "log scale" note.
- Dual y-axes: essentially never — index to 100, small multiples, or connected scatter instead.

### Labels & annotation
- Direct labels beat legends.
- **Titles state the takeaway** ("EU drove Q3 recovery"), not the topic ("Q3 sales by region") — the highest-leverage styling decision.
- Annotate the anomaly: if there's a spike, answer "why" on the chart.
- Round to decision-relevant precision (2–3 significant figures).

### Data-ink
- Remove chart borders, redundant axis lines, backgrounds, 3D, heavy gridlines. Whisper-light gridlines, or none when values are direct-labeled.

### Dashboard composition (future module)
- KPI tiles first (top-left), aggregated → detailed reading order, consistent time windows and scales across siblings, five question-answering charts over fifteen data-displaying ones.
