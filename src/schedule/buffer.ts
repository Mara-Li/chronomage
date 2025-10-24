import {EClient} from "../client";
import {DEFAULT_BUFFER_DAYS, eventKey} from "../interface";
import {DateTime} from "luxon";
import {blockStartAt, labelAt} from "./utils";

export async function ensureBufferForGuild(client: EClient, guildId: string) {
  const g = client.settings.get(guildId);
  if (!g) return;

  const bufferDays = g.settings?.bufferDays ?? DEFAULT_BUFFER_DAYS;
  for (const [scheduleId, s] of Object.entries(g.schedules)) {
    if (!s.active) continue;

    const now = DateTime.now().setZone(s.start.zone);
    const horizon = now.plus({ days: bufferDays });

    let k = s.nextBlockIndex;
    let changed = false;

    while (true) {
      const start = blockStartAt(s, k);
      if (start > horizon) break;

      const startIso = start.toISO()!;
      const key = eventKey(scheduleId, startIso) as keyof typeof g.events;

      if (!g.events[key]) {
        const end = start.plus({ milliseconds: s.lenMs });
        const label = labelAt(s, k);

        // Créer l'event Discord programmé (EXTERNAL par défaut, adapte selon ton usage)
        const guild = client.guilds.cache.get(guildId);
        if (!guild) break;
				
				const description = s.description?.[label]

        const ev = await guild.scheduledEvents.create({
          name: label,
          scheduledStartTime: startIso,
          scheduledEndTime: end.toISO()!,
          privacyLevel: 2, // GUILD_ONLY
          entityType: 3,   // EXTERNAL (ajuste à VOICE/STAGE si besoin)
          entityMetadata: { location:  s.location ?? undefined},
          description,
        });

        g.events[key] = {
          scheduleId,
          discordEventId: ev.id,
          label,
          start: { iso: startIso, zone: s.start.zone },
          lenMs: s.lenMs,
          status: "created",
          createdAt: Date.now(),
        };
        changed = true;
      }

      k += 1;
    }

    if (changed) {
      s.nextBlockIndex = k; // avance le pointeur
      g.schedules[scheduleId] = s;
      client.settings.set(guildId, g);
    }
  }
}

/** Appelé au boot + périodiquement */
export async function ensureBufferAll(client: EClient) {
  for (const [guildId] of client.settings.entries()) {
    await ensureBufferForGuild(client, guildId);
  }
}