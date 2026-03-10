# Troubleshooting Guide

## Quick diagnostics

1. ✅ Verify the bot is online (check server member list)
2. ✅ Confirm the bot has **Manage Events** permission
3. ✅ Run `/schedule list` to check schedule status
4. ✅ Check [Discord Status](https://discordstatus.com) for platform issues
5. ✅ Test basic functionality: `/weather location:London`

---

## Bot not responding

**Symptoms:** Commands don't appear, or there's no response to slash commands.

1. Check bot is in the member list and shows as Online
2. Refresh Discord (Ctrl+R / Cmd+R)
3. Verify bot was invited with `applications.commands` scope
4. Wait 5–10 minutes after bot joins — slash commands can take a few minutes to register
5. Ensure "Use Application Commands" is enabled in the bot's role permissions

---

## Events not being created

**Symptoms:** Schedule exists but no events appear; buffer not maintained.

1. Run `/schedule list` — verify the schedule is active (not paused)
2. Check Discord's 100-event-per-server limit — delete old past events
3. Verify the bot has **Manage Events** permission
4. For Voice/Stage events, check channel-level permissions
5. Review buffer setting: `/settings future_min_blocks:5`
6. Ensure `start_date` is not set too far in the future

---

## Placeholders not working

**Symptoms:** `{{date}}`, `{{count}}`, or `{{weather:short}}` appears literally in events.

1. Check template configuration (run with no options to view):
   ```
   /variables config date
   /variables config count
   /variables config weather
   ```
2. Verify exact placeholder syntax — no spaces, double braces: `{{date}}` not `{date}` or `{{ date }}`
3. If `compute_at_start:true` is set, the placeholder stays literal until the event starts — this is expected behavior
4. Ensure the weather template has a `location` configured

---

## Weather issues

**Location not found:**
1. Add the country: `London, UK`
2. Use the English city name
3. Try a nearby larger city
4. Test with: `/weather location:YourCity`

**Weather outdated:**
```
/variables config weather location:YourCity compute_at_start:true
```

---

## Time and date issues

**Events at wrong time:**
1. Check: `/settings timezone:America/New_York` (use IANA names)
2. Verify `start_time` is in 24-hour HH:MM format: `21:00` not `9pm`
3. Individual schedules can override the server timezone

**Date placeholder wrong:**
1. Check format: `/variables config date format:yyyy-LL-dd timezone:America/New_York step:1d`
2. If `compute_at_start:true`, the date updates when the event starts

---

## Counter not incrementing

1. Verify step is non-zero: `/variables config count start_number:1 step:1 cron:0 0 * * *`
2. Check the cron expression is valid
3. If `compute_at_start:true`, the counter updates when the event starts

---

## Wizard issues

**Modal not appearing:** Try refreshing Discord; modals can occasionally be slow.

**Lost wizard progress:** Complete the wizard in one session. If interrupted, restart with a new `/schedule create` command.

**Banner image not accepted:** Must be a publicly accessible URL (`https://`) for a JPEG, PNG, or GIF image.

---

## Permission errors

**Server level:**
1. Server Settings → Roles → Bot role → enable **Manage Events**

**Channel level (Voice/Stage):**
1. Right-click channel → Edit Channel → Permissions
2. Add bot role and enable **Manage Events** and **View Channel**

---

## Schedule management

**Can't pause/cancel:** Use the exact schedule ID shown by `/schedule list`.

**Schedule paused but events still appear:** Pause only stops *new* events from being created; existing events remain until they occur.

---

## Getting help

When reporting issues, include:
- The commands you used
- Exact error messages
- Schedule ID (from `/schedule list`)
- Template settings (from `/variables config date` etc.)

Resources:
- [FAQ](README.md)
- [Commands Reference](../commands/README.md)
- [GitHub Issues](https://github.com/Mara-Li/chronomage/issues)
