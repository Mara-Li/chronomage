## First-Time Setup

### Step 1: Verify the bot is online

[SCREENSHOT]

- The bot appears in your server's member list (right sidebar)
- Status shows as Online (green dot)
- If offline, contact the bot administrator

### Step 2: Check slash commands

1. Type `/` in any channel
2. Look for Chronomage commands in the popup:
   - `/schedule`
   - `/settings`
   - `/variables`
   - `/weather`

[SCREENSHOT]

If commands don't appear:
- Wait 5–10 minutes after the bot joins
- Refresh Discord (Ctrl+R or Cmd+R)
- Check the bot was invited with the `applications.commands` scope

### Step 3: Configure server settings

```
/settings language:English
/settings timezone:America/New_York
/settings future_min_blocks:3
```

[SCREENSHOT]

The bot replies with a confirmation message in the selected language.
