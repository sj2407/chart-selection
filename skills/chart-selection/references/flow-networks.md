## Part 7 — Flow & Networks

### 7.1 Sankey
- **Use when:** conserved quantities flowing between states across 2–4 stages; link width = volume.
- **Avoid when:** loops; dozens of nodes; precision.

### 7.2 Alluvial
- **Use when:** how *categorical membership* shifts across time/stages (customers moving between plans quarter to quarter). A Sankey whose stages are repeated categorizations.

### 7.3 Parallel sets
- **Use when:** flows across several categorical dimensions (class × sex × survival) — alluvial generalized to attributes.

### 7.4 Chord diagram
- **Use when:** many-to-many flows within one entity set (trade, migration). Editorial; the flow-matrix heatmap is the sober twin.

### 7.5 Arc diagram
- **Use when:** network on a line with arcs — sequence + connection (repeated motifs, co-occurrence along a text/genome).

### 7.6 Node-link network
- **Use when:** relationship *structure*: clusters, hubs, brokers.
- **Avoid when:** >~100 visible nodes without interaction; when an adjacency matrix answers it.

### 7.7 Adjacency matrix
- **Use when:** dense networks — grid cells mark/weight edges; ordering reveals blocks. Scales where node-link hairballs.

### 7.8 Funnel
- **Use when:** strict sequential drop-off. Labeled bars + between-stage conversion % beat the trapezoid — the rate is the insight, not the shape.
- **Avoid when:** stages skip or re-enter (Sankey).

### 7.9 State / journey diagram
- **Use when:** transitions with probabilities/volumes between non-linear states (subscription states, user journeys) — a directed graph with weighted edges.

### 7.10 Flow map
- **Use when:** movement between places — arcs/arrows, width = volume. (Also §9.)
