# Configuration

## Server language
```
/settings language:English
```
Choices: `English`, `Français`

## Default time zone
```
/settings timezone:Europe/Paris
```
Use IANA time zone names (e.g., `America/New_York`, `Asia/Tokyo`).

## Future events buffer
```
/settings future_min_blocks:5
```
How many future events the bot keeps created ahead of time. Increase this for high-frequency schedules.

## Auto-rename channels
```
/settings autorename_channel:true
```
Enables automatic renaming of channels configured via `/variables channel rename`.

---

To configure template-specific settings (date format, weather city, counter start, etc.), see [Using Templates and Placeholders](using-templates-and-placeholders.md).
