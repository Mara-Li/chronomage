# FAQ

See the full [FAQ](../resources/README.md) for comprehensive answers.

## Quick answers

**Can I create events for past dates?**
No — Chronomage only creates future events. If `start_date` is in the past, the bot starts from the next valid occurrence.

**What happens if I delete an event manually?**
The bot will recreate it to maintain the buffer. To permanently remove a recurring event, cancel the schedule.

**Can I use multiple schedules?**
Yes — create as many as needed. Each operates independently.

**Can I edit a schedule after creating it?**
Yes — use `/schedule edit config` to change timing and location, or `/schedule edit blocs` to update labels, descriptions, and banners.

**How accurate is weather data?**
Enable `compute_at_start:true` for best accuracy — the weather is fetched when the event actually starts rather than when it was scheduled.
