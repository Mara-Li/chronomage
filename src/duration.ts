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
const LOCALE_KEYS = Object.keys(LOCALES) as Array<keyof typeof LOCALES>;

export function normalizeLocale(discordLocale?: string): keyof typeof LOCALES {
	const raw = (discordLocale ?? "").toLowerCase(); // ex: "fr", "en-US", "pt-BR"
	const base = raw.split("-")[0]; // "fr", "en", "pt"
	return base in LOCALES ? (base as keyof typeof LOCALES) : "en";
}

function parseWithLocale(input: string, locale: keyof typeof LOCALES): number | null {
	parse.unit = LOCALES[locale];
	return parse(input);
}

export function parseDurationLocalized(input: string, discordLocale?: string): number {
	const prevUnit = parse.unit;
	const localeKey = normalizeLocale(discordLocale);
	const tryLocales = [localeKey, ...LOCALE_KEYS.filter((key) => key !== localeKey)];
	try {
		for (const key of tryLocales) {
			parse.unit = LOCALES[key];
			const ms = parse(input);
			if (ms != null) return ms;
		}
		throw new Error(`Invalid duration: "${input}"`);
	} finally {
		parse.unit = prevUnit; // restore to avoid affecting other calls
	}
}
