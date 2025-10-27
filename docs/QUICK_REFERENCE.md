# Quick Reference Card

Essential Chronomage commands and syntax at a glance.

---

## Essential Commands

### Create a Schedule
```
/schedule create count:3 bloc:2d start_time:21:00 len:2h location_elsewhere:Online
```

### View Schedules
```
/schedule list
```

### Delete a Schedule
```
/schedule cancel id:your-schedule-id
```

Note: schedule IDs are generated automatically when you create a schedule (the wizard replies with the `scheduleId`). Use that id for `/schedule pause` or `/schedule cancel`.

### Configure Server
```
/settings language:English timezone:America/New_York future_min_blocks:5
```

---

## Templates Quick Setup

### Date Template
```
/variables date format:yyyy-LL-dd timezone:America/New_York step:1d
```
Use in events: `{{date}}`

Tip: You can also configure channel templates so crons rename channels or send messages automatically when variables change. Use `/template channels rename` and `/template channels send`. Channel-name templates should use ««double guillemets»» delimiters for date/count/weather placeholders (example name: `««date»» - Next`).

### Counter Template
```
/variables count start:1 step:1 decimal:0
```
Use in events: `{{count}}`

### Weather Template
```
/variables weather location:London compute_at_start:true
```
Use in events: `{{weather:emoji}}` `{{weather:short}}` `{{weather:long}}`

---

## Duration Formats

| Format | Meaning |
|--------|---------|
| `2h` | 2 hours |
| `30m` | 30 minutes |
| `1d` | 1 day |
| `1w` | 1 week |
| `2h30m` | 2 hours 30 minutes |
| `1d12h` | 1 day 12 hours |

---

## Time Format

Always use 24-hour format:
- ✅ `21:00` (9 PM)
- ✅ `09:30` (9:30 AM)
- ✅ `14:15` (2:15 PM)
- ❌ `9pm` (incorrect)
- ❌ `9:30pm` (incorrect)

---

## Common Timezones

| Region | Timezone |
|--------|----------|
| US East | `America/New_York` |
| US West | `America/Los_Angeles` |
| US Central | `America/Chicago` |
| UK | `Europe/London` |
| France | `Europe/Paris` |
| Japan | `Asia/Tokyo` |
| Australia | `Australia/Sydney` |

[Full list →](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## Date Format Tokens

| Token | Example | Description |
|-------|---------|-------------|
| `f` | 10/25/2025, 9:00 PM | Short |
| `FF` | Saturday, October 25, 2025, 9:00 PM EDT | Full |
| `yyyy-LL-dd` | 2025-10-25 | ISO date |
| `yyyy-LL-dd HH:mm` | 2025-10-25 21:00 | ISO with time |
| `DDD` | October 25, 2025 | Long date |
| `D` | 10/25/2025 | Short date |

[Full list →](https://moment.github.io/luxon/#/formatting)

---

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{date}}` | Formatted date | 2025-10-25 |
| `{{count}}` | Counter | 1, 2, 3... |
| `{{weather:emoji}}` | Weather emoji | ☀️ 🌧️ |
| `{{weather:short}}` | Short weather | Sunny, 25°C |
| `{{weather:long}}` | Full weather | Sunny with high of 25°C |

---

## Schedule Parameters

| Parameter | Required | Type | Example |
|-----------|----------|------|---------|
| `count` | ✅ Yes | Number | `3` |
| `bloc` | ✅ Yes | Duration | `2d` |
| `start_time` | ✅ Yes | HH:MM | `21:00` |
| `len` | ✅ Yes | Duration | `2h` |
| `location_elsewhere` | One of these | Text | `Online` |
| `location_channel` | One of these | Channel | #voice |
| `start_date` | ❌ No | Date | `2025-10-25` |
| `timezone` | ❌ No | IANA | `Europe/Paris` |

---

## Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Bot not responding | Check permissions: "Manage Events" |
| Events not created | Check buffer: `/settings future_min_blocks:5` |
| Placeholder not working | Configure template: `/variables date` |
| Weather not found | Try: "London, UK" instead of "London" |
| Wrong time | Set timezone: `/settings timezone:America/New_York` |
| Can't use command | Need "Manage Events" permission |

---

## Examples

### Weekly Game Night
```
/schedule create count:3 bloc:1w start_time:20:00 len:3h location_elsewhere:Discord timezone:America/New_York
```
Labels:
1. "🎮 Game Night - Mario Kart"
2. "🎮 Game Night - Among Us"
3. "🎮 Game Night - Minecraft"

### Daily Show with Episode Counter
```
/variables count start:1 step:1
/schedule create count:1 bloc:1d start_time:21:00 len:1h location_elsewhere:Twitch
```
Label: "Daily Show - Episode {{count}}"

### Weekly Meeting with Date
```
/variables date format:yyyy-LL-dd timezone:America/New_York
/schedule create count:1 bloc:1w start_time:14:00 len:1h location_channel:#meetings
```
Label: "Weekly Team Meeting - {{date}}"

### Weather-Based Event
```
/variables weather location:London compute_at_start:true
/schedule create count:1 bloc:1d start_time:08:00 len:30m location_elsewhere:Park
```
Description: "Morning walk! Today's weather: {{weather:long}}"

---

## Getting Help

📖 [User Guide](./user-guide/README.md) - Complete documentation  
🔧 [Commands](commands/README.md) - Full command reference  
❓ [FAQ](resources/README.md) - Common questions  
🔍 [Troubleshooting](resources/TROUBLESHOOTING.md) - Problem solving  
