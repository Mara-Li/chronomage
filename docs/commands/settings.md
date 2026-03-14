# /settings
Configure global bot settings for this guild.

## Subcommands
### Server language
> [!usage] `/settings language [language]`
> - **`language`** — English ; Français

### Default timezone
> [!usage]
> `/settings timezone [timezone]`
> - **`timezone`** — IANA time zone names (e.g., `America/New_York`, `Asia/Tokyo`).

### Upcoming events count
Number of future events we always want visible.
It controls the buffer size : Higher values mean more events created in advance.
> [!usage]
> `/settings buffer_size [value]`
> - **`[value]`** — Frequency of the future events the boot keeps created ahead of time.

Increase this for high-frequency schedules.

### Auto-rename channels
Enables automatic renaming of channels configured via `/variables channel rename`.
> [!usage]
> `/settings autorename_channel [?switch]`
> - **`switch`** : Boolean to enable/disable

---

> [!TIP]
> - Language affects bot responses and command descriptions where Discord supports it.
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

To configure template-specific settings (date format, weather city, counter start, etc.), see [Using Templates and Placeholders](using-templates-and-placeholders.md).