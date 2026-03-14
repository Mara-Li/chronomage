# Frequently Asked Questions

## General

### What is Chronomage?

Chronomage is a Discord bot that automatically creates and manages recurring scheduled events. Define a pattern once, and the bot maintains future events automatically.

### Is Chronomage free to use?

Yes, completely free with no premium features or paid tiers.

### What permissions does the bot need?

- **Manage Events** (required for all schedule and template commands)
- **Manage Channels** (optional, only needed for auto-channel renaming)
- Channel permissions for Voice/Stage events (if applicable)

### Which languages are supported?

- English
- Français (French)

Set your preference with `/settings language`.

### How do I invite the bot?

Contact the bot administrator or developer for an invite link. The invite must include the `bot` and `applications.commands` scopes with the **Manage Events** permission.

---

## Schedules

### Can I create events that start in the past?

No. If `start_date` is in the past, the bot starts from the next occurrence based on the `bloc` interval.

### What is the maximum number of labels in a cycle?

Up to 20 labels (enforced by the `count` option). The wizard handles them one at a time.

### Can I edit a schedule after creating it?

Yes:
- `/schedule edit config` — change timing, duration, location, or time zone
- `/schedule edit blocs` — update labels, descriptions, and banners via the wizard

### What happens if I delete a bot-created event manually?

The bot will recreate it to maintain the configured buffer. To permanently stop a cycle, use `/schedule cancel`.

### Can I have multiple schedules?

Yes. Each schedule operates independently with its own timing, labels, and templates.

### Why aren't my events being created?

Common causes:
- Discord's 100 scheduled events per server limit has been reached (delete old events)
- The bot lacks Manage Events permission
- The schedule is paused (`/schedule list` to check status)
- The start date is in the future
- Connectivity issue with Discord

### Can I pause a schedule and resume it later?

You can pause with `/schedule pause`. There is no resume command — to restart, cancel and recreate the schedule.

---

## Templates and placeholders

### What are placeholders?

Special codes like `{{date}}`, `{{count}}`, or `{{weather:short}}` that get replaced with dynamic content when events are created or started.

### How do I use placeholders?

1. Configure the template with `/variables config date` (or `count`/`weather`)
2. Include the placeholder in your event label or description when creating the schedule
3. The bot replaces it automatically

### What is compute_at_start?

- **`false` (default)**: placeholder is resolved when the event is *created*
- **`true`**: placeholder stays literal until the event *starts*

Use `true` for weather (current conditions at event time) and `false` for counters or dates that should reflect the creation time.

### Can I use multiple placeholders in one event?

Yes: `Episode {{count}}: {{date}} — {{weather:emoji}}`

### Why are my placeholders not working?

- Template not configured — run `/variables config date` (no options) to check
- Typo in placeholder — must be exact: `{{date}}`, not `{date}` or `{{ date }}`
- `compute_at_start:true` is set — the placeholder stays literal until the event starts (this is expected)

### How do I format dates?

Use Luxon format tokens via `/variables config date format:...`. Common values:
- `f` — `10/25/2025, 9:00 PM`
- `FF` — `Saturday, October 25, 2025, 9:00 PM EDT`
- `yyyy-LL-dd` — `2025-10-25`

See [Luxon documentation](https://moment.github.io/luxon/#/formatting) for all tokens.

### Can I use templates in manually created events?

Yes, with `compute_at_start:true`. Create the event in Discord, include placeholders in the title/description, and they will be resolved when the event starts.

---

## Weather

### How accurate is weather data?

Enable `compute_at_start:true` so weather is fetched when the event starts, not when it was scheduled days in advance.

### Why can't the bot find my city?

- Add the country: `London, UK` instead of `London`
- Use the English name
- Try a nearby larger city
- Check for typos

### Can I use different locations for different events?

Currently there is one global weather template per guild. All weather placeholders use the same configured city.

---

## Configuration

### What is the buffer and how should I set it?

The buffer is how many future events the bot keeps created at all times (`/settings future_min_blocks`). Recommendations:
- Weekly events: 2–3
- Daily events: 5–7
- Multiple events per day: 10+

### What time zone format should I use?

IANA names: `America/New_York`, `Europe/London`, `Asia/Tokyo`, etc.
[Full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

### Can different schedules use different time zones?

Yes — specify `timezone` when running `/schedule create`. Each schedule uses its own zone. If omitted, the server default is used.

---

## Technical

### Where is my data stored?

In a local SQLite database (`data/enmap.sqlite`) on the server hosting the bot. See [Privacy Policy](../legals/PRIVACY_POLICY.md).

### What happens if the bot goes offline?

Existing Discord events remain. When the bot comes back online it catches up and recreates any missing future events.

### Can the bot read my messages?

No. The bot only receives slash command interactions, scheduled event status changes, and basic server info (ID, name).

---

## Error messages

| Message | Meaning | Fix |
|---------|---------|-----|
| "Missing permissions" | Bot lacks Manage Events | Grant Manage Events in server/channel settings |
| "Location not found" | City not recognized | Try `London, UK` or a different spelling |
| "Invalid duration" | Bad format | Use `2h`, `1d`, `30m`, `2h30m` |
| "Invalid time format" | Not HH:MM | Use 24-hour format: `21:00` |
| "Maximum events reached" | Discord 100-event limit | Delete old events or reduce buffer |
| "Schedule not found" | Bad ID | Check with `/schedule list` |
| "Invalid timezone" | Unrecognized zone | Use IANA names like `America/New_York` |
| "Invalid cron expression" | Bad cron syntax | Verify cron format (e.g., `0 0 * * *`) |
