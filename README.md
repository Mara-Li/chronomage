# Chronomage — Discord Scheduling Bot (TypeScript)

Chronomage is a Discord bot that helps you plan recurring events, auto-fill event titles/descriptions with dynamic placeholders (date, counters, weather), and manage schedules with a simple slash-command and a guided modal wizard.

It is built on discord.js v14, TypeScript, Enmap (SQLite), Cron jobs, and i18next for localization.

## Documentation

📚 **[Complete Documentation](docs/README.md)** - All documentation in one place

**For Users:**
- 📖 [User Guide](docs/USER_GUIDE.md) - Complete guide to using Chronomage
- 🔧 [Commands Reference](docs/Commands.md) - Quick reference for all commands
- 📝 [Templates Guide](docs/Templates.md) - Using placeholders and dynamic content

**Legal:**
- 🔒 [Privacy Policy](docs/legals/PRIVACY_POLICY.md) - How we handle your data
- 📜 [Terms of Service](docs/legals/TERMS_OF_SERVICE.md) - Rules and responsibilities

**For Developers:**
- Continue reading below for setup and technical information


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


## Requirements
- Node.js 20.x (per package.json engines)
- A Discord application and bot token
- pnpm (recommended) or npm
- Optional (production): pm2


## Quick start
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


## Configuration (.env)
- DISCORD_TOKEN: Bot token from the Bot tab
- CLIENT_ID: Application Client ID (used during ready phase)
- Optional: ENV=production (used by the dev:prod script)


## Data storage
- Enmap (SQLite) stores per-guild settings at data/enmap.sqlite (and companions)
- Stored data include:
  - templates (date, count, weather)
  - schedules (recurring definitions)
  - events (rows mirroring created Discord Scheduled Events)
  - global settings (bot language, default time zone, future buffer size)


## Localization
- English (default) and French are bundled
- Command names/descriptions are localized where possible
- Bot responses follow the guild or global language setting


## Slash commands overview

- /weather
  - Quickly fetch a plain-text weather description for a city
  - Options: location (string), timezone (string)

- /settings
  - Global settings for this guild
  - Subcommands:
    - language: set bot language (English/French)
    - timezone: set default time zone used in date rendering
    - future_min_blocks: how many upcoming events to keep created ahead of time

- /variables
  - Manage template variables used by placeholders
  - Subcommands:
    - date: configure display format, time zone, update cron, start value and step
    - count: configure start, step, decimals, update cron
    - weather: configure default location and whether to compute at event start

- /schedule
  - Create and manage recurring Scheduled Events cycles
  - Subcommands:
    - create: define a cycle (interval, start time, length, location) and go through a modal wizard to set labels/descriptions/banners per event
    - list: list active cycles and show a few upcoming events
    - pause: stop creating new future events for a cycle (existing ones remain)
    - cancel: delete a cycle and purge its future events from local storage (also deletes linked events in Discord if applicable)


## Placeholders you can use
You can include placeholders in event names and descriptions. They will be computed either when the event is created in the buffer or when it goes active, depending on your template’s “compute_at_start” option.

- {{date}}
  - Uses your date template (format, timezone, current value)
  - The date template’s current value is advanced by its cron/step via a background job

- {{count}}
  - Uses your configured counter (start, step, decimals)
  - The counter is advanced by cron/step via a background job

- {{weather:emoji}}, {{weather:short}}, {{weather:long}}
  - Pulls a description for the configured city
  - The emoji variant inserts only a weather icon; short/long insert texts

Compute moment:
- If a template has compute_at_start=true, the value is computed when the event transitions to Active (or on certain updates), not at buffer creation time.
- Otherwise, the value is resolved when the future event is created in the buffer.


## Scheduling engine in a nutshell
- A schedule defines a repeating “block” (e.g., every 48h) with a daily start time (e.g., 21:00) and an event length (e.g., 2h)
- Labels rotate over blocks (e.g., [A, B, C] → block 0 = A, 1 = B, 2 = C, 3 = A, …)
- For each active schedule, a minute-based background sweep keeps at least N future events created on Discord (N = future_min_blocks, default 2)
- Created events are recorded in local storage with snapshots of label/description/location

Key inputs (from /schedule create):
- count: number of distinct labels you’ll define in the wizard
- bloc: interval between successive events (localized duration, e.g., “2d”, “48h”, “1 semaine”)
- start_time: daily local time (HH:MM) when each block starts
- len: duration of each event (e.g., “2h”)
- start_date (optional): first day for the cycle; defaults to today in the chosen time zone
- timezone (optional): IANA name, e.g., “Europe/Paris”
- location: either a plain-text location (External event) or a Stage/Voice channel

Wizard flow:
- You will be prompted per event label:
  - Label (required)
  - Description (optional; placeholders supported)
  - Banner image (optional)
- After finishing, the bot saves the cycle and asynchronously fills the future buffer


## Variable templates
- Date template
  - format: a Luxon format token (e.g., f, FF, yyyy-LL-dd HH:mm)
  - timezone: default zone for rendering
  - cron: when to advance the current value (standard cron string)
  - start: initial date/time (uses your format for input)
  - step: duration added each tick (localized duration; e.g., “1d”, “2h30m”)
  - compute_at_start: compute on event activation if true

- Count template
  - start, step, decimal, cron
  - compute_at_start: compute on event activation if true

- Weather template
  - location: default city
  - compute_at_start: compute on event activation if true


## Durations and locales
- Human durations are parsed with locale-aware rules (e.g., “2h”, “2 hours”, “2 heures”)
- Supported bases: en, fr, es, de, pt, ru, ja, zh


## Permissions needed
- applications.commands scope (slash commands)
- bot scope with at least:
  - Manage Events (to create/edit Scheduled Events)
  - For Stage/Voice events: appropriate channel permissions to create events


## Troubleshooting
- My commands don’t show up
  - Ensure the bot is in your guild and has applications.commands
  - Wait a minute after startup—commands are registered per guild on ready
- Events aren’t appearing
  - Check that the schedule is active and future_min_blocks > 0 (/settings)
  - Verify location is valid (External string or a Stage/Voice channel)
  - Make sure the bot has permission to create Scheduled Events
- Placeholders don’t resolve
  - Check the relevant template configuration under /variables
  - If compute_at_start is enabled, the value resolves when the event goes Active
- Time zone/format issues
  - Set the default time zone with /settings timezone and review the date template’s format


## Scripts reference
- pnpm dev: run in watch mode with ts-node-dev
- pnpm build: type-check and build with esbuild into dist/
- pnpm start: start the built bot under pm2 (process name: chronomage)
- pnpm restart/stop/delete: pm2 lifecycle helpers
- pnpm dev:prod: like dev but with ENV=production


## License
GNU GPLv3 — see LICENSE for details.
