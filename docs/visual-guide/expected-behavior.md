## Expected Behavior

### After Creating a Schedule

Within 1 minute:
- Events start appearing in Discord's Events tab
- Check: Server Menu → Events
- Should see first few events created

Over next few minutes:
- Bot creates events until buffer is full
- May create events gradually to avoid rate limits

### When Events Occur

As time passes:
- Events marked as "In Progress" when they start
- Events marked as "Completed" when they end
- Bot creates new events to maintain buffer

### If Bot Goes Offline

What happens:
- Existing events remain in Discord
- New events won't be created
- When bot comes back online, it catches up
