# Troubleshooting Guide

Having issues with Chronomage? This guide will help you diagnose and resolve common problems.

## Quick Diagnostic Steps

Before diving into specific issues, try these general diagnostic steps:

1. ✅ **Verify bot is online** - Check the bot's status in your server member list
2. ✅ **Check permissions** - Ensure the bot has "Manage Events" permission
3. ✅ **Review command syntax** - Use `/schedule list` and `/variables` to check current settings
4. ✅ **Check Discord status** - Visit [Discord Status](https://discordstatus.com) for platform issues
5. ✅ **Try a simple command** - Test with `/weather location:London` to verify basic functionality

---

## Bot Not Responding

### Symptoms
- Commands don't show up in slash command menu
- No response when using slash commands
- Bot appears offline

### Solutions

**1. Check Bot Status**
- Look for the bot in your server's member list
- If offline, contact the bot administrator

**2. Refresh Discord**
- Close and reopen Discord completely (Ctrl+R / Cmd+R)
- Clear Discord cache if needed

**3. Verify Bot Permissions**
- Server Settings → Roles → Bot's Role
- Ensure "Use Application Commands" is enabled

**4. Check Bot Invite**
- Bot must be invited with `applications.commands` scope
- Re-invite the bot if necessary

**5. Wait for Command Registration**
- After bot joins, commands may take a few minutes to appear
- Try again after 5-10 minutes

---

## Events Not Being Created

### Symptoms
- Schedule exists but no events appear
- Events created then disappear
- Buffer not maintained

### Solutions

**1. Check Schedule Status**
```
/schedule list
```
- Verify schedule shows as active (not paused)
- Check upcoming events count

**2. Verify Event Limit**
- Discord limits: 100 scheduled events per server
- Delete old/past events manually in Discord
- Reduce buffer size: `/settings future_min_blocks:3`

**3. Check Bot Permissions**
- Server Settings → Roles → Bot Role
- Must have "Manage Events" permission
- For Voice/Stage: check channel-specific permissions

**4. Check Start Date**
- If `start_date` is far in future, events won't appear yet
- Cancel and recreate with appropriate start date

**5. Review Buffer Settings**
```
/settings future_min_blocks:5
```
- Set to reasonable number based on your schedule frequency

**6. Check Time Zone**
- Ensure timezone is set correctly
- Events may be created at unexpected times if timezone is wrong

**7. Check Bloc Interval**
- Very long intervals (e.g., "30d") mean fewer events created
- Verify your bloc setting is what you intended

---

## Placeholders Not Working

### Symptoms
- `{{date}}` appears literally in events
- `{{count}}` doesn't increment
- `{{weather:short}}` shows placeholder instead of weather

### Solutions

**1. Check Template Configuration**
```
/variables date
/variables count
/variables weather
```
- Run without options to see current settings
- If empty, configure the template first

**2. Verify Placeholder Syntax**
- Correct: `{{date}}`, `{{count}}`, `{{weather:emoji}}`
- Incorrect: `{date}`, `{{ date }}`, `{{weather}}`
- Must be exact format with no spaces

**3. Check compute_at_start Setting**
- If `true`, placeholders show as `{{...}}` until event starts
- This is normal and expected behavior
- They'll update when the event begins

**4. Verify Weather Location**
```
/variables weather location:YourCity compute_at_start:true
```
- Location must be configured for weather placeholders
- Test location with `/weather location:YourCity`

**5. Re-create Events**
- If templates were configured after events were created
- Cancel and recreate the schedule to apply new templates

---

## Weather Issues

### "Location not found" Error

**Solutions:**
1. Try different spelling variations
2. Add country: "London, UK" instead of just "London"
3. Try a nearby larger city
4. Use English city names
5. Check for typos

**Test with:**
```
/weather location:YourCity
```

### Weather Always Wrong/Outdated

**Solution:**
Enable compute at start:
```
/variables weather location:YourCity compute_at_start:true
```

This fetches weather when the event starts, not when it's created.

### Weather Not Showing at All

**Checklist:**
- [ ] Weather template configured with city
- [ ] Placeholder syntax correct: `{{weather:short}}` or `{{weather:long}}`
- [ ] Location accessible by weather service
- [ ] Weather service not temporarily down

---

## Time and Date Issues

### Events at Wrong Time

**Solutions:**

**1. Check Timezone**
```
/settings timezone:America/New_York
```
- Use IANA timezone names
- List: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

**2. Verify start_time Format**
- Must be 24-hour format: "21:00" not "9pm"
- Always HH:MM format

**3. Check Schedule Timezone**
- Individual schedules can override server timezone
- Review with `/schedule list`

**4. Remember Discord Time Display**
- Discord shows times in YOUR local timezone
- Event may be correct but displayed differently for you

### Date Placeholder Wrong

**Solutions:**

**1. Check Date Template**
```
/variables date format:yyyy-LL-dd timezone:America/New_York step:1d
```

**2. Verify Format String**
- Use Luxon format tokens
- Common: `f`, `FF`, `yyyy-LL-dd HH:mm`
- See: https://moment.github.io/luxon/#/formatting

**3. Check Step Value**
- Ensure step advances correctly (e.g., "1d" for daily)

**4. Review compute_at_start**
- If `true`, date updates when event starts
- If `false`, date set when event created

---

## Counter Not Incrementing

### Symptoms
- `{{count}}` always shows same number
- Counter doesn't advance between events

### Solutions

**1. Check Count Template**
```
/variables count start:1 step:1 cron:0 0 * * *
```

**2. Verify Step Value**
- Must be non-zero to increment
- Positive: counts up (1, 2, 3...)
- Negative: counts down (10, 9, 8...)

**3. Check Cron Schedule**
- Cron determines when counter advances
- `0 0 * * *` = daily at midnight
- Must match your event frequency

**4. Review compute_at_start**
- If `true`, counter updates when event starts
- If `false`, counter set when event created

**5. Check Event Order**
- Counter advances based on cron, not event order
- May need to adjust cron to match schedule

---

## Wizard Issues

### Modal Not Appearing

**Solutions:**
1. Discord may have blocked pop-ups - check browser settings
2. Try again - sometimes Discord is slow to show modals
3. Refresh Discord (Ctrl+R / Cmd+R)
4. Try from desktop app instead of browser (or vice versa)

### Lost Progress in Wizard

**Solutions:**
1. Complete wizard in one session - don't close modal
2. If interrupted, restart with new `/schedule create` command
3. Have your labels prepared beforehand
4. Use Skip button if you need to skip entries

### Can't Enter Banner Image

**Solutions:**
1. Banner must be valid image URL (JPEG, PNG, GIF)
2. Must be publicly accessible URL (no localhost or private IPs)
3. URL must start with `http://` or `https://`
4. Leave blank if you don't have an image
5. Image size: Discord recommends 800x320 pixels

---

## Permission Errors

### "Missing Permissions" Error

**Server-Level Permissions:**
1. Server Settings → Roles
2. Find bot's role
3. Enable "Manage Events"
4. Save changes

**Channel-Level Permissions (Voice/Stage):**
1. Right-click channel → Edit Channel
2. Permissions tab
3. Add bot's role
4. Enable "Manage Events" and "View Channel"
5. Save changes

**User Permissions:**
- You need "Manage Events" permission to use `/schedule` commands
- Contact server administrator to get permission

---

## Schedule Management Issues

### Can't Pause Schedule

**Check:**
1. Use exact schedule ID from `/schedule list`
2. Verify you have correct permissions
3. Ensure schedule exists and isn't already paused

### Can't Cancel Schedule

**Solutions:**
1. Use exact ID: `/schedule cancel id:your-schedule-id`
2. To cancel all: `/schedule cancel id:all`
3. Confirm you have "Manage Events" permission
4. Check that schedule exists in `/schedule list`

### Schedule Paused but Events Still Appear

**Explanation:**
- Pause prevents NEW events from being created
- Existing events remain until they occur
- To remove existing events, use `/schedule cancel`

---

## Configuration Issues

### Settings Not Saving

**Solutions:**
1. Ensure you complete the command with all required options
2. Wait for confirmation message
3. Verify with subsequent command (e.g., check language changed)
4. Check bot has database write permissions (contact admin)

### Changed Settings Not Applying

**Solutions:**
1. Settings apply to NEW events, not existing ones
2. Cancel and recreate schedules to apply new settings
3. Refresh Discord to see updated responses
4. Some settings require bot restart (contact admin)

---

## Performance Issues

### Bot Slow to Respond

**Possible Causes:**
- Discord API slow or rate-limited
- Bot server under heavy load
- Network connectivity issues
- Large number of schedules to process

**Solutions:**
1. Wait a bit longer - some operations take time
2. Reduce buffer size if too large
3. Delete unused schedules
4. Contact bot administrator about server performance

### Events Created Slowly

**Explanation:**
- Bot creates events gradually to avoid rate limits
- Multiple schedules = longer creation time
- This is normal behavior

**Solutions:**
- Be patient, events will be created
- Reduce buffer size if not needed: `/settings future_min_blocks:3`

---

## Data and Privacy Issues

### Want to Delete My Data

**Solutions:**
1. Delete individual schedules: `/schedule cancel id:schedule-id`
2. Delete all schedules: `/schedule cancel id:all`
3. Remove bot from server completely
4. Contact bot administrator for complete data removal
5. See [Privacy Policy](legals/PRIVACY_POLICY.md) for data retention details

### Concerned About Data Security

**Information:**
- Review our [Privacy Policy](legals/PRIVACY_POLICY.md)
- Data stored in secure SQLite database
- No data sold to third parties
- Only shared with Discord API and weather service
- Contact administrator with specific concerns

---

## Discord-Specific Issues

### Events Disappear from Discord

**Possible Causes:**
1. Discord's scheduled event auto-deletion (past events)
2. Server admin deleted them manually
3. Hit 100-event server limit (older events auto-deleted)
4. Discord API issues

**Solutions:**
- This is normal for past events
- Bot recreates future events automatically
- Check Discord Status for platform issues

### Can't See Event Time Correctly

**Explanation:**
- Discord shows times in YOUR local timezone
- Other users see times in THEIR timezones
- Event still starts at correct time regardless of display

**Solutions:**
- Verify event timezone matches intended location
- Use timezone-aware testing
- Trust Discord's automatic conversion

---

## Getting More Help

If you've tried everything and still have issues:

### Information to Provide

When asking for help, include:
- What you're trying to do
- Commands you've used
- Error messages (exact text)
- Screenshots if possible
- Schedule ID (from `/schedule list`)
- Template settings (from `/variables` commands)

### Where to Get Help

1. **Check Documentation**
   - [User Guide](USER_GUIDE.md)
   - [Commands Reference](Commands.md)
   - [FAQ](README.md)

2. **Contact Support**
   - Server administrator (first contact)
   - Bot developer (for bug reports)

3. **Report Bugs**
   - GitHub Issues (if repository is public)
   - Include detailed reproduction steps

---

## Common Error Messages

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "Missing permissions" | Bot lacks required permission | Grant "Manage Events" permission |
| "Location not found" | Weather city not recognized | Try different spelling or nearby city |
| "Invalid duration" | Duration format incorrect | Use format like "2h", "1d", "30m" |
| "Invalid time format" | Time not in HH:MM format | Use 24-hour format: "21:00" |
| "Maximum events reached" | Hit Discord's 100-event limit | Delete old events or reduce buffer |
| "Schedule not found" | Invalid schedule ID | Check ID with `/schedule list` |
| "Invalid timezone" | Timezone name not recognized | Use IANA names like "America/New_York" |
| "Invalid cron expression" | Cron format incorrect | Check cron syntax or use presets |

---

## Prevention Tips

### To Avoid Issues

1. **Test First**
   - Create test schedules with short intervals
   - Verify settings before creating production schedules

2. **Document Settings**
   - Keep notes on your configurations
   - Screenshot important settings

3. **Regular Maintenance**
   - Review schedules periodically
   - Delete unused schedules
   - Clean up old events in Discord

4. **Stay Updated**
   - Check for bot updates
   - Read changelog for breaking changes
   - Update configurations as needed

5. **Understand Limitations**
   - Discord's 100-event limit per server
   - Bot processing time for many schedules
   - Weather service availability

---

**Last Updated**: October 25, 2025

For additional help, see:
- [User Guide](USER_GUIDE.md) - Complete documentation
- [FAQ](README.md) - Common questions
- [Commands Reference](Commands.md) - Command syntax

If you discover a solution not listed here, please share it with the bot developer to help improve this guide!
