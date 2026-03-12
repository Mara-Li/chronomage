# /settings
Configure global bot settings for this guild.

Requires: **Manage Events** permission.

## Subcommands
- **`language`** — set the bot language
	- Choices: `English`, `Français`
- **`timezone`** — set the default IANA time zone (e.g., `Europe/Paris`)
- **`future_min_blocks`** — how many future events the bot should always keep created ahead of time (minimum 1, default 2)
- **`autorename_channel`** — enable or disable automatic channel renaming when template values change

> [!NOTE]
> - Language affects bot responses and command descriptions where Discord supports it.
> - `future_min_blocks` controls the buffer size. Higher values mean more events created in advance.
> - `autorename_channel` must be enabled for `/variables channel rename` to take effect.

> [!example]
>
> ```bash
> /settings language:English
> /settings timezone:Europe/Paris
> /settings future_min_blocks:3
> /settings autorename_channel:true
> ```

> [!IMPORTANT]
> Channel auto-rename templates use `§` delimiters.  
> See [`/variables channel`](variables.md#channel) for configuration.
