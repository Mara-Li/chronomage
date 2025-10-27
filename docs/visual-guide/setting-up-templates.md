## Setting Up Templates

### Date Template

Command:
```
/variables date
```

Without options:
- Shows current date template settings
- Format, timezone, step, cron, etc.
- Shows example output

With options (to configure):
```
/variables date format:yyyy-LL-dd timezone:America/New_York step:1d
```

Response:
- Success message
- Confirmation of new settings
- Example of how `{{date}}` will appear

### Count Template

Command:
```
/variables count
```

Configuration example:
```
/variables count start:1 step:1 decimal:0
```

Response:
- Success message
- Current counter value
- How it will increment

### Weather Template

Command:
```
/variables weather
```

Configuration example:
```
/variables weather location:London compute_at_start:true
```

Response:
- Success message
- Confirmation of location
- Note about compute_at_start setting

### Testing Weather

Command:
```
/weather location:London
```

Response:
- Current weather description for the city
- Temperature and conditions
- Similar to what `{{weather:long}}` will show

If location not found:
- Error message: "Location not found"
- Suggestion to try different spelling
