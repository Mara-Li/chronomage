# Frequently Asked Questions (FAQ)

Common questions and answers about using Chronomage.

## General Questions

### What is Chronomage?

Chronomage is a Discord bot that automatically creates and manages recurring scheduled events. Instead of manually creating the same events repeatedly, you define a pattern once, and the bot handles the rest.

### Is Chronomage free to use?

Yes, Chronomage is completely free to use. There are no premium features or paid tiers.
And there will be never. The bot is self-host on a Raspberry Pi, so the bot is completely free on my side… At last at the cost of my electricity. 

### What permissions does the bot need?

The bot requires:
- **Manage Events** permission (required)
- **Manage channels** permission (*not required*), for autochannel renaming.
- Channel permissions for Voice/Stage events (if applicable)

### Which languages are supported?

Chronomage currently supports:
- English
- French (Français)

You can set your preferred language using `/settings language`.

### How do I invite the bot to my server?

Contact the bot administrator or developer for an invite link. The bot owner must generate an OAuth2 invite link with the appropriate permissions.

---

## Schedule Questions

### Can I create events that start in the past?

No, Chronomage only creates future events. If your `start_date` is in the past, the bot will start from the next occurrence based on your `bloc` interval.

### What's the maximum number of labels I can have in a cycle?

There's no hard technical limit, but very large cycles (50+ labels) may slow down the wizard process. We recommend keeping cycles reasonable (typically 3-10 labels).

### Can I edit a schedule after creating it?

Direct editing is not currently supported. To modify a schedule:
1. Note your current settings
2. Cancel the schedule using `/schedule cancel`
3. Create a new schedule with updated settings

Future versions may add edit functionality.

### What happens if I manually delete a bot-created event?

The bot will recreate the event to maintain the configured buffer. To permanently remove events, you must cancel the schedule using `/schedule cancel`.

### Can I have multiple schedules running at once?

Yes! You can create as many schedules as you need. Each operates independently with its own timing, cycle, and templates.

### Why aren't my events being created?

Common reasons:
- Discord has reached its maximum events limit (100 per server)
- The bot lacks proper permissions
- The schedule is paused
- The start date is too far in the future
- There's a connectivity issue with Discord

Use `/schedule list` to check if your schedule is active.

### Can I pause a schedule and resume it later?

You can pause a schedule using `/schedule pause`, but there's currently no unpause feature. Paused schedules stop creating new events, but existing events remain.

---

## Template Questions

### What are placeholders?

Placeholders are special codes like `{{date}}`, `{{count}}`, or `{{weather:short}}` that get replaced with dynamic content when events are created or started.

### How do I use placeholders in my events?

1. Configure the relevant template using `/variables` commands
2. Include the placeholder in your event label or description
3. The bot replaces it automatically

Example: "Weekly Meeting - {{date}}" becomes "Weekly Meeting - 2025-10-25"

### What's the difference between compute_at_start true and false?

- **False** (default): The placeholder is replaced when the event is *created*
- **True**: The placeholder stays as `{{...}}` until the event actually *starts*

Use `true` for:
- Weather (to get current conditions)
- Time-sensitive information

Use `false` for:
- Fixed counters
- Dates that should reflect creation time

### Can I use multiple placeholders in one event?

Yes! You can use any combination of placeholders:
```
"Episode {{count}}: {{date}} - {{weather:emoji}}"
```

### Why are my placeholders not working?

Common issues:
- Template not configured - run `/variables <type>` without options to check
- Typo in placeholder syntax - ensure correct format like `{{date}}`
- Wrong placeholder name - use exact names like `{{weather:short}}`, not `{{weather:description}}`

### How do I format dates?

Use the `format` option in `/variables date`. Common formats:
- `f` - Short format: "10/25/2025, 9:00 PM"
- `FF` - Full format: "Saturday, October 25, 2025, 9:00 PM EDT"
- `yyyy-LL-dd` - ISO format: "2025-10-25"
- `yyyy-LL-dd HH:mm` - ISO with time: "2025-10-25 21:00"

