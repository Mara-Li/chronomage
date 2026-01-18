import i18next from "i18next";
import EnglishUS from "./locales/en.json" with { type: "json" };
import French from "./locales/fr.json" with { type: "json" };

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

// Create a dedicated i18next instance so external libs can't overwrite our resources
const i18n = i18next.createInstance();

i18n
	.init({
		lng: "en",
		fallbackLng: "en",
		resources,
		returnNull: false,
		interpolation: {
			escapeValue: false,
		},
	})
	.then(() => {
		// Initialized
	});

export default i18n;
