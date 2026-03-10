# Commands Overview

Chronomage uses Discord slash commands. All commands require the **Manage Events** permission except `/weather`.

## /schedule

Manage recurring event cycles.

- `create` — create a new cycle (opens the wizard)
- `list` — view active cycles and upcoming events
- `pause` — stop a cycle from creating new events
- `cancel` — delete a cycle and its future events
- `edit config` — edit timing and location of a cycle
- `edit blocs` — edit labels, descriptions, and banners via the wizard

## /variables

Configure templates for dynamic placeholders.

- `config date` — date format, time zone, step, cron
- `config count` — start value, step, decimals, cron
- `config weather` — city, cron, compute_at_start
- `switch` — pause or resume one or all template cron jobs
- `channel rename` — auto-rename a channel when a template value changes
- `channel send` — send a message to a channel when a template value changes
- `channel display` — show current channel template configuration

## /settings

Configure guild-wide bot settings.

- `language` — English or Français
- `timezone` — default IANA time zone
- `future_min_blocks` — how many future events to keep buffered
- `autorename_channel` — enable/disable automatic channel renaming

## /weather

Fetch weather for a city (or the default location from the weather template). No permission required.

---

See the [Commands Reference](../commands/README.md) for detailed options and examples.
