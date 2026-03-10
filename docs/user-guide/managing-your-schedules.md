# Managing Your Schedules

## Viewing schedules

```
/schedule list
```

Displays all active cycles, their IDs, timing, and upcoming events.

[SCREENSHOT]

## Pausing a schedule

```
/schedule pause id:your-schedule-id
```

Stops new events from being created. Existing events remain in Discord. There is no resume command; to restart the cycle, cancel and recreate it.

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

Available options (all optional, provide only what you want to change):
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

Reopens the wizard so you can update labels, descriptions, and banner images for each event in the cycle. Use the `count` option to change the number of labels.
