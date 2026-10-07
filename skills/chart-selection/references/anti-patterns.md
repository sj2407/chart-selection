## Part 15 — Anti-Pattern Catalog

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Truncated bar axis | Length lies about ratios | Zero baseline or dot plot |
| Pie > 5 slices / similar slices | Angles unrankable | Sorted bar |
| Multiple pies for comparison | Cross-pie angle comparison hopeless | Stacked/grouped bar |
| Dual y-axes | Axis choice manufactures correlation | Index=100, small multiples, spread chart |
| 3D anything | Perspective distorts every encoding | 2D |
| Rainbow colormap | Non-perceptual, false boundaries | Viridis / single hue |
| Radius-scaled bubbles | Quadratic exaggeration | Area scaling |
| Spaghetti (>5 lines) | Nothing readable | Small multiples, gray+accent, horizon chart |
| Choropleth of counts | Area ≠ importance | Rates, or symbol map |
| Smoothed splines | Invents data between points | Straight segments |
| Gauges | Pixels without context | Bullet chart |
| 10-entry legends | Lookup fatigue | Direct labels |
| Box plot on bimodal data | Hides the humps | Violin, raincloud, beeswarm |
| Unstated log axis | Reader assumes linear | Label it |
| Venn with 4+ sets | Geometrically unreadable | UpSet plot |
| Word clouds for analysis | Length ≈ decoration, not value | Sorted bar of frequencies |
| Radial bars for comparison | Outer bars get more pixels/unit | Straight bars |
| Chernoff faces | Novelty over decoding | Any table or glyph grid |
| Unlabeled error bars | SE? CI? SD? Unknowable | State the interval |
| Stacked area, volatile bottom | Upper layers inherit wiggle | Stable base or small multiples |
| Icon fractions in pictograms | False precision | Round or switch form |
| Animation as decoration | Motion without added meaning | HOPs or small multiples only when motion *is* the message |
