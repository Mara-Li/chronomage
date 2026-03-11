# /schedule

Create and manage recurring cycles of Discord Scheduled Events.

Requires: **Manage Events** permission (and channel permissions for Stage/Voice events).

## Subcommands

- **create** — define a cycle; opens a wizard to enter labels, optional descriptions, and optional banner images
- **list** — show active cycles and a few upcoming events
- **pause** — pause a cycle (stops creating new events; existing ones remain)
- **cancel** — delete a cycle and purge its future events (also deletes linked events on Discord when possible)
- **edit** — edit an existing cycle (see below)

## create

Options:

- `count` (**required**): number of different labels/descriptions you will provide (1–20)
- `bloc` (**required**): interval between starts (e.g., `2d`, `48h`)
- `start_time` (**required**): daily time in HH:MM format at which each event starts (e.g., `21:00`)
- `len` (**required**): event duration (e.g., `2h`)
- `location_elsewhere` (*optional*): plain text location for External events
- `location_channel` (*optional*): a Voice or Stage channel
- `start_date` (*optional*): first day for the cycle (defaults to today in the chosen time zone)
- `timezone` (*optional*): IANA time zone name (e.g., `Europe/Paris`)

> [!NOTE]
> - Provide either `location_elsewhere` or `location_channel` — not both.
> - `timezone` defaults to the date template's zone or guild settings if omitted.
> - Durations support localized input (e.g., `2h`, `2 hours`, `2 heures`).

### Wizard

For each label (1 → count), a modal will prompt for:

- **Label** (**required**) — event title; placeholders are supported
- **Description** (*optional*) — event details; placeholders are supported
- **Banner** (*optional*) — URL of the banner image (minimum 800×320 px recommended)

After the wizard, the bot saves the cycle and immediately starts maintaining the future event buffer.

> [!IMPORTANT]
> You can use placeholders (`{{date}}`, `{{count}}`, `{{weather:short}}`, etc.) in labels and descriptions.
> See [Templates](../Templates.md) for the full list.

## list

Options:

- `id` (*optional*, autocomplete): filter by a specific schedule ID

## pause

Options:

- `id` (**required**, autocomplete): ID of the cycle to pause

## cancel

Options:

- `id` (**required**, autocomplete): ID of the cycle to cancel; use `all` to cancel every cycle

## edit

### edit config

Edit a cycle's timing and location. Future events are recreated automatically if the block interval, start time, or time zone changes.

Options:

- `id` (**required**, autocomplete): ID of the cycle to edit
- `bloc` (*optional*): new block interval
- `len` (*optional*): new event duration
- `start_time` (*optional*): new daily start time (HH:MM)
- `timezone` (*optional*): new IANA time zone
- `location_elsewhere` (*optional*): new plain text location
- `location_channel` (*optional*): new Voice or Stage channel

### edit blocs

Re-enter labels, descriptions, and banners for a cycle via the wizard.

Options:

- `id` (**required**, autocomplete): ID of the cycle to edit
- `count` (*optional*, 1–20): number of labels to re-enter (defaults to the current cycle length)

> [!TIP]
> ```
> /schedule create count:3 bloc:2d start_time:21:00 len:2h timezone:Europe/Paris location_elsewhere:Online
> /schedule list
> /schedule pause id:my-cycle-123
> /schedule cancel id:my-cycle-123
> /schedule cancel id:all
> /schedule edit config id:my-cycle-123 start_time:20:00
> /schedule edit blocs id:my-cycle-123 count:3
> ```
