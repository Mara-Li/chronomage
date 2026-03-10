# Creating Your First Schedule

## Plan before you start

Decide:
- How many different event labels you need (`count`: 1–20)
- Interval between events (`bloc`: e.g., `2d`, `1w`)
- Daily start time (`start_time`: HH:MM, 24-hour)
- Event duration (`len`: e.g., `2h`)
- Location: a plain text string (`location_elsewhere`) or a Voice/Stage channel (`location_channel`)

## Run the create command

```
/schedule create count:3 bloc:2d start_time:21:00 len:2h timezone:Europe/Paris location_elsewhere:Online
```

Required options: `count`, `bloc`, `start_time`, `len`, and one of `location_elsewhere` or `location_channel`.

Optional: `start_date` (defaults to today), `timezone` (defaults to server setting or date template zone).

[SCREENSHOT]

## Complete the wizard

For each label (1 through count), a modal appears with:
- **Label** (required) — the event title; supports placeholders like `{{date}}` and `{{count}}`
- **Description** (optional) — event details; supports placeholders
- **Banner** (optional) — URL of a banner image

[SCREENSHOT]

Submit each modal. After the last one, the bot confirms and begins creating future events.

## Verify

```
/schedule list
```

Within a minute, events should appear in Discord's Events section.

[SCREENSHOT]
