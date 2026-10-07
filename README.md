# Chart Selection

A Claude skill that picks a chart by starting from the question, not the data. Before any chart is drawn, it asks what the reader should take away, maps that message to one of 12 chart families, and picks the chart from that family's reference: when to use it, when not to, and how to style it.

It covers about 135 chart types, from bar and line charts to ridgelines, waterfalls, bump charts, forest plots and drawdown charts, plus 22 named anti-patterns (pie charts with too many slices, dual axes, rainbow colour scales and so on) with their fixes.

## How it decides

1. **The message.** One sentence the reader should take away in three seconds.
2. **The family.** Which kind of question it is: comparison, change over time, distribution, relationship, part-to-whole, flow, deviation, spatial, uncertainty, statistical diagnostics, finance, or progress against a target.
3. **The chart.** The family's reference file names the chart, its limits and its styling rules; `styling.md` and `anti-patterns.md` apply to every chart.

## What is inside

| Path | What it holds |
|---|---|
| `skills/chart-selection/SKILL.md` | The workflow, the intent table, tie-breakers and a quick selector |
| `skills/chart-selection/references/` | One file per family, plus styling and anti-patterns |
| `skills/chart-selection/assets/chart-atlas.jsx` | An interactive React gallery of about 45 example charts (synthetic data) |

## Install

**Claude Code**, in your terminal:

```bash
claude plugin marketplace add sj2407/chart-selection
claude plugin install chart-selection@soumaya-chart-selection
```

Or copy the `skills/chart-selection` folder into `~/.claude/skills/`.

**Claude apps (claude.ai, desktop, mobile):** zip the `skills/chart-selection` folder and upload it as a skill in Claude's settings.

Then ask for any chart, dashboard or "how should I show this?" and the skill loads on its own.

## License

MIT. See [LICENSE](LICENSE).
