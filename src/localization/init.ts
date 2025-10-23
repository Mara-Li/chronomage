import i18next from "i18next";
import { resources } from "./types";

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
