# Using Templates and Placeholders
Templates allow you to embed dynamic content in event titles and descriptions.

See [Templates](../commands/Templates.md) for the full placeholder reference.

## Date template
> [!note]
> - <u>View Current settings :</u> `/variables config date`
> - <u>Configuration :</u> `/variables config date [format] [timezone] [step]`

[SCREENSHOT]

Use `{{date}}` in event labels or descriptions.

The bot replies with a confirmation and an example of how `{{date}}` will render.

Common format tokens (Luxon):

| Token | Output |
|-------|--------|
| `f` | 10/25/2025, 9:00 PM |
| `FF` | Saturday, October 25, 2025, 9:00 PM EDT |
| `yyyy-LL-dd` | 2025-10-25 |
| `yyyy-LL-dd HH:mm` | 2025-10-25 21:00 |

[Full Luxon reference](https://moment.github.io/luxon/#/formatting)

## Count template
[SCREENSHOT]

> [!note]
> - <u>View configuration :</u> `/variables config count`
> - <u>Configuration :</u>`/variables config count [start_number] [step] [decimal] [cron]`

Use `{{count}}` in event labels or descriptions.

The counter advances on each cron tick. A negative `step` counts down.

## Weather template
[SCREENSHOT]

> [!note]
> - <u>View configuration:</u> `/variables config weather`
> - <u>Usage:</u> `/variables config weather [location] [compute_at_start]`

Three variants:
- `{{weather:emoji}}` — icon only
- `{{weather:short}}` — short description
- `{{weather:long}}` — full description

> [!tip] Test the location: `/weather [location]`

Returns current weather — similar to what `{{weather:long}}` will show. If the location is not found, try adding the country (`London, UK`).

## compute_at_start
When `compute_at_start:true` is set on a template, the placeholder stays literal in the event until the event becomes Active. At that moment the bot resolves it and updates the event.

- Use `true` for weather — fetches current conditions when the event starts
- Use `false` (default) for dates and counters that should reflect creation time

With `compute_at_start:true`, you can also create Discord events manually and include placeholders — they will be resolved when the event starts.

## Pausing and resuming templates
> [!note]
- `/variables switch variables:[date|all|weather|count]`

This pauses or resumes the cron job that advances the template value.