See [Luxon documentation](https://moment.github.io/luxon/#/formatting) for all format tokens.

### Can I use templates in manually created events?

Yes, if you enable `compute_at_start:true` on your templates! Create an event manually (through Discord) and include placeholders like `{{date}}` - they'll be updated when the event starts.

---

## Weather Questions

### How accurate is the weather information?

Weather data comes from third-party services and is generally accurate, but:
- It's a forecast, not guaranteed
- Data may be delayed by a few minutes
- Some locations may not be available

Don't rely on bot weather for critical decisions.

### Why can't the bot find my city?

Try:
- Using the English name of the city
- Adding the country (e.g., "London, UK")
- Trying a nearby larger city
- Checking spelling

### When is weather data fetched?

Depends on your `compute_at_start` setting:
- **False**: When the event is created (could be days or weeks before)
- **True**: When the event actually starts (most accurate)

We recommend `compute_at_start:true` for weather.

### Can I use different weather locations for different events?

Currently, there's one global weather template per server. All weather placeholders use the same configured city.

---

## Configuration Questions

### What's a "buffer" and how should I set it?

The buffer is how many future events the bot keeps created at all times. 

Recommendations:
- **Weekly events**: 2-3 buffer
- **Daily events**: 5-7 buffer
- **Multiple times per day**: 10+ buffer

Setting: `/settings future_min_blocks:5`

### What timezone should I use?

Use [IANA timezone names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) like:
- "America/New_York"
- "Europe/London"
- "Asia/Tokyo"
- "Pacific/Auckland"

Set server default with: `/settings timezone:America/New_York`

### Can different schedules use different timezones?

Yes! Each schedule can have its own timezone specified during creation. If not specified, it uses the server default.

### How do I change the bot's language?

Use `/settings language` and choose English or Français. This affects:
- Bot response messages
- Command descriptions (where Discord supports it)

---

## Technical Questions

### Where is my data stored?

Data is stored locally in a SQLite database on the server hosting the bot. See our [Privacy Policy](legals/PRIVACY_POLICY.md) for details.

### Can I export my schedules?

Currently, there's no export feature. You can view schedules with `/schedule list` and manually record the information.

### What happens to my data if I remove the bot?

When the bot is removed from your server:
- Your data may be retained for up to 30 days
- Events remain on Discord (subject to Discord's policies)
- After 30 days, your data is permanently deleted

### Is my data secure?

We implement standard security practices:
- Restricted database access
- No data sharing with third parties (except Discord API and weather services)
- Regular backups
- See [Privacy Policy](legals/PRIVACY_POLICY.md) for complete details

### Can the bot see my server's messages?

No. The bot only receives:
- Slash commands you send to it
- Events related to scheduled events
- Basic server information (ID, name)

It cannot read your conversations.

---

## Error Messages

### "Missing permissions"

The bot needs "Manage Events" permission. Check:
1. Server Settings → Roles → Bot Role → Permissions
2. Channel Settings → Permissions → Bot Role (for Voice/Stage)

### "Location not found" (weather)

Try:
- Different spelling
- Add country name
- Use a nearby larger city
- Check for typos

### "Invalid duration"

Durations should be like:
- "2h" or "2 hours"
- "1d" or "1 day"
- "30m" or "30 minutes"
- Combined: "2h30m"

### "Invalid time format"

Time should be in HH:MM format (24-hour):
- Correct: "21:00", "09:30", "14:15"
- Incorrect: "9pm", "9:30pm", "25:00"

### "Maximum events reached"

Discord limits servers to 100 scheduled events. To fix:
- Delete old/past events from Discord
- Reduce your buffer size
- Cancel unused schedules

---

## Best Practices

### For Events

- **Test first**: Create a test schedule with short intervals to verify everything works
- **Clear labels**: Make event names descriptive and easy to understand
- **Use descriptions**: Add details about what to expect
- **Set appropriate buffer**: Balance between readiness and not creating too far ahead

### For Templates

- **Weather at start**: Always use `compute_at_start:true` for weather
- **Date formats**: Choose formats your audience understands
- **Counter placement**: Put counters at the start of titles for easy scanning
- **Test placeholders**: Create a test event to verify rendering

### For Server Management

- **Document schedules**: Keep notes on what each schedule is for
- **Regular reviews**: Periodically check and clean up unused schedules
- **Coordinate changes**: Inform members before major schedule changes
- **Backup settings**: Note your configurations in case you need to recreate them

---

## Still Need Help?

If your question isn't answered here:

1. Check the [User Guide](USER_GUIDE.md) for detailed information
2. Review the [Commands Reference](commands/README.md) for syntax
3. Read the [Templates Guide](Templates.md) for placeholder details
4. Contact your server administrator
5. Report issues to the bot developer

---

**Last Updated**: October 25, 2025

For the latest FAQ updates, check the documentation regularly.
