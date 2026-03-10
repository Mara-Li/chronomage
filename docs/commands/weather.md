# /weather

Fetch current weather for a city.

No special permission required.

## Options

- `location` (string, *optional*): city name. If omitted, uses the location from `/variables config weather`
- `timezone` (string, *optional*): IANA time zone for the output display

## Behavior

Replies with a short weather description. If the location cannot be found, the bot replies with an ephemeral error.

> [!TIP]
> ```
> /weather location:London
> /weather location:Paris timezone:Europe/Paris
> ```
