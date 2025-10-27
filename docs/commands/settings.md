# /settings
Configure global bot settings for the guild.

## Subcommands
- `language`: set bot language
	- Choices: English, Français
- `timezone`: set a default IANA time zone (e.g., Europe/Paris)
- `future_min_blocks`: how many future events the bot should always keep created.
- `autorename_channel`: Allow to automatically rename the channel if you use template

> [!NOTE]
> - These settings affect how templates render and how many future events are buffered.
> - Language affects bot messages and command localizations where available.

> [!TIP]
> - `/settings language: English`
> - `/settings timezone: Europe/Paris`
> - `/settings future_min_blocks: 3`
> - `/settings autorename_channel: true`

> [!IMPORTANT]
> In channel, if you want to use the auto-rename settings, you need to use `««weather-emoji»»`, `««weather-long»»`, `««weather-short»»`, `««date»»` and `««count»»`.
