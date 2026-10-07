## Part 9 — Spatial

*(Rule zero: if geography isn't part of the message, don't use a map — maps spend most pixels on shape, not data.)*

### 9.1 Choropleth
- **Use when:** a **rate/ratio/density** by region.
- **Avoid when:** raw counts (big areas lie — normalize or use symbols).
- **Styling:** 4–6 binned classes usually beat continuous ramps; state the classing method (quantiles vs. equal intervals changes the story); gray = no data.

### 9.2 Bivariate choropleth
- **Use when:** two rates jointly (income × health) via a 3×3 blended-color legend. Powerful; demands a careful legend and a patient audience.

### 9.3 Proportional symbol
- **Use when:** counts/magnitudes at locations — area-scaled circles. The honest raw-count map.

### 9.4 Dot density
- **Use when:** one dot = N units, placed within regions — density gestalt and mixing (demographics).

### 9.5 Tile grid map / 9.6 Hex tile map
- **Use when:** equal visual weight per unit (US-state tiles, election boards); hex adds rough adjacency. Label the tiles.

### 9.7 Contiguous cartogram
- **Use when:** regions inflated/deflated by a variable while preserving adjacency — powerful distortion-as-message, hard to read precisely.

### 9.8 Dorling cartogram
- **Use when:** regions as non-overlapping circles sized by value at approximate positions — cleaner than contiguous, loses shape entirely.

### 9.9 Isarithmic / heat surface
- **Use when:** continuous fields (temperature, elevation, pollution, signal strength) — contours or smooth rasters.

### 9.10 Flow map — see §7.10.

### 9.11 Small-multiple maps
- **Use when:** the same map over time/scenarios — change reads as animation-in-space.
