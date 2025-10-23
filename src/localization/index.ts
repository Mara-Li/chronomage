import * as Djs from "discord.js";
import i18next from "i18next";
import { resources } from "./types";

export const t = i18next.getFixedT("en");

export function ln(userLang: Djs.Locale) {
	if (userLang === Djs.Locale.EnglishUS || userLang === Djs.Locale.EnglishGB)
		return i18next.getFixedT("en");
	const localeName = Object.entries(Djs.Locale).find(([name, abbr]) => {
		return name === userLang || abbr === userLang;
	});
	return i18next.getFixedT(localeName?.[1] ?? "en");
}

export function cmdLn(key: string) {
	const localized: Djs.LocalizationMap = {};
	const allValidLocale = Object.entries(Djs.Locale);
	const allTranslatedLanguages = Object.keys(resources).filter(
		(lang) => !lang.includes("en")
	);
	for (const [name, Locale] of allValidLocale) {
		if (allTranslatedLanguages.includes(Locale)) {
			const ul = ln(name as Djs.Locale);
			localized[Locale as Djs.Locale] = ul(key);
		}
	}
	return localized;
}
