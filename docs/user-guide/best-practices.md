# Best Practices

## Schedules

1. **Test with a short interval first** — use `bloc:1h` or similar to verify the setup before going live
2. **Use descriptive labels** — event names should be clear to community members
3. **Set an appropriate buffer** — weekly events: 2–3; daily: 5–7; sub-daily: 10+
4. **Always specify a time zone** — avoids confusion for you and for the bot

## Templates

1. **Weather: always use `compute_at_start:true`** — fetches weather when the event starts, not days earlier
2. **Choose date formats your audience understands** — `f` or `FF` for human-readable, `yyyy-LL-dd` for technical
3. **Put `{{count}}` at a visible position** in event titles for easy episode/session scanning
4. **Test placeholders before going live** — create a test schedule and check the output

## Server management

1. **Document your schedules** — note what each schedule is for
2. **Review schedules periodically** — cancel unused ones to stay under Discord's 100-event limit
3. **Coordinate changes with your community** — notify members before editing or canceling active schedules
4. **Back up settings** — note your configurations; there is no export feature
