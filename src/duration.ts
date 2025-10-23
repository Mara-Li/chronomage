import parse from "parse-duration";
import de from "parse-duration/locale/de.js";
import en from "parse-duration/locale/en.js";
import es from "parse-duration/locale/es.js";
import fr from "parse-duration/locale/fr.js";
import ja from "parse-duration/locale/ja.js";
import pt from "parse-duration/locale/pt.js";
import ru from "parse-duration/locale/ru.js";
import zh from "parse-duration/locale/zh.js";

type Units = typeof parse.unit;

const LOCALES: Record<string, Units> = { en, fr, es, de, pt, ru, ja, zh };

function normalizeLocale(discordLocale?: string): keyof typeof LOCALES {
	const raw = (discordLocale ?? "").toLowerCase(); // ex: "fr", "en-US", "pt-BR"
	const base = raw.split("-")[0]; // "fr", "en", "pt"
	return base in LOCALES ? (base as keyof typeof LOCALES) : "en";
}
export function parseDurationLocalized(input: string, discordLocale?: string): number {
	const prevUnit = parse.unit;
	const localeKey = normalizeLocale(discordLocale);
	parse.unit = LOCALES[localeKey]; // active la locale

	try {
		// Optionnel : tu peux passer une unité de sortie, ex. 'm' pour minutes
		const ms = parse(input); // → number en millisecondes
		if (ms == null) throw new Error(`Durée invalide: "${input}"`);
		return ms;
	} finally {
		parse.unit = prevUnit; // restaure pour ne pas polluer d’autres appels
	}
}
