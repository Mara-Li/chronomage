# Getting Started

## What is Chronomage?

Chronomage is a Discord bot that automatically creates and manages recurring Discord Scheduled Events. Define a pattern once and Chronomage generates future events automatically, rotating through labels you define.

## Key features

- Recurring event automation with configurable block intervals
- Smart buffer: always keeps a configurable number of future events created
- Dynamic placeholders: `{{date}}`, `{{count}}`, `{{weather:*}}`
- Channel auto-rename and auto-message on template updates
- Multiple languages (English and French)
- Guided creation wizard

## Required permissions

The bot requires **Manage Events** to use all schedule and template commands. **Manage Channels** is optional and only needed for auto-channel renaming.

For events in Voice or Stage channels, ensure the bot also has the appropriate channel-level permissions.

## Inviting the bot

Contact the bot administrator for an invite link. The invite must include:
- Scopes: `bot`, `applications.commands`
- Permission: **Manage Events**

## First steps

1. Configure your server: `/settings language:English timezone:America/New_York`
2. Create a schedule: `/schedule create count:2 bloc:1w start_time:20:00 len:2h location_elsewhere:Online`
3. Follow the wizard to enter event labels
4. Check results: `/schedule list`

See the [User Guide](README.md) for detailed instructions on each feature.
