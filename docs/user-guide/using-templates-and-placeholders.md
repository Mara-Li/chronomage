# Using Templates and Placeholders

Templates allow dynamic content in event titles and descriptions.

## Date Template
Configure with:
```
/variables date format:yyyy-LL-dd timezone:Europe/Paris step:1d
```

## Count Template
Configure with:
```
/variables count start:1 step:1 decimal:0 cron:0 0 * * *
```

## Weather Template
Configure with:
```
/variables weather location:London compute_at_start:true
```

### Compute at Start
If `compute_at_start:true`, placeholders are evaluated when the event starts (recommended for weather).
