# Core Concepts

## Schedules

A schedule is a repeating pattern for events. Define:
- Frequency (e.g., every 2 days)
- Daily start time (e.g., 21:00)
- Duration (e.g., 2 hours)
- Labels/descriptions (cycle)
- Location (channel or external)

## Cycles

A schedule can contain a cycle of labels. The bot rotates through them each occurrence.

## Buffer

The buffer is how many future events Chronomage keeps created at all times (configurable).

## Templates and Placeholders

Use placeholders to insert dynamic content into event names/descriptions:
- `{{date}}`, `{{count}}`, `{{weather:emoji}}`, `{{weather:short}}`, `{{weather:long}}`
