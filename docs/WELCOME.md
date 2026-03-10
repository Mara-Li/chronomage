# Welcome to Chronomage! 🎉

Chronomage automates recurring Discord Scheduled Events with dynamic content (dates, counters, weather).

## Quick start

### 1. Grant permissions

Make sure the bot has:
- ✅ **Manage Events** permission
- ✅ **Manage Channels** permission (only needed for channel auto-renaming)
- ✅ Channel permissions for Voice/Stage events (if applicable)

[SCREENSHOT]

### 2. Configure your server

```
/settings language:English
/settings timezone:America/New_York
/settings future_min_blocks:3
```

### 3. Create your first schedule

```
/schedule create count:2 bloc:1w start_time:19:00 len:2h location_elsewhere:Online
```

This creates a weekly event at 7 PM lasting 2 hours. Follow the wizard to add your labels.

[SCREENSHOT]

### 4. (Optional) Add dynamic content

**Date placeholder:**
```
/variables config date format:yyyy-LL-dd timezone:America/New_York step:1d
```
Use `{{date}}` in event titles.

**Counter placeholder:**
```
/variables config count start_number:1 step:1
```
Use `{{count}}` in event titles (e.g., `Episode {{count}}`).

**Weather placeholder:**
```
/variables config weather location:London compute_at_start:true
```
Use `{{weather:short}}` or `{{weather:long}}` in descriptions.

---

## Example: weekly game night

**1. Create the schedule:**
```
/schedule create count:3 bloc:1w start_time:20:00 len:3h location_elsewhere:Discord Voice timezone:America/New_York
```

**2. In the wizard, enter these labels:**
- `🎮 Game Night - Mario Kart Tournament`
- `🎮 Game Night - Among Us`
- `🎮 Game Night - Minecraft Build Challenge`

**3. Done!** The bot rotates through these three events weekly at 8 PM.

---

📖 [User Guide](user-guide/README.md) · ⚡ [Quick Reference](QUICK_REFERENCE.md) · 🔧 [Commands](commands/README.md)

🔒 [Privacy Policy](legals/PRIVACY_POLICY.md) · 📜 [Terms of Service](legals/TERMS_OF_SERVICE.md)
