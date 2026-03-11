# Using Templates and Placeholders
Templates allow you to embed dynamic content in event titles and descriptions.

See [Templates](../Templates.md) for the full placeholder reference.

## Date template
> [!note] Usage
> - <u>View Current settings :</u> `/variables config date`
> - <u>Configuration :</u> `/variables config date format:yyyy-LL-dd timezone:Europe/Paris step:1d`

[SCREENSHOT]

View current settings (no options needed):

```
/variables config date
```

Configure:

```
/variables config date format:yyyy-LL-dd timezone:Europe/Paris step:1d
```

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

View current settings:

```
/variables config count
```

Configure:

```
/variables config count start_number:1 step:1 decimal:0 cron:0 0 * * *
```

Use `{{count}}` in event labels or descriptions.

The counter advances on each cron tick. A negative `step` counts down.

## Weather template
[SCREENSHOT]

View current settings:

```
/variables config weather
```

Configure:

```
/variables config weather location:London compute_at_start:true
```

Three variants:
- `{{weather:emoji}}` — icon only
- `{{weather:short}}` — short description
- `{{weather:long}}` — full description

Test the location:

```
/weather location:London
```

Returns current weather — similar to what `{{weather:long}}` will show. If the location is not found, try adding the country (`London, UK`).

## compute_at_start
When `compute_at_start:true` is set on a template, the placeholder stays literal in the event until the event becomes Active. At that moment the bot resolves it and updates the event.

- Use `true` for weather — fetches current conditions when the event starts
- Use `false` (default) for dates and counters that should reflect creation time

With `compute_at_start:true`, you can also create Discord events manually and include placeholders — they will be resolved when the event starts.

## Pausing and resuming templates
```
/variables switch variables:date
/variables switch variables:all
```

This pauses or resumes the cron job that advances the template value.
