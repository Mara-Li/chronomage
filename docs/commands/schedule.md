# /schedule
Create and manage recurring cycles of Discord Scheduled Events.

Requires: Manage Events permission (and channel permissions for Stage/Voice events).

## Subcommands
- **create** — define a cycle; opens a wizard to enter labels, optional descriptions, and optional banner images
- **list** — show active cycles and a few upcoming events
- **pause** — pause a cycle (stops creating new events; existing ones remain)
- **cancel** — delete a cycle and purge its future events (also deletes linked events on Discord when possible)


## create — options
- `count` (**required**): number of different labels/descriptions you will provide
- `bloc` (**required**): interval between starts (e.g., 2d, 48h)
- `start_time` (**required**): daily time HH:MM at which each event starts
- `len` (**required**): event length (e.g., 2h)
- `location_elsewhere` (*optional*): plain text location (External events)
- `location_channel` (*optional*): a Stage/Voice channel
- `start_date` (*optional*): first day for the cycle (defaults to today in zone)
- `timezone` (*optional*): IANA name (e.g., Europe/Paris)

> [!NOTE]
> - Provide either location_elsewhere or location_channel — not both.
> - Timezone defaults to the date template’s zone or guild settings if omitted.
> - Durations support localized input (e.g., 2h, 2 hours, 2 heures).

## Wizard flow
For each label (1 -> count), you’ll provide:
- **Label** (**required**)
- **Description** (*optional*)
- **Banner image** (*optional*)

After the wizard, the bot saves the cycle and starts maintaining the future buffer.

> [!IMPORTANT]
> You can use placeholders in labels and descriptions. See [Templates.md](../Templates.md) for details.

> [!TIP]
> - `/schedule create count: 3 bloc: 2d start_time: 21:00 len: 2h timezone: Europe/Paris`
> - `/schedule list`
> - `/schedule pause id: my-cycle-123`
> - `/schedule cancel id: my-cycle-123`
> - `/schedule cancel id: all` (deletes all cycles)
