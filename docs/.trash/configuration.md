# Configuration
## Server language
> [!usage]
> `/settings [language]`
> - **`language`**: `English`, `Français`

## Default time zone
> [!usage]
> `/settings [timezone]`
> - **`timezone`** : IANA time zone names (e.g., `America/New_York`, `Asia/Tokyo`).

## Future events buffer
> [!usage]
> `/settings [future_min_blocks]`
> - **`[future_min_blocks]`** : Frequency of the future events the boot keeps created ahead of time.

Increase this for high-frequency schedules.

## Auto-rename channels
> [!usage]
> `/settings [autorename_channel]`
> - **`autorename_channel`** : Boolean to enable/disable

Enables automatic renaming of channels configured via `/variables channel rename`.

---

To configure template-specific settings (date format, weather city, counter start, etc.), see [Using Templates and Placeholders](using-templates-and-placeholders.md).
