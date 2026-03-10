## Managing Schedules

### Pausing a schedule

[SCREENSHOT]

```
/schedule pause id:your-schedule-id
```

Steps:
1. Get the schedule ID from `/schedule list`
2. Run the pause command with that ID

After pausing:
- The cycle stops creating new events
- Existing events remain in Discord until they occur
- To restart: cancel and recreate the schedule (there is no resume)

### Canceling a schedule

```
/schedule cancel id:your-schedule-id
/schedule cancel id:all
```

After confirmation:
- The cycle is permanently deleted
- Future events are removed from Discord
- Past events remain in Discord history

### Editing a schedule

**Edit timing and location:**
```
/schedule edit config id:your-schedule-id
```

[SCREENSHOT]

Provide only the options you want to change (`bloc`, `len`, `start_time`, `timezone`, `location_elsewhere`, `location_channel`).

**Edit labels, descriptions, and banners:**
```
/schedule edit blocs id:your-schedule-id
```

[SCREENSHOT]

The wizard reopens so you can update each event's label, description, and banner image.
