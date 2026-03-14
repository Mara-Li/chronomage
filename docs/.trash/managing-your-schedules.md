# Managing your schedules
## Viewing
> [!usage] `/schedule list`

The bot replies with a list of all active cycles. For each cycle you'll see:

- **Schedule ID** — used with pause/cancel/edit commands
- **Labels** — the event titles in this cycle
- **Bloc duration** — interval between events
- **Event duration**
- **Start time** and time zone
- **Start date** (anchor)
- **Location** — channel or external text
- **Upcoming events** — next scheduled occurrences



<u>Note</u>: placeholders appear literally in the list; they are resolved when events are created or started.

## Pausing
> [!usage]
> `/schedule pause [id]`
> - **`id`** : ID of the schedule.

[SCREENSHOT]

Stops new events from being created. Existing events remain in Discord. There is no resume command; to restart a paused cycle, cancel and recreate it.

## Canceling
> [!usage]
> - <u>Specific ID:</u>`/schedule cancel [id]`
> - <u>To delete all schedules at once:</u> `/schedule cancel id:all`

This permanently removes the cycle and purges future events. Past events remain in Discord history.

## Editing
### Timing and location
> [!usage] `/schedule edit config [id] (bloc) (len) (start_time) (timezone) (location_elsewhere) (location_channel)`
> - **`bloc`** — new block interval
> - **`len`** — new event duration
> - **`start_time`** — new daily start time (HH:MM)
> - **`timezone`** — new IANA time zone
> - **`location_elsewhere`** — new text location
> - **`location_channel`** — new Voice/Stage channel

[SCREENSHOT]

When `start_time`, `timezone`, or `bloc` changes, all future events are automatically deleted and recreated.

### Labels, descriptions, and banners
> [!usage] `/schedule edit blocs [id] (count)`
> - **`id`** : Id to edit
> - **`count`** : Change the number of labels

[SCREENSHOT]

