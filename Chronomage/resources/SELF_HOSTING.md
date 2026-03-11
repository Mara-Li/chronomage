# Self-Hosting Guide

Host your own instance of Chronomage.

## Prerequisites

### Required software
- **Node.js** v20.x or higher ([Download](https://nodejs.org/))
- **pnpm** package manager ([Install](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/downloads))

### Discord setup
- A Discord account with server administrator access
- A Discord application and bot token ([Developer Portal](https://discord.com/developers/applications))

### Optional (recommended for production)
- **PM2** process manager
- A VPS or dedicated server for 24/7 uptime

---

## Step 1: Create a Discord application

1. Go to https://discord.com/developers/applications and click **New Application**
2. Navigate to **Bot** → click **Add Bot**
3. Copy the **Bot Token** — keep it secret
4. Go to **General Information** → copy the **Application ID**

[SCREENSHOT]

---

## Step 2: Install Chronomage

```bash
git clone https://github.com/Mara-Li/chronomage.git
cd chronomage
pnpm install
```

---

## Step 3: Configure environment variables

Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
```

> ⚠️ Never commit `.env` to version control.

---

## Step 4: Invite the bot

1. Discord Developer Portal → your application → **OAuth2** → **URL Generator**
2. Scopes: `bot`, `applications.commands`
3. Permissions: **Manage Events** (minimum); add **Manage Channels** for auto-renaming
4. Copy the generated URL, open it in a browser, and authorize for your server

[SCREENSHOT]

---

## Step 5: Run the bot

### Development mode

```bash
pnpm dev
```

Test with `/schedule list` in your Discord server.

### Production mode (PM2)

```bash
pnpm build
pnpm start        # starts via PM2 as "chronomage"

pm2 status
pm2 logs chronomage

pnpm stop
pnpm restart
pnpm delete
```

---

## Step 6: Verify installation

1. Check the bot is Online in the server member list
2. Test: `/weather location:London`
3. Configure: `/settings language:English timezone:America/New_York future_min_blocks:3`
4. Create a test schedule: `/schedule create count:2 bloc:1d start_time:12:00 len:1h location_elsewhere:Test`

---

## Troubleshooting installation

**Bot won't start:**
```bash
node --version   # must be v20.x+
```
Reinstall dependencies:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Bot shows as offline:** Verify the `.env` token is correct. Reset the token in the Developer Portal if needed.

**Commands don't appear:** Wait 5 minutes and restart Discord. Re-invite with `applications.commands` scope if needed.

**Permission errors:** Grant **Manage Events** in Server Settings → Roles → Bot role.

---

## Keeping the bot updated

```bash
git pull origin main
pnpm install       # if package.json changed
pnpm build
pnpm restart
```

---

## Resource requirements

| | Minimum | Recommended |
|--|---------|-------------|
| RAM | 512 MB | 1 GB |
| CPU | 1 core | 1–2 cores |
| Disk | 500 MB | 2 GB |

---

## Database management

Data is stored in `data/enmap.sqlite`.

**Backup:**
```bash
cp data/enmap.sqlite data/enmap.sqlite.backup
```

**Restore:**
```bash
pnpm stop
cp data/enmap.sqlite.backup data/enmap.sqlite
pnpm start
```

---

## Security best practices

1. Never share or commit your bot token
2. Keep dependencies updated: `pnpm update`
3. Back up `data/enmap.sqlite` regularly
4. Monitor logs: `pm2 logs chronomage`
5. No inbound ports needed — the bot connects outbound to Discord (HTTPS 443)

---

For usage questions (not installation), see the [User Guide](../user-guide/README.md).
