## Part 5 — Relationship & Correlation

### 5.1 Scatter
- **Use when:** two continuous variables — correlation, clusters, outliers, regimes.
- **Styling:** 50–80% opacity; annotate outliers by name (they're usually the story); same-unit axes get equal scales + the y=x line.

### 5.2 Scatter + fitted line
- **Use when:** asserting a relationship's direction/strength — state the model (OLS? loess?) and show the confidence band.

### 5.3 Hexbin / 2D histogram
- **Use when:** thousands–millions of points; color = count per cell.

### 5.4 2D density / contour
- **Use when:** smooth density fields; overlaying two populations' contours.

### 5.5 Bubble
- **Use when:** scatter + a third magnitude where approximate size suffices.
- **Styling:** scale by **area, never radius**; 2–3 reference bubbles in the legend; outline bubbles; label only notable ones. No negative values.

### 5.6 SPLOM (scatterplot matrix)
- **Use when:** exploratory screening among 3–7 variables. Analyst tool, not dashboard element.

### 5.7 Correlation heatmap
- **Use when:** pairwise correlations, many variables — block gestalt after hierarchical ordering.
- **Styling:** diverging colormap centered at zero; lower triangle; print values ≤ ~12×12.

### 5.8 Matrix heatmap (general)
- **Use when:** a value over two categorical dimensions (hour × weekday; cohort retention).
- **Styling:** sequential ramp; **never rainbow**; meaningful row/column order.

### 5.9 Ternary plot
- **Use when:** compositions of exactly three parts summing to 100% (soil, asset mix equity/bond/cash, RGB) — every mix is one point in a triangle.

### 5.10 Embedding scatter (t-SNE / UMAP / PCA)
- **Use when:** projecting high-dimensional data to 2D for cluster structure. Caveat on the chart: distances are not metric; axes are meaningless — say so.

### 5.11 Clustermap (dendrogram + heatmap)
- **Use when:** a matrix heatmap with hierarchical-clustering trees on both margins — genomics idiom, works for any feature × entity matrix.

### 5.12 Slopegraph as paired relationship
- **Use when:** two measures per entity treated as "before/after" columns — reveals rank correlation visually.
