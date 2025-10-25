import * as Djs from "discord.js";
import type { EventGuildData } from "../interface";
import i18next, { resources } from "./init";

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

export function tFn(
	interactionLocale: Djs.Locale,
	guild: Djs.Guild,
	settings?: EventGuildData
) {
	const locale = getLocale(interactionLocale, guild, settings);
	return { ul: ln(locale), locale };
}

function getLocale(
	interactionLocale: Djs.Locale,
	guild: Djs.Guild,
	settings?: EventGuildData
) {
	return (
		settings?.settings?.language ??
		guild.preferredLocale ??
		interactionLocale ??
		Djs.Locale.EnglishUS
	);
}
