import EnglishUS from "./locales/en.json";
import French from "./locales/fr.json";

export const resources = {
	en: {
		translation: EnglishUS,
	},
	fr: {
		translation: French,
	},
};

export enum LocalePrimary {
	// noinspection JSUnusedGlobalSymbols
	French = "Français",
	English = "English",
}
