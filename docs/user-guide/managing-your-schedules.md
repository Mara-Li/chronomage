# Managing Your Schedules

## Viewing Schedules
Use `/schedule list` to view active schedules, IDs, and upcoming events.

## Pausing a Schedule
```
/schedule pause id:your-schedule-id
```

Pausing stops creating new events; existing events remain.

## Canceling a Schedule
```
/schedule cancel id:your-schedule-id
```

To delete all schedules:
```
/schedule cancel id:all
```

This action is permanent for future events.

## Editing
Editing is not directly supported. To change a schedule, cancel and recreate it with new settings.
