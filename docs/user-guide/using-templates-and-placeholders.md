# Using Templates and Placeholders

Templates allow you to embed dynamic content in event titles and descriptions.

See [Templates](../Templates.md) for the full placeholder reference.

## Date template

Configure with:
```
/variables config date format:yyyy-LL-dd timezone:Europe/Paris step:1d
```

Use `{{date}}` in event labels or descriptions.

Common format tokens (Luxon):

| Token | Output |
|-------|--------|
| `f` | 10/25/2025, 9:00 PM |
| `FF` | Saturday, October 25, 2025, 9:00 PM EDT |
| `yyyy-LL-dd` | 2025-10-25 |
| `yyyy-LL-dd HH:mm` | 2025-10-25 21:00 |

[Full Luxon reference](https://moment.github.io/luxon/#/formatting)

## Count template

Configure with:
```
/variables config count start_number:1 step:1 decimal:0 cron:0 0 * * *
```

Use `{{count}}` in event labels or descriptions.

The counter advances on each cron tick. A negative `step` counts down.

## Weather template

Configure with:
```
/variables config weather location:London compute_at_start:true
```

Three variants:
- `{{weather:emoji}}` — icon only
- `{{weather:short}}` — short description
- `{{weather:long}}` — full description

## compute_at_start

When `compute_at_start:true` is set on a template, the placeholder stays literal in the event until the event becomes Active. This is recommended for weather so the data is current when the event starts.

## Viewing current settings

Run the subcommand with no options:
```
/variables config date
/variables config count
/variables config weather
```

## Pausing and resuming templates

```
/variables switch variables:date
/variables switch variables:all
```
