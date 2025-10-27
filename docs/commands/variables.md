# /variables
Manage placeholder templates used in event names and descriptions.

## Config
### Date
- `format` (*optional*): e.g., f, FF, yyyy-LL-dd HH:mm. See [Luxon format](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)
- `timezone` (*optional*): IANA zone, e.g., Europe/Paris
- `cron` (*optional*): when to advance current value
- `start_time` (*optional*): first value text, matching your format
- `step` (*optional*): localized duration (e.g., 1d, 2h30m)
- `compute_at_start` (*optional*): compute on activation if true

Then you can use the `{{date}}` placeholder in your event labels/descriptions.

### Count
- `start` (*optional*): initial number
- `step` (*optional*): delta per cron tick (positive or negative)
- `decimal` (*optional*): digits after the decimal point
- `cron` (*optional*): cron driving increments
- `compute_at_start` (*optional*): Compute when the event start when true

Then you can use the `{{count}}` placeholder in your event labels/descriptions.

### Weather
- `location` (*optional*): City where to fetch the weather
- `compute_at_start` (*optional*)
- `cron` (*optional*) : cron driving increments

The weather placeholder supports:
- `{{weather:emoji}}`: weather emoji only (`☀️`, `🌧️`, etc.)
- `{{weather:short}}`: short description (`Sunny, 25°C`)
- `{{weather:long}}`: long description (`Sunny with a high of 25°C....`)

### Compute at start
If set on `true`, the template will be updated only when the event start.
Until then, the template will remains (as `{{weather:long}}` for example) in the label or the description.

This **also** allow to create event manually (ie without using the wizard and the `/schedule create` commands) with theses template, as they will be updated accordingly when the event start.

> [!IMPORTANT]
> - Run `/variables date` (or `count`, `weather`) with no options to **display current settings**.
> - Pass one or more options to update the template. On success, the bot replies with a confirmation.

> [!TIP]
> - `/variables date format: yyyy-LL-dd HH:mm timezone: Europe/Paris step: 1d`
> - `/variables count start: 1 step: 1 decimal: 0 cron: 0 0 * * *`
> - `/variables weather location: London compute_at_start: true`

> [!NOTE]
> [See also template](https://github.com/Mara-Li/chronomage/wiki/Templates) for details on placeholders and compute timing.

### Switch
- `variables` : Choices with `date`, `count`, `weather` and `all`

Allow to pause or start a variables template.

## Channels
### Rename

> [!IMPORTANT]
> Only 5 channels can be renamed at time.

Rename automatically a channel based on a template.

- `channel` (*required*): Tag to the channel to rename
- `text` : Template to use

If text is empty, it will delete the settings for the requested channel.

### Send

> [!IMPORTANT]
> Only 5 channels can receive the message/template.

Send automatically a message when the variable update in the channel.

- `channel` (*required*) : Tag to the channel to send the message
- `text` (*optional*) : Template to use

If text is empty, it will delete the settings for the requested channel.


### Display

Allow to display the settings for the auto-rename / send message.

- `type` (*optional*) : Choose between rename/send settings.

If not set, send the two settings.
