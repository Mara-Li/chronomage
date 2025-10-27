## Creating Your First Schedule

### Step 1: Start the Create Command

Command:
```
/schedule create
```

You'll see these options appear:

Required (red asterisk):
- `count` - Number of different event labels
- `bloc` - Time between events (e.g., "2d", "1w")
- `start_time` - Daily start time (HH:MM format)
- `len` - Event duration (e.g., "2h")

Location (choose one):
- `location_elsewhere` - For external events (text)
- `location_channel` - For Voice/Stage channels

Optional:
- `start_date` - When to start (defaults to today)
- `timezone` - Override server timezone

### Step 2: Fill in the Options

Example for weekly game night:
```
/schedule create
  count: 3
  bloc: 1w
  start_time: 20:00
  len: 3h
  location_elsewhere: Discord Voice
  timezone: America/New_York
```

Tips:
- Click on each option to fill it in
- Required fields must be completed
- You can press Tab to move between fields

### Step 3: Submit the Command

What happens:
1. Press Enter to submit
2. Bot processes your request
3. A wizard button message appears
