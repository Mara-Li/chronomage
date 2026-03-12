# Getting Started

> [!usage]
> test

## What is Chronomage?
Chronomage is a Discord bot that automatically creates and manages recurring Discord Scheduled Events. Define a pattern once and the bot generates future events automatically, rotating through labels you define.

## Key features
- Recurring event automation with configurable block intervals
- Smart buffer: always keeps a configurable number of future events created
- Dynamic placeholders: `{{date}}`, `{{count}}`, `{{weather:*}}`
- Channel auto-rename and auto-message on template updates
- Multiple languages (English and French)
- Guided creation wizard

## Required permissions
The bot requires **Manage Events** to use all schedule and template commands. **Manage Channels** is optional and only needed for auto-channel renaming.

For events in Voice or Stage channels, the bot also needs the appropriate channel-level permissions.

## Inviting the bot
Contact the bot administrator for an invite link. The invite must include:
- Scopes: `bot`, `applications.commands`
- Permission: **Manage Events**

## First steps
Configure your server then create your first schedule:

```md
/settings language:English
/settings timezone:America/New_York
/settings future_min_blocks:3
```

```md
/schedule create count:2 bloc:1w start_time:20:00 len:2h location_elsewhere:Online
```

Follow the wizard to enter event labels, then check results with `/schedule list`.

See [Creating Your First Schedule](creating-your-first-schedule.md) for a detailed walkthrough.
