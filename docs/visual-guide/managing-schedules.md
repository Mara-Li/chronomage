## Managing Schedules

### Pausing a Schedule

Command:
```
/schedule pause id:your-schedule-id
```

Steps:
1. Get schedule ID from `/schedule list`
2. Copy the ID
3. Use in pause command
4. Bot confirms schedule is paused

What happens:
- Schedule stops creating new events
- Existing events remain
- No new events until you delete and recreate the schedule

### Canceling a Schedule

Command (single):
```
/schedule cancel id:your-schedule-id
```

Command (all):
```
/schedule cancel id:all
```

Warning prompt:
- Bot asks for confirmation
- Shows what will be deleted
- Requires confirmation click

After confirmation:
- Schedule is permanently deleted
- Future events are removed from Discord
- Past events remain in Discord history
- Success message appears

Cannot undo:
- This action is permanent
- You'll need to recreate the schedule if needed
