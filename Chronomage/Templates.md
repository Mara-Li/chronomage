# Templates & Placeholders

Templates control how placeholders are resolved in event names and descriptions.

## Event placeholders

Use these in event labels and descriptions created via `/schedule create` (or `/schedule edit blocs`).

| Placeholder | Template | Description |
|---|---|---|
| `{{date}}` | Date | Current date value formatted by the date template |
| `{{count}}` | Count | Current numeric counter value |
| `{{weather:emoji}}` | Weather | Weather icon only (e.g., `☀️`, `🌧️`) |
| `{{weather:short}}` | Weather | Short weather description (e.g., `Sunny, 25°C`) |
| `{{weather:long}}` | Weather | Full weather description |

## Channel placeholders

Channel rename and send-message templates use `««double guillemets»»` delimiters instead of `{{}}`.

| Placeholder         | Description               |
| ------------------- | ------------------------- |
| `««date§`           | Current date value        |
| `««count»»`         | Current count value       |
| `««weather-emoji»»` | Weather icon              |
| `««weather-short»»` | Short weather description |
| `««weather-long»»`  | Full weather description  |

Example channel name template: `Session ««count»» — ««date»»`

## compute_at_start

Each template has a `compute_at_start` option.

- **`false` (default)**: the placeholder is resolved when the event is created in the buffer. The stored value is a snapshot taken at creation time.
- **`true`**: the placeholder remains literal (e.g., `{{weather:long}}`) in the event until the event becomes Active. At that moment the bot fetches the current value and updates the event.

Use `compute_at_start:true` for weather (to get conditions at event time) and for any value that should reflect the moment the event starts rather than when it was scheduled.

> [!TIP]
> With `compute_at_start:true`, you can also create Discord events manually and include placeholders — they will be resolved when the event starts.

## Configuring templates

Use the `/variables config` command group to configure each template:

- [`/variables config date`](commands/variables.md#config-date) — date format, time zone, step, cron, start value
- [`/variables config count`](commands/variables.md#config-count) — start number, step, decimal places, cron
- [`/variables config weather`](commands/variables.md#config-weather) — city, cron, compute_at_start

Run the subcommand with no options to display current settings.
