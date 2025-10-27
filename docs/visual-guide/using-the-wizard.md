## Using the Wizard

### Step 1: Wizard Start Message

What you'll see:
- Message from Chronomage
- "Schedule Creation Wizard" title
- Information about your schedule (bloc, time, duration)
- **"Next"** button at the bottom

Action:
- Click the "Next" button to begin

### Step 2: Label Entry Modal

What appears:
- A popup form (modal) with the title "Event Label 1 of 3" (or your count)
- Three fields:
  1. **Label** (required) - Event title
  2. **Description** (optional) - Event details
  3. **Banner Image** (optional) - Image URL

Example entries:

Label 1:
```
Label: 🎮 Game Night - Mario Kart Tournament
Description: Join us for an exciting Mario Kart competition! 
             Bring your best racing skills.
Banner Image: https://example.com/mario-kart-banner.png
```

Tips:
- Label is the event name that appears in Discord
- Description appears when users click the event
- Banner image must be a valid URL (optional)
- You can use placeholders like `{{date}}` or `{{count}}`

### Step 3: Submit Each Label

For each label (1 through count):
1. Fill in the modal
2. Click "Submit"
3. Next modal appears automatically
4. Repeat until all labels are entered

Alternative:
- Click "Skip" button to skip a label
- Skip forward/backward buttons may appear

### Step 4: Completion

What happens:
- After the last label is submitted
- Bot shows success message
- "Schedule created successfully!" or similar
- Bot immediately starts creating events
