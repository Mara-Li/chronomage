## Setting Up Templates

### Date template

[SCREENSHOT]

```
/variables config date
```

Without options: shows current settings (format, timezone, step, cron, current value).

To configure:
```
/variables config date format:yyyy-LL-dd timezone:America/New_York step:1d
```

The bot replies with a confirmation and an example of how `{{date}}` will render.

### Count template

[SCREENSHOT]

```
/variables config count
```

To configure:
```
/variables config count start_number:1 step:1 decimal:0
```

### Weather template

[SCREENSHOT]

```
/variables config weather
```

To configure:
```
/variables config weather location:London compute_at_start:true
```

### Testing weather

```
/weather location:London
```

Returns current weather — similar to what `{{weather:long}}` will show.

If the location is not found, the bot replies with an ephemeral error. Try adding the country (`London, UK`) or a different spelling.
