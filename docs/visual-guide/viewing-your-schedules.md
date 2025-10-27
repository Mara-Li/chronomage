## Viewing Your Schedules

### Command: `/schedule list`

What you'll see:

If you have schedules:
- List of all your active schedules
- For each schedule:
  - Schedule ID (unique identifier)
  - Bloc duration (e.g., "2 days")
  - Start time (e.g., "21:00")
  - Duration (e.g., "2 hours")
  - Location (channel or external)
  - Number of labels in cycle
  - List of upcoming events (next 3-5)

Example display:
```
- **fiery-breads-like** ✅
   - __Label(s):__
     - `{{weather:emoji}} {{date}} (Jour)`
     - `{{weather:emoji}} {{date}} (Nuit)`
   - __Bloc duration:__ `2 days`
   - __Event's duration:__ `2 days`
   - __Bloc start time :__ `21:45 (Europe/Paris)`
   - __Start date :__ 25-10-2025
   - __Location:__ RP
   - __Created by:__ @User
   - __Description(s):__
     - `{{weather:emoji}} {{date}} (Jour)`: `{{weather:long}}`
     - `{{weather:emoji}} {{date}} (Nuit)`: `{{weather:long}}`
   - __Upcoming events :__
     -   `{{weather:emoji}} {{date}} (Jour)` - 28 octobre 2025 21:45
```