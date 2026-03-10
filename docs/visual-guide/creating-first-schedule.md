## Creating Your First Schedule

### Step 1: Run the create command

```
/schedule create
```

[SCREENSHOT]

Options that appear:

**Required:**
- `count` — number of different event labels (1–20)
- `bloc` — time between events (e.g., `2d`, `1w`)
- `start_time` — daily start time in HH:MM format
- `len` — event duration (e.g., `2h`)

**Location (choose one):**
- `location_elsewhere` — plain text for external events
- `location_channel` — Voice or Stage channel

**Optional:**
- `start_date` — when to start (defaults to today)
- `timezone` — override server timezone

### Step 2: Fill in the options

Example for a weekly game night:
```
/schedule create
  count: 3
  bloc: 1w
  start_time: 20:00
  len: 3h
  location_elsewhere: Discord Voice
  timezone: America/New_York
```

### Step 3: Submit and use the wizard

After pressing Enter, a wizard message appears. Click **Next** to begin entering labels.

[SCREENSHOT]

For each label (1 through count), a modal appears with three fields:
1. **Label** (required) — event title; placeholders like `{{date}}` are supported
2. **Description** (optional) — appears when users click the event
3. **Banner** (optional) — public image URL

[SCREENSHOT]

Submit each modal. After the last one, the bot confirms the cycle was created.
