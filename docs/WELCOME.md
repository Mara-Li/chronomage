# Welcome to Chronomage! 🎉

Thank you for adding Chronomage to your Discord server! This bot will help you automate recurring scheduled events with dynamic content.

## Quick Start Guide

### 1️⃣ Give Chronomage Permissions

Make sure the bot has:
- ✅ **Manage Events** and **Manage channels** permission
- ✅ Channel permissions for Voice/Stage events (if needed)

### 2️⃣ Configure Your Server

Set up basic settings:

```
/settings language: English
/settings timezone: America/New_York
/settings future_min_blocks: 3
```

*Replace with your preferred language, timezone, and buffer size.*

### 3️⃣ Create Your First Schedule

Try creating a simple recurring event:

```
/schedule create count:2 bloc:1w start_time:19:00 len:2h location_elsewhere:Online
```

This creates a weekly event at 7 PM lasting 2 hours.

Follow the wizard to add your event labels!

### 4️⃣ Explore Templates (Optional)

Add dynamic content to your events:

**Date placeholder:**
```
/variables date format:yyyy-LL-dd timezone:America/New_York step:1d
```

Then use `{{date}}` in your event titles!

**Counter placeholder:**
```
/variables count start:1 step:1
```

Then use `{{count}}` in your event titles (e.g., "Episode {{count}}")!

**Weather placeholder:**
```
/variables weather location:London compute_at_start:true
```

Then use `{{weather:short}}` or `{{weather:long}}` in your event descriptions!

## Next Steps

📖 **[Read the Full User Guide](docs/USER_GUIDE.md)** - Learn everything about Chronomage

🔧 **[Commands Reference](docs/Commands.md)** - Quick command syntax reference

📝 **[Templates Guide](docs/Templates.md)** - Master placeholders and dynamic content

## Need Help?

- Use `/schedule list` to view your schedules
- Use `/variables date` (or `count`/`weather`) to see current settings
- Check the [FAQ](docs/USER_GUIDE.md#frequently-asked-questions) for common questions
- Contact your server administrator for support

## Important Links

- 🔒 [Privacy Policy](docs/PRIVACY_POLICY.md) - How we protect your data
- 📜 [Terms of Service](docs/TERMS_OF_SERVICE.md) - Usage rules and guidelines

---

## Example: Weekly Game Night

Here's a complete example to get you started:

**1. Create the schedule:**
```
/schedule create count:3 bloc:1w start_time:20:00 len:3h location_elsewhere:Discord Voice timezone:America/New_York
```

**2. In the wizard, add these labels:**
- Label 1: "🎮 Game Night - Mario Kart Tournament"
- Label 2: "🎮 Game Night - Among Us"
- Label 3: "🎮 Game Night - Minecraft Build Challenge"

**3. Done!** The bot will now rotate through these three events every week at 8 PM.

---

**Enjoy using Chronomage!** 🚀

For questions, feedback, or issues, please contact the bot administrator or developer.
