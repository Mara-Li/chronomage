import i18next from "i18next";
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

i18next.init({
	lng: "en",
	fallbackLng: "en",
	resources,
	returnNull: false,
	interpolation: {
		escapeValue: false,
	},
});

export default i18next;
