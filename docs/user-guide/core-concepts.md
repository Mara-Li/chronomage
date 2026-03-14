# Core Concepts
## Schedules and cycles
A **schedule** is a repeating pattern that defines:
- **Bloc** — interval between successive events (e.g., every 2 days)
- **Start time** — daily HH:MM when each event begins (e.g., `21:00`)
- **Duration** — length of each event (e.g., `2h`)
- **Labels** — a list of event titles that cycle in order (e.g., [A, B, C] → block 0=A, 1=B, 2=C, 3=A, …)
- **Location** — a Discord Voice/Stage channel or a plain text location

The schedule repeats indefinitely. A background job (running every 5 minutes) maintains the configured number of future events.

## Buffer
The **buffer** is how many future events Chronomage keeps created in Discord at all times. Controlled by `/settings buffer_size` (default: 2). When an event passes, the bot creates a new one to refill the buffer.

## Templates and placeholders
Use placeholders in event labels and descriptions:

| Placeholder | Description |
|---|---|
| `{{date}}` | Current value from the date template |
| `{{count}}` | Current value from the count template |
| `{{weather:emoji}}` | Weather icon |
| `{{weather:short}}` | Short weather description |
| `{{weather:long}}` | Full weather description |

Templates are configured with `/variables config date|count|weather`, see [templates](Templates.md) for more informations.

Each template has a cron schedule that advances its value. Template values can be computed either at event creation time or when the event starts (`compute_at_start`).

## Channel templates
In addition to event placeholders, you can configure channels to be auto-renamed or receive a message whenever a template value changes. Channel templates use `§` delimiters:

`Session §count§ — §date§`

Configure with `/variables channel rename` and `/variables channel send` (see [variables](../commands/variables.md))

## Expected behavior
**After creating a schedule**, within a minute events start appearing in Discord's Events section (Server name → Events). The bot creates events until the buffer is full and may do so gradually to avoid rate limits.

**As events occur**, they are marked "In Progress" when they start and "Completed" when they end. The bot automatically creates new events to refill the buffer.

**If the bot goes offline**, existing Discord events remain. When the bot comes back online it catches up and recreates any missing future events.
