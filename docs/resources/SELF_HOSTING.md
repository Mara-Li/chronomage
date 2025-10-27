# Self-Hosting Guide

Want to host your own instance of Chronomage? This guide will walk you through the process.

## Prerequisites

Before you begin, you'll need:

### Required Software
- **Node.js** version 20.x or higher ([Download](https://nodejs.org/))
- **pnpm** package manager ([Installation](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/downloads))

### Discord Setup
- A Discord account
- Server administrator access (to invite the bot)
- A Discord application and bot token ([Create one](https://discord.com/developers/applications))

### Optional (Recommended for Production)
- **PM2** for process management (installed via npm)
- Basic command line knowledge
- A server or VPS for 24/7 hosting

---

## Step 1: Create Discord Application

1. **Go to Discord Developer Portal**
   - Visit https://discord.com/developers/applications
   - Log in with your Discord account

2. **Create New Application**
   - Click "New Application"
   - Give it a name (e.g., "Chronomage")
   - Accept the Terms of Service
   - Click "Create"

3. **Create Bot**
   - Go to the "Bot" tab
   - Click "Add Bot"
   - Confirm "Yes, do it!"
   - **Copy the bot token** (you'll need this later)
   - ⚠️ Keep this token secret! Never share it publicly

4. **Configure Bot Settings**
   - Under "Privileged Gateway Intents":
     - Enable "Server Members Intent" (optional, for better error logging)
     - Enable "Message Content Intent" is NOT required
   - Save changes

5. **Get Application ID**
   - Go to the "General Information" tab
   - Copy the "Application ID" (you'll need this later)

---

## Step 2: Download and Install Chronomage

### Option A: Clone from GitHub (Recommended)

```powershell
# Navigate to your desired directory
cd C:\Users\YourUsername\Documents

# Clone the repository
git clone https://github.com/Mara-Li/chronomage.git

# Navigate into the directory
cd chronomage

# Install dependencies
pnpm install
```

### Option B: Download ZIP

1. Download the repository as ZIP from GitHub
2. Extract to your desired location
3. Open PowerShell in the extracted folder
4. Run `pnpm install`

---

## Step 3: Configure Environment Variables

1. **Create `.env` file**
   - In the `chronomage` directory, create a file named `.env`
   - Or copy the example: `Copy-Item .env.example .env`

2. **Edit `.env` file**
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_application_id_here
   ```

   Replace:
   - `your_bot_token_here` with the bot token from Step 1
   - `your_application_id_here` with the Application ID from Step 1

3. **Save the file**

⚠️ **Important**: Never commit the `.env` file to version control!

---

## Step 4: Invite Bot to Your Server

1. **Generate Invite URL**
   - Go back to Discord Developer Portal
   - Select your application
   - Go to "OAuth2" → "URL Generator"

2. **Select Scopes**
   - Check `bot`
   - Check `applications.commands`

3. **Select Permissions**
   - Check `Manage Events` (required)
   - You can also select "Administrator" for simplicity (not recommended for production)

4. **Copy and Use URL**
   - Copy the generated URL at the bottom
   - Paste it in your browser
   - Select your server
   - Click "Authorize"

---

## Step 5: Run the Bot

### Development Mode (Testing)

```powershell
# Run in development mode (auto-restarts on code changes)
pnpm dev
```

The bot should come online! Test it with `/schedule list` in your Discord server.

Press `Ctrl+C` to stop the bot.

### Production Mode (24/7 Running)

```powershell
# Build the project
pnpm build

# Start with PM2 (process manager)
pnpm start

# Check status
pm2 status

# View logs
pm2 logs chronomage

# Stop the bot
pnpm stop

# Restart the bot
pnpm restart
```

---

## Step 6: Verify Installation

1. **Check bot is online**
   - Look for the bot in your server's member list
   - Should show as "Online"

2. **Test basic command**
   ```
   /weather location:London
   ```

3. **Check slash commands**
   - Type `/` in Discord
   - You should see Chronomage's commands

4. **Configure server**
   ```
   /settings language:English timezone:America/New_York future_min_blocks:3
   ```

5. **Create a test schedule**
   ```
   /schedule create count:2 bloc:1d start_time:12:00 len:1h location_elsewhere:Test
   ```

If everything works, congratulations! 🎉

---

## Troubleshooting Installation

### Bot won't start

**Check Node.js version:**
```powershell
node --version
```
Should be v20.x or higher.

**Reinstall dependencies:**
```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item pnpm-lock.yaml
pnpm install
```

### Bot shows as offline

**Check token:**
- Verify `.env` has correct token
- Token should be one long string, no spaces
- Make sure you copied the token, not the Application ID

**Check bot settings:**
- Go to Discord Developer Portal
- Bot tab → Reset token if needed
- Update `.env` with new token

### Commands don't appear

**Wait a few minutes:**
- Slash commands can take up to 5 minutes to register
- Restart Discord

**Re-invite bot:**
- Use the invite URL again
- Make sure `applications.commands` scope is checked

### Permission errors

**Check bot role:**
- Server Settings → Roles
- Find bot's role
- Enable "Manage Events"

**Check channel permissions (for Voice/Stage):**
- Right-click channel → Edit Channel
- Permissions → Add bot role
- Enable "Manage Events"

---

## Keeping Your Bot Updated

### Update from Git

```powershell
# Pull latest changes
git pull origin main

# Reinstall dependencies (if package.json changed)
pnpm install

# Rebuild
pnpm build

# Restart
pnpm restart
```

### Check for updates

```powershell
# Check current version
git log -1

# Check remote version
git fetch
git log origin/main -1
```

---

## Production Hosting Recommendations

### For 24/7 Uptime

Consider hosting on:
- **VPS** (Virtual Private Server): DigitalOcean, Linode, Vultr
- **Cloud Platforms**: AWS, Google Cloud, Azure
- **Dedicated Hosting**: OVH, Hetzner
- **Home Server**: If you have reliable internet and power

### Resource Requirements

**Minimum:**
- 512 MB RAM
- 1 CPU core
- 500 MB disk space

**Recommended:**
- 1 GB RAM
- 1-2 CPU cores
- 2 GB disk space

### Security Best Practices

1. **Never share your bot token**
   - Keep `.env` file private
   - Don't commit to Git
   - Don't share in screenshots

2. **Use environment variables**
   - Never hardcode tokens in code
   - Use `.env` for configuration

3. **Keep dependencies updated**
   ```powershell
   pnpm update
   ```

4. **Regular backups**
   - Backup `data/enmap.sqlite` regularly
   - Store backups securely

5. **Monitor bot logs**
   ```powershell
   pm2 logs chronomage
   ```

---

## Firewall Configuration

If running on a server, you typically **don't** need to open any ports for a Discord bot. The bot connects outbound to Discord's servers.

However, ensure:
- **Outbound HTTPS (443)** is allowed
- **Outbound HTTP (80)** is allowed (for weather API)

---

## Database Management

Chronomage uses SQLite for data storage.

### Backup Database

```powershell
# Create backup
Copy-Item data\enmap.sqlite data\enmap.sqlite.backup
```

### Restore Database

```powershell
# Stop bot
pnpm stop

# Restore backup
Copy-Item data\enmap.sqlite.backup data\enmap.sqlite

# Start bot
pnpm start
```

### View Database (Optional)

Use SQLite browser:
- Download [DB Browser for SQLite](https://sqlitebrowser.org/)
- Open `data/enmap.sqlite`
- View/edit data (advanced users only)

---

## Common Configuration Changes

### Change Bot Language

No code changes needed - use in Discord:
```
/settings language:English
```
or
```
/settings language:Français
```

### Modify Default Settings

Edit directly in Discord per server using `/settings` command.

### Multiple Bot Instances

To run multiple instances:
1. Create separate Discord applications
2. Clone the repository to different directories
3. Use different `.env` files
4. Each instance has separate data

---

## Uninstalling

To completely remove Chronomage:

```powershell
# Stop the bot
pnpm stop

# Delete PM2 process
pnpm delete

# Remove the bot from Discord servers (via Discord)

# Delete the directory
cd ..
Remove-Item chronomage -Recurse -Force
```

---

## Getting Help

If you encounter issues during installation:

1. **Check the logs**
   ```powershell
   pm2 logs chronomage
   ```

2. **Review documentation**
   - [User Guide](USER_GUIDE.md)
   - [Troubleshooting](resources/TROUBLESHOOTING.md)
   - [FAQ](README.md)

3. **Check GitHub Issues**
   - See if others had similar problems
   - Search closed issues for solutions

4. **Ask for help**
   - Open a GitHub issue
   - Include error messages and logs
   - Describe steps you've tried

---

## Additional Resources

- **Discord Developer Docs**: https://discord.com/developers/docs
- **Discord.js Guide**: https://discordjs.guide/
- **Node.js Documentation**: https://nodejs.org/docs/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/

---

**Congratulations on self-hosting Chronomage!** 🚀

For questions specific to using the bot (not installation), see the [User Guide](USER_GUIDE.md).

**Last Updated**: October 25, 2025
