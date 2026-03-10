# Managing Your Schedules

## Viewing schedules

```
/schedule list
```

[SCREENSHOT]

The bot replies with a list of all active cycles. For each cycle you'll see:

- **Schedule ID** — used with pause/cancel/edit commands
- **Labels** — the event titles in this cycle
- **Bloc duration** — interval between events
- **Event duration**
- **Start time** and time zone
- **Start date** (anchor)
- **Location** — channel or external text
- **Upcoming events** — next scheduled occurrences

Example output:
```
- **fiery-breads-like** ✅
   - __Label(s):__
     - `{{weather:emoji}} {{date}} (Day)`
     - `{{weather:emoji}} {{date}} (Night)`
   - __Bloc duration:__ `2 days`
   - __Event's duration:__ `2 hours`
   - __Bloc start time :__ `21:45 (Europe/Paris)`
   - __Start date :__ 2025-10-25
   - __Location:__ Online
   - __Upcoming events :__
     - `{{weather:emoji}} {{date}} (Day)` — 28 October 2025 21:45
```

Note: placeholders appear literally in the list; they are resolved when events are created or started.

## Pausing a schedule

```
/schedule pause id:your-schedule-id
```

[SCREENSHOT]

Stops new events from being created. Existing events remain in Discord. There is no resume command; to restart a paused cycle, cancel and recreate it.

## Canceling a schedule

```
/schedule cancel id:your-schedule-id
```

To delete all schedules at once:
```
/schedule cancel id:all
```

This permanently removes the cycle and purges future events. Past events remain in Discord history.

## Editing a schedule

### Edit timing and location

```
/schedule edit config id:your-schedule-id
```

[SCREENSHOT]

Provide only the options you want to change (all optional):
- `bloc` — new block interval
- `len` — new event duration
- `start_time` — new daily start time (HH:MM)
- `timezone` — new IANA time zone
- `location_elsewhere` — new text location
- `location_channel` — new Voice/Stage channel

When `start_time`, `timezone`, or `bloc` changes, all future events are automatically deleted and recreated.

### Edit labels, descriptions, and banners

```
/schedule edit blocs id:your-schedule-id
```

[SCREENSHOT]

Reopens the wizard so you can update labels, descriptions, and banner images. Use the `count` option to change the number of labels.
