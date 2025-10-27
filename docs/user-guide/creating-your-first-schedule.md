# Creating Your First Schedule

### Plan before creating

- Number of labels in the cycle
- Interval between events (bloc)
- Daily start time
- Duration
- Location (channel or external)

### Run the create command

Required options:
- `count`, `bloc`, `start_time`, `len`

Location (choose one): `location_elsewhere` or `location_channel`

Optional: `start_date`, `timezone`

Example:
```
/schedule create count:3 bloc:2d start_time:21:00 len:2h timezone:Europe/Paris location_elsewhere:Online
```

### Complete the wizard

Follow the wizard to enter each label (Label, Description, Banner image). Use placeholders like `{{date}}` and `{{count}}` as needed.

Verify with `/schedule list` after creation.
