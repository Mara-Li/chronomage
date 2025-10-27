# /weather
Get the weather for a given city (or the default city from your template).

## Options
- `location` (string, *optional*): city name. If omitted, uses /variables weather location
- `timezone` (string, *optional*): IANA time zone used for the output

## Behavior
Replies with a short description of current weather. If the location cannot be found, the reply is ephemeral with an error.

> [!TIP]
> - `/weather location: London`
> - `/weather location: Paris timezone: Europe/Paris`
