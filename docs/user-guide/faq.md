# Frequently Asked Questions

Q: Can I create events for past dates?

A: No — Chronomage creates future events only. If `start_date` is past, it starts at the next occurrence.

Q: What happens if I delete an event manually?

A: The bot will recreate it to maintain the buffer. Cancel the schedule to prevent recreation.

Q: Can I use multiple schedules?

A: Yes — create as many schedules as needed.

Q: How accurate is weather data?

A: Use `compute_at_start:true` for best accuracy; data is fetched from the weather service at evaluation time.
