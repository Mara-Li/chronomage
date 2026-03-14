
Manage placeholder templates used in event names and descriptions.
Requires: **Manage Events** permission.

# Config
Configure a template. Run a subcommand with no options to display current settings; pass one or more options to update the template.

## Date
Configure the `{{date}}` placeholder.


> [!usage]
> `/variables config date (format) (timezone) (cron) (start_date) (step) (compute_at_start)`
> - **`format`** (*optional*): Luxon format token (e.g., `f`, `FF`, `yyyy-LL-dd HH:mm`). See [Luxon format tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)
> - **`timezone`** (*optional*): IANA time zone (e.g., `Europe/Paris`)
> - **`cron`** (*optional*): cron expression controlling when the date value advances
> - **`start_date`** (*optional*): initial date value (must match the configured `format`)
> - **`step`** (*optional*): duration to add on each cron tick (e.g., `1d`, `2h30m`)
> - **`compute_at_start`** (*optional*): if `true`, the placeholder is evaluated when the event starts rather than when it is created

## Count
Configure the `{{count}}` placeholder.

> [!usage]
> `/variables config count (start_number) (step) (decimal) (cron) (compute_at_start)`
> - `start_number` (*optional*): initial numeric value
> - `step` (*optional*): delta per cron tick (positive or negative)
> - `decimal` (*optional*): number of digits after the decimal point
> - `cron` (*optional*): cron expression controlling when the counter advances
> - `compute_at_start` (*optional*): if `true`, the placeholder is evaluated when the event starts

## Weather
Configure the `{{weather:*}}` placeholders.

> [!usage]
> `/variables config weather (location) (compute_at_start) (cron)`
> - `location` (*optional*): city name (e.g., `London`, `Paris, France`)
> - `compute_at_start` (*optional*): if `true`, weather is fetched when the event starts (recommended)
> - `cron` (*optional*): cron expression for automatic weather refresh

Weather variants:
- `{{weather:emoji}}` — weather icon only (e.g., `☀️`, `🌧️`)
- `{{weather:short}}` — short description (e.g., `Sunny, 25°C`)
- `{{weather:long}}` — full description

# Switch
Pause or resume one or all template cron jobs.

> [!usage]
> `/variables switch (variable)`
> - `variables` (*optional*): which template to toggle — `date`, `count`, `weather`, or `all`

# channel
Automatically rename channels or send messages whenever a template value changes.

> [!IMPORTANT]
> Channel templates use `§` delimiters (not `{{}}`).
> Supported channel placeholders: `§date§`, `§count§`, `§weather-emoji§`, `§weather-short§`, `§weather-long§`

## channel rename
Rename a channel according to a template when the template value changes.

> [!usage]
> `/variables channel rename [channel] (text)`
> - **`channel`** (**required**): the channel to rename (any channel type)
> - **`text`** (*optional*): template string to use (leave empty to remove the setting)

> [!warning]
> Maximum 5 channels can be configured for auto-renaming.

## channel send
Send a message to a text channel when a template value changes.

> [!usage]
> `/variables channel send [channel] (text)`
> - **`channel`** (**required**): text channel to send to
> - **`text`** (*optional*): template message to send (leave empty to remove the setting)

> [!IMPORTANT]
> Maximum 5 channels can be configured for auto-messages.

## channel display
Show the current channel template configuration.

> [!usage]
> `/variables channel display (type)`
> - **`type`** (*optional*): `rename` or `send` — if omitted, both are shown

> [!tip]
> For auto-renaming to work, also enable it with `/settings autorename_channel:true` (see [settings](settings.md)).

# compute_at_start
When `compute_at_start` is `true` on a template, the placeholder stays literal (e.g., `{{weather:long}}`) until the event becomes Active. At that point the bot resolves it and updates the event.

This also means you can create Discord events manually and include placeholders — they will be resolved when the event starts.

> [!example]
>
> ```
> /variables config date format:yyyy-LL-dd timezone:Europe/Paris step:1d
> /variables config count start_number:1 step:1 decimal:0 cron:0 0 * * *
> /variables config weather location:London compute_at_start:true
> ```