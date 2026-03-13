# Chronomage — Discord Scheduling Bot (TypeScript)

Chronomage is a Discord bot that helps you plan recurring events, auto-fill event titles/descriptions with dynamic placeholders (date, counters, weather), and manage schedules with a simple slash-command and a guided modal wizard.

It is built on discord.js, TypeScript, Enmap (SQLite), Cron jobs, and i18next for localization.

## Highlights
- Recurring events generator using Discord Scheduled Events
- Smart buffer: always keep a configurable number of upcoming events created
- Dynamic placeholders you can use in event titles/descriptions:
  - `{{date}}`, `{{count}}`, `{{weather:emoji}}`, `{{weather:short}}`, `{{weather:long}}`
- Configurable variables/templates for date, counters, and weather
- Slash commands for quick weather info and all bot settings
- Guided creation wizard with per-event label, optional description, and optional banner image
- Multi-language (English and French out of the box)
- TypeScript-first with simple persistence (Enmap/SQLite)


## Dev
### Requirements
- Node.js 24.14 (per package.json engines)
- A Discord application and bot token
- pnpm (recommended) or npm
- Optional (production): pm2

### Quick start
1) Clone and install

```cmd
git clone <your-fork-or-repo-url>
cd chronomage
pnpm install
```

2) Configure your environment

Create a .env file in the project root (you can copy from .env.example):

```
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-application-client-id-here
```

3) Invite the bot to your server
- In the Discord Developer Portal, open your application → OAuth2 → URL Generator
- Scopes: bot, applications.commands
- Permissions: at minimum “Manage Events”; if you create events in voice/stage channels, also ensure channel permissions allow the bot to create Scheduled Events
- Open the generated URL and add the bot to your guild

4) Run in development

```cmd
pnpm dev
```

The bot loads commands for all guilds it is in and starts a background job that maintains the future-events buffer.

5) Build and run in production (with pm2)

```cmd
pnpm build
pnpm start    REM starts via pm2 as "chronomage"
```

Useful pm2 scripts:

```cmd
pnpm restart
pnpm stop
pnpm delete
```


### Configuration (.env)
- DISCORD_TOKEN: Bot token from the Bot tab
- CLIENT_ID: Application Client ID (used during ready phase)
- Optional: ENV=production (used by the dev:prod script)


### Data storage
- Enmap (SQLite) stores per-guild settings at data/enmap.sqlite (and companions)
- Stored data include:
  - templates (date, count, weather)
  - schedules (recurring definitions)
  - events (rows mirroring created Discord Scheduled Events)
  - global settings (bot language, default time zone, future buffer size)

### Localization
- English (default) and French are bundled
- Command names/descriptions are localized where possible
- Bot responses follow the guild or global language setting
