## First-Time Setup

### Step 1: Verify Bot is Online

What to look for:
- Bot appears in your server's member list (right sidebar)
- Status shows as "Online" (green dot)
- If offline, contact the bot administrator

### Step 2: Check Slash Commands

How to access:
1. Type `/` in any channel
2. Look for Chronomage's commands in the popup menu
3. You should see commands like:
   - `/schedule`
   - `/settings`
   - `/variables`
   - `/weather`

If commands don't appear:
- Wait 5-10 minutes after bot joins
- Refresh Discord (Ctrl+R or Cmd+R)
- Check bot was invited with `applications.commands` scope

### Step 3: Configure Server Settings

Command to use:
```
/settings
```

You'll see three options:
1. **language** - Choose "English" or "Français"
2. **timezone** - Enter IANA timezone (e.g., "America/New_York")
3. **future_min_blocks** - Enter number (e.g., "5")

Example:
```
/settings language:English timezone:America/New_York future_min_blocks:5
```

Bot response:
- Success message confirming your settings
- Message will be in the language you selected
