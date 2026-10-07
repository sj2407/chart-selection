## Part 11 — Statistical & Model Diagnostics

*(Settled conventions: use the expected chart; deviation from convention costs credibility.)*

### 11.1 Forest plot
- **Use when:** effect sizes + CIs across studies/subgroups/models, stacked with a null line — meta-analysis, regression coefficient summaries, A/B readouts across segments.

### 11.2 Funnel plot (meta-analysis)
- **Use when:** publication-bias check — effect vs. precision; asymmetry = trouble.

### 11.3 Kaplan–Meier survival curve
- **Use when:** time-to-event by group: stepped survival probability, censor ticks, number-at-risk table beneath. Retention curves are KM in disguise.

### 11.4 Bland–Altman
- **Use when:** agreement between two measurement methods: difference vs. mean, bias line, limits of agreement. (Not a correlation question — a scatter would mislead.)

### 11.5 ROC curve / 11.6 Precision–recall curve
- **Use when:** classifier discrimination across thresholds (ROC); PR when classes are imbalanced — PR is the honest one for rare positives.

### 11.7 Calibration plot
- **Use when:** predicted probability vs. observed frequency by bin against the diagonal — "when the model says 70%, does it happen 70% of the time?"

### 11.8 Lift / gains chart
- **Use when:** targeting value of a model for business audiences — "top decile captures 45% of responders."

### 11.9 Confusion matrix
- **Use when:** classification outcomes as a heat-mapped grid; normalize per row (recall view) or column (precision view) and say which.

### 11.10 Residual plot
- **Use when:** residuals vs. fitted — the assumption check: fan shapes (heteroscedasticity), curves (missed nonlinearity), bands (autocorrelation).

### 11.11 Scree plot / 11.17 Elbow plot
- **Use when:** choosing component count (variance explained) or cluster count (inertia) — the bend is the message; mark it.

### 11.12 PCA biplot
- **Use when:** scores + loading vectors overlaid — observations and the variables driving their spread, one chart.

### 11.13 SHAP beeswarm
- **Use when:** global feature importance with direction: one beeswarm row per feature, x = SHAP value, color = feature value. The current standard for "what drives the model."

### 11.14 Partial dependence / ICE plot
- **Use when:** model response as one feature varies — average curve (PD) + per-observation strands (ICE) to expose heterogeneity.

### 11.15 Control chart (SPC)
- **Use when:** process monitoring: series + center line + ±3σ control limits; rule violations flagged. The correct "is this metric abnormal?" chart for ops dashboards.

### 11.16 CUSUM chart
- **Use when:** detecting small persistent shifts faster than Shewhart limits — cumulative deviation from target with decision bounds. (The changepoint-detection view of monitoring.)
