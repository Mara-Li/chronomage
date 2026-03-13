# /weather
Fetch current weather for a city.

No special permission required.

> [!usage]
> `/weather (location) (timezone)`
> - `location` (string, *optional*): city name. If omitted, uses the location from `/variables config weather`
> - `timezone` (string, *optional*): IANA time zone for the output display

It will reply with a short weather description. If the location cannot be found, the bot replies with an ephemeral error.

> [!example]
>
> ```
> /weather location:London
> /weather location:Paris timezone:Europe/Paris
> ```
