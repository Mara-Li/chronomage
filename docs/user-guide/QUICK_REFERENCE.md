# Quick Reference
Essential Chronomage commands and syntax at a glance.

## [Schedule](commands/schedule.md)
> [!example]
> - `/schedule create count:3 bloc:2d start_time:21:00 len:2h location_elsewhere:Online`
> - `/schedule list`
> - `/schedule pause id:your-schedule-id`
> - `/schedule cancel id:your-schedule-id`
> - `/schedule cancel id:all`
> - `/schedule edit config id:your-schedule-id start_time:20:00`
> - `/schedule edit blocs id:your-schedule-id count:3`

---

## [Settings](commands/settings.md)
> [!example]
> - `/settings language:English`
> - `/settings timezone:America/New_York`
> - `/settings future_min_blocks:5`
> - `/settings autorename_channel:true`


---

## [Templates](user-guide/Templates.md)
### Date
> [!example]
> `/variables config date format:yyyy-LL-dd timezone:America/New_York step:1d`

Use in events: `{{date}}`

### Counter
> [!example]
> `/variables config count start_number:1 step:1 decimal:0`

Use in events: `{{count}}`

### Weather
> [!example]
> `/variables config weather location:London compute_at_start:true`

Use in events: `{{weather:emoji}}` `{{weather:short}}` `{{weather:long}}`

### Channel
> [!example]
> `/variables channel rename channel:#my-channel text:Session §count§ — §date§`
> `/variables channel send channel:#announcements text:Weather update: §weather-long§`
> `/variables channel display`

Channel templates use `§` instead of `{{}}`.

---

## Duration formats
| Format | Meaning |
|--------|---------|
| `2h` | 2 hours |
| `30m` | 30 minutes |
| `1d` | 1 day |
| `1w` | 1 week |
| `2h30m` | 2 hours 30 minutes |
| `1d12h` | 1 day 12 hours |

Localized durations are supported (e.g., `2 heures`, `2 hours`).

---

## Time format
Always use 24-hour HH:MM:
- ✅ `21:00` (9 PM)
- ✅ `09:30` (9:30 AM)
- ❌ `9pm`

---

## Common time zones
| Region | Time zone |
|--------|-----------|
| US East | `America/New_York` |
| US West | `America/Los_Angeles` |
| US Central | `America/Chicago` |
| UK | `Europe/London` |
| France | `Europe/Paris` |
| Japan | `Asia/Tokyo` |
| Australia | `Australia/Sydney` |

[Full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## Date format tokens (Luxon)
| Token | Example output |
|-------|----------------|
| `f` | 10/25/2025, 9:00 PM |
| `FF` | Saturday, October 25, 2025, 9:00 PM EDT |
| `yyyy-LL-dd` | 2025-10-25 |
| `yyyy-LL-dd HH:mm` | 2025-10-25 21:00 |
| `DDD` | October 25, 2025 |
| `D` | 10/25/2025 |

[Full Luxon reference](https://moment.github.io/luxon/#/formatting)

---

## Placeholders
| Placeholder         | Description                             |
| ------------------- | --------------------------------------- |
| `{{date}}`          | Formatted date from the date template   |
| `{{count}}`         | Numeric counter from the count template |
| `{{weather:emoji}}` | Weather icon                            |
| `{{weather:short}}` | Short weather description               |
| `{{weather:long}}`  | Full weather description                |

Channel templates use `§date§`, `§count§`, `§weather-emoji§`, `§weather-short§`, `§weather-long§`.

---

## Schedule parameters
| Parameter | Required | Type | Example |
|-----------|----------|------|---------|
| `count` | ✅ | Number (1–20) | `3` |
| `bloc` | ✅ | Duration | `2d` |
| `start_time` | ✅ | HH:MM | `21:00` |
| `len` | ✅ | Duration | `2h` |
| `location_elsewhere` | One of these | Text | `Online` |
| `location_channel` | One of these | Channel | `#stage` |
| `start_date` | ❌ | Date | `2025-10-25` |
| `timezone` | ❌ | IANA | `Europe/Paris` |

---

## Quick troubleshooting
| Problem | Quick fix |
|---------|-----------|
| Bot not responding | Check "Manage Events" permission |
| Events not created | Check buffer: `/settings future_min_blocks:5` |
| Placeholder not working | Configure template: `/variables config date` |
| Weather not found | Try `London, UK` instead of `London` |
| Wrong time | Set timezone: `/settings timezone:America/New_York` |

---

## Examples
### Weekly game night
> [!example]
> `/schedule create count:3 bloc:1w start_time:20:00 len:3h location_elsewhere:Discord timezone:America/New_York`

Labels:
1. `🎮 Game Night - Mario Kart`
2. `🎮 Game Night - Among Us`
3. `🎮 Game Night - Minecraft`

### Daily show with episode counter
> [!example]
> `/variables config count start_number:1 step:1`
> `/schedule create count:1 bloc:1d start_time:21:00 len:1h location_elsewhere:Twitch`

Label: `Daily Show - Episode {{count}}`

### Weekly meeting with date
> [!example]
> `/variables config date format:yyyy-LL-dd timezone:America/New_York`
> `/schedule create count:1 bloc:1w start_time:14:00 len:1h location_channel:#meetings`

Label: `Weekly Team Meeting - {{date}}`

### Weather-based event
> [!example]
> `/variables config weather location:London compute_at_start:true`
> `/schedule create count:1 bloc:1d start_time:08:00 len:30m location_elsewhere:Park`

Description: `Morning walk! Today's weather: {{weather:long}}`
