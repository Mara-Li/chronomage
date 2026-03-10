## Viewing Your Schedules

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

Note: placeholders like `{{weather:emoji}}` appear literally in the list; they are resolved when events are created or started.
